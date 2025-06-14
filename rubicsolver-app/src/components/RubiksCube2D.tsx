import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import CubeRenderer2D from '../lib/CubeRenderer2D'
import CubeController, { generateScramble } from '../lib/CubeController'
import { executeMoves, wait } from '../lib/moveExecutor'
import { generateExplanations } from '../lib/solutionExplanation'
import { getAlgorithmSteps } from '../lib/algorithmExplanation'
import Cube from 'cubejs'

export const DEFAULT_SCRAMBLE_LENGTH = 10

function RubiksCube2D(_props: unknown, ref: React.Ref<{
  getRendererState: () => string
  getControllerState: () => string
}>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef(new CubeRenderer2D())
  const controllerRef = useRef(new CubeController())
  const [scramble, setScramble] = useState('')
  const [scrambleLength, setScrambleLength] = useState(DEFAULT_SCRAMBLE_LENGTH)
  const [errorMessage, setErrorMessage] = useState('')
  const [cubeState, setCubeState] = useState(controllerRef.current.getState())
  const [solutionSteps, setSolutionSteps] = useState<string[]>([])
  const [solutionExplanations, setSolutionExplanations] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [currentAlgStep, setCurrentAlgStep] = useState(-1)
  const [stepMoves, setStepMoves] = useState<string[][]>([])
  const [showAlgorithm, setShowAlgorithm] = useState(false)
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)
  const algorithmSteps = getAlgorithmSteps()

  useEffect(() => {
    Cube.initSolver()
    rendererRef.current.setCanvas(canvasRef.current)
  }, [])

  useImperativeHandle(ref, () => ({
    getRendererState: () => rendererRef.current.getState(),
    getControllerState: () => controllerRef.current.getState()
  }))

  const exec = async (
    algorithm: string,
    interval = 0
  ) => executeMoves(rendererRef.current, algorithm, interval)

  const runExclusive = useCallback(async (fn: () => Promise<void> | void) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    try {
      await fn()
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [])

  const applyMoveDirect = useCallback(async (move: string) => {
    await rendererRef.current.applyMove(move)
    controllerRef.current.applyMove(move)
    setCubeState(controllerRef.current.getState())
  }, [])

  const applyMove = useCallback(
    async (move: string) => runExclusive(() => applyMoveDirect(move)),
    [runExclusive, applyMoveDirect]
  )

  const handleRandom = async () => {
    await runExclusive(async () => {
      try {
        const alg = generateScramble(scrambleLength)
        setScramble(alg)
        await exec(alg)
        controllerRef.current.executeMoves(alg)
        setCubeState(controllerRef.current.getState())
        setErrorMessage('')
        setSolutionSteps([])
        setSolutionExplanations([])
        setStepMoves([])
        setCurrentStep(-1)
        setCurrentAlgStep(-1)
        setShowAlgorithm(false)
      } catch (err) {
        console.error(err)
        setErrorMessage('スクランブル中にエラーが発生しました')
      }
    })
  }

  const handleReset = () => {
    runExclusive(() => {
      controllerRef.current.reset()
      rendererRef.current.reset()
      setScramble('')
      setCubeState(controllerRef.current.getState())
      setSolutionSteps([])
      setSolutionExplanations([])
      setStepMoves([])
      setCurrentStep(-1)
      setCurrentAlgStep(-1)
      setShowAlgorithm(false)
    })
  }

  const handleSolve = async () => {
    await runExclusive(async () => {
      try {
        const solution = controllerRef.current.solve()
        const moves = solution.split(' ').filter(Boolean)
        setShowAlgorithm(true)
        const perStep = Math.ceil(moves.length / algorithmSteps.length)
        const grouped: string[][] = []
        for (let i = 0; i < algorithmSteps.length; i++) {
          grouped.push(moves.slice(i * perStep, (i + 1) * perStep))
        }
        setStepMoves(grouped)
        setSolutionSteps(moves)
        setSolutionExplanations(generateExplanations(moves))
        for (let i = 0; i < moves.length; i++) {
          setCurrentStep(i)
          setCurrentAlgStep(Math.min(Math.floor(i / perStep), algorithmSteps.length - 1))
          await applyMoveDirect(moves[i])
          if (process.env.NODE_ENV !== 'test') {
            await wait(300)
          }
        }
        setCurrentStep(-1)
        setCurrentAlgStep(-1)
        setSolutionSteps([])
        setSolutionExplanations([])
        setCubeState(controllerRef.current.getState())
        setErrorMessage('')
      } catch (err) {
        console.error(err)
        setErrorMessage('解法実行中にエラーが発生しました')
      }
    })
  }

  return (
    <div>
      <canvas ref={canvasRef} width={360} height={270} />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleReset} disabled={busy}>再描画</button>
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
        <button onClick={handleRandom} style={{ marginLeft: 8 }} disabled={busy}>
          ランダム
        </button>
        <button onClick={handleSolve} style={{ marginLeft: 8 }} disabled={busy}>
          そろえる
        </button>
        <div style={{ marginTop: 8 }}>
          {['U', 'D', 'L', 'R', 'F', 'B'].map((f) => (
            <span key={f} style={{ marginRight: 4 }}>
              <button
                id={`rotate-${f}-counter`}
                data-test={`rotate-${f}-counter`}
                onClick={() => applyMove(`${f}'`)}
                disabled={busy}
              >
                {f} ←
              </button>
              <button
                id={`rotate-${f}-clockwise`}
                data-test={`rotate-${f}-clockwise`}
                onClick={() => applyMove(f)}
                style={{ marginLeft: 2 }}
                disabled={busy}
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
        {solutionSteps.length > 0 && (
          <>
            <div data-testid="solution-steps" style={{ marginTop: 8 }}>
              {solutionSteps.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    marginRight: 4,
                    color: idx === currentStep ? 'red' : undefined,
                    fontWeight: idx === currentStep ? 'bold' : undefined
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            {currentStep >= 0 && (
              <div data-testid="solution-explanation" style={{ marginTop: 4 }}>
                {solutionExplanations[currentStep]}
              </div>
            )}
          </>
        )}
        <div data-testid="cube-state" style={{ display: 'none' }}>
          {cubeState}
        </div>
        {showAlgorithm && (
          <div data-testid="algorithm-explanation" style={{ marginTop: 8 }}>
            <div>このアプリでは次の手順でキューブをそろえます:</div>
            <ol>
              {algorithmSteps.map((s, idx) => (
                <li
                  key={idx}
                  style={{
                    backgroundColor: idx === currentAlgStep ? '#ffeaa7' : undefined,
                    fontWeight: idx === currentAlgStep ? 'bold' : undefined,
                    marginBottom: 4
                  }}
                >
                  <div>{idx + 1}. {s}</div>
                  <div>
                    {stepMoves[idx]?.map((m, mi) => (
                      <span key={mi} style={{ marginRight: 4 }}>{m}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        {errorMessage && <div style={{ marginTop: 8, color: 'red' }}>{errorMessage}</div>}
      </div>
    </div>
  )
}

export default forwardRef(RubiksCube2D)
export { generateScramble }
