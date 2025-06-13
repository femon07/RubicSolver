import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import CubeRenderer2D from '../lib/CubeRenderer2D'
import CubeController, { generateScramble } from '../lib/CubeController'
import Cube from 'cubejs'

function RubiksCube2D(_props: unknown, ref: React.Ref<{
  getRendererState: () => string
  getControllerState: () => string
}>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef(new CubeRenderer2D())
  const controllerRef = useRef(new CubeController())
  const [scramble, setScramble] = useState('')
  const [scrambleLength, setScrambleLength] = useState(20)
  const [errorMessage, setErrorMessage] = useState('')
  const [cubeState, setCubeState] = useState(controllerRef.current.getState())

  useEffect(() => {
    Cube.initSolver()
    rendererRef.current.setCanvas(canvasRef.current)
  }, [])

  useImperativeHandle(ref, () => ({
    getRendererState: () => rendererRef.current.getState(),
    getControllerState: () => controllerRef.current.getState()
  }))

  const executeMoves = async (algorithm: string) => {
    const moves = algorithm.split(' ').filter(Boolean)
    for (const move of moves) {
      await rendererRef.current.applyMove(move)
    }
  }

  const applyMove = useCallback(async (move: string) => {
    await rendererRef.current.applyMove(move)
    controllerRef.current.applyMove(move)
    setCubeState(controllerRef.current.getState())
  }, [])

  const handleRandom = async () => {
    try {
      const alg = generateScramble(scrambleLength)
      setScramble(alg)
      controllerRef.current.reset()
      rendererRef.current.reset()
      await executeMoves(alg)
      controllerRef.current.executeMoves(alg)
      setCubeState(controllerRef.current.getState())
      setErrorMessage('')
    } catch (err) {
      console.error(err)
      setErrorMessage('スクランブル中にエラーが発生しました')
    }
  }

  const handleReset = () => {
    controllerRef.current.reset()
    rendererRef.current.reset()
    setScramble('')
    setCubeState(controllerRef.current.getState())
  }

  const handleSolve = async () => {
    try {
      const solution = controllerRef.current.solve()
      await executeMoves(solution)
      controllerRef.current.executeMoves(solution)
      setCubeState(controllerRef.current.getState())
      setErrorMessage('')
    } catch (err) {
      console.error(err)
      setErrorMessage('解法実行中にエラーが発生しました')
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} width={360} height={270} />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleReset}>再描画</button>
        <label style={{ marginLeft: 8 }}>
          手数:
          <input
            type="number"
            min={1}
            value={scrambleLength}
            onChange={(e) => setScrambleLength(Number(e.target.value))}
            style={{ width: 60, marginLeft: 4 }}
          />
        </label>
        <button onClick={handleRandom} style={{ marginLeft: 8 }}>
          ランダム
        </button>
        <button onClick={handleSolve} style={{ marginLeft: 8 }}>
          そろえる
        </button>
        <div style={{ marginTop: 8 }}>
          {['U', 'D', 'L', 'R', 'F', 'B'].map((f) => (
            <span key={f} style={{ marginRight: 4 }}>
              <button
                id={`rotate-${f}-counter`}
                data-test={`rotate-${f}-counter`}
                onClick={() => applyMove(`${f}'`)}
              >
                {f} ←
              </button>
              <button
                id={`rotate-${f}-clockwise`}
                data-test={`rotate-${f}-clockwise`}
                onClick={() => applyMove(f)}
                style={{ marginLeft: 2 }}
              >
                {f} →
              </button>
            </span>
          ))}
        </div>
        <details style={{ marginTop: 8 }}>
          <summary>ショートカット一覧</summary>
          <pre style={{ textAlign: 'left' }}>
U: U面を右回転 / Shift+U: U面を左回転
R: R面を右回転 / Shift+R: R面を左回転
F: F面を右回転 / Shift+F: F面を左回転
D: D面を右回転 / Shift+D: D面を左回転
L: L面を右回転 / Shift+L: L面を左回転
B: B面を右回転 / Shift+B: B面を左回転
          </pre>
        </details>
        <div style={{ marginTop: 8 }}>スクランブル: {scramble}</div>
        <div data-testid="cube-state" style={{ display: 'none' }}>
          {cubeState}
        </div>
        {errorMessage && <div style={{ marginTop: 8, color: 'red' }}>{errorMessage}</div>}
      </div>
    </div>
  )
}

export default forwardRef(RubiksCube2D)
export { generateScramble }
