import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react'
import * as THREE from 'three'
import CubeController, { generateScramble } from '../lib/CubeController'
import CubeRenderer from '../lib/CubeRenderer'
import { executeMoves } from '../lib/moveExecutor'

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [6, 5, 6]
export const DEFAULT_SCRAMBLE_LENGTH = 10
import Cube from 'cubejs'

function SceneGrabber({ sceneRef }: { sceneRef: React.MutableRefObject<THREE.Scene | null> }) {
  const { scene } = useThree()
  useEffect(() => {
    sceneRef.current = scene
  }, [scene])
  return null
}

function RubiksCube(
  _props: unknown,
  ref: React.Ref<{
    getRendererState: () => string
    getControllerState: () => string
  }>
) {
  const rendererRef = useRef(new CubeRenderer())
  const controllerRef = useRef(new CubeController())
  const sceneRef = useRef<THREE.Scene | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const [scramble, setScramble] = useState('')
  const [scrambleLength, setScrambleLength] = useState(DEFAULT_SCRAMBLE_LENGTH)
  const [errorMessage, setErrorMessage] = useState('')
  const [cubeState, setCubeState] = useState(controllerRef.current.getState())
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Cube.initSolver()
  }, [])

  useImperativeHandle(ref, () => ({
    getRendererState: () => rendererRef.current.getState(),
    getControllerState: () => controllerRef.current.getState(),
    initRenderer: () => rendererRef.current.setGroup(new THREE.Group())
  }))



  const setGroupRef = (node: THREE.Group | null) => {
    groupRef.current = node
    rendererRef.current.setGroup(node)
  }

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

  const applyMoves = useCallback(
    async (moves: string[]) =>
      runExclusive(async () => {
        for (const m of moves) {
          await applyMoveDirect(m)
        }
      }),
    [runExclusive, applyMoveDirect]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      const map: Record<string, string> = {
        u: 'U',
        U: "U'",
        r: 'R',
        R: "R'",
        f: 'F',
        F: "F'",
        d: 'D',
        D: "D'",
        l: 'L',
        L: "L'",
        b: 'B',
        B: "B'"
      }
      const move = map[key]
      if (move) {
        e.preventDefault()
        applyMove(move)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.cubeModel = { applyMoves }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      delete window.cubeModel
    }
  }, [applyMove, applyMoves])

  const handleRandom = async () => {
    await runExclusive(async () => {
      try {
        const alg = generateScramble(scrambleLength)
        setScramble(alg)
        await exec(alg)
        controllerRef.current.executeMoves(alg)
        setCubeState(controllerRef.current.getState())
        setErrorMessage('')
      } catch (err) {
        console.error(err)
        setErrorMessage('スクランブル中にエラーが発生しました')
      }
    })
  }

  const handleReset = () => {
    runExclusive(() => {
      controllerRef.current.reset()
      setScramble('')
      if (sceneRef.current && groupRef.current) {
        sceneRef.current.remove(groupRef.current)
        rendererRef.current.dispose()
        const newGroup = new THREE.Group()
        sceneRef.current.add(newGroup)
        groupRef.current = newGroup
        rendererRef.current.setGroup(newGroup)
      } else {
        rendererRef.current.dispose()
        rendererRef.current.reset()
      }
      setCubeState(controllerRef.current.getState())
    })
  }

  const handleSolve = async () => {
    await runExclusive(async () => {
      try {
        const solution = controllerRef.current.solve()
        await exec(solution, 1000)
        controllerRef.current.executeMoves(solution)
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
      <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: 40 }} style={{ height: 600, width: '100%' }}>
        <SceneGrabber sceneRef={sceneRef} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group ref={setGroupRef} />
        <OrbitControls />
      </Canvas>
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
        <div data-testid="cube-state" style={{ display: 'none' }}>
          {cubeState}
        </div>
        {errorMessage && <div style={{ marginTop: 8, color: 'red' }}>{errorMessage}</div>}
      </div>
    </div>
  )
}

export default forwardRef(RubiksCube)
export { generateScramble }
