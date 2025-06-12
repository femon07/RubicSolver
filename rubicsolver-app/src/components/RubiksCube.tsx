import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import CubeController, { generateScramble } from '../lib/CubeController'
import CubeRenderer from '../lib/CubeRenderer'
import Cube from 'cubejs'

function RubiksCube() {
  const rendererRef = useRef(new CubeRenderer())
  const controllerRef = useRef(new CubeController())
  const [scramble, setScramble] = useState('')
  const [scrambleLength, setScrambleLength] = useState(20)
  const [errorMessage, setErrorMessage] = useState('')
  const [cubeState, setCubeState] = useState(controllerRef.current.getState())

  useEffect(() => {
    Cube.initSolver()
  }, [])

  const setGroupRef = (node: THREE.Group | null) => {
    rendererRef.current.setGroup(node)
  }

  const executeMoves = async (algorithm: string) => {
    const moves = algorithm.split(' ').filter(Boolean)
    for (const move of moves) {
      await rendererRef.current.applyMove(move)
    }
  }

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
    setScramble('')
    rendererRef.current.reset()
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
      <Canvas camera={{ position: [5, 5, 5], fov: 40 }} style={{ height: 500, width: '100%' }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group ref={setGroupRef} />
        <OrbitControls />
      </Canvas>
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
        <div style={{ marginTop: 8 }}>スクランブル: {scramble}</div>
        <div data-testid="cube-state" style={{ display: 'none' }}>
          {cubeState}
        </div>
        {errorMessage && <div style={{ marginTop: 8, color: 'red' }}>{errorMessage}</div>}
      </div>
    </div>
  )
}

export default RubiksCube
export { generateScramble }
