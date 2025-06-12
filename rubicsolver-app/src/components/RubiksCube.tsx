import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import Cube from 'cubejs'
import { gsap } from 'gsap'

// 各キューブの小さいブロックを管理する型
interface Cubie {
  mesh: THREE.Mesh
  position: THREE.Vector3
}

// 指定軸を中心にベクトルを回転させるユーティリティ
function rotateVector(v: THREE.Vector3, axis: 'x' | 'y' | 'z', angle: number) {
  const m = new THREE.Matrix4()
  if (axis === 'x') m.makeRotationX(angle)
  if (axis === 'y') m.makeRotationY(angle)
  if (axis === 'z') m.makeRotationZ(angle)
  return v.clone().applyMatrix4(m)
}


// 各面の色設定
const faceColors = {
  U: '#ffffff',
  D: '#ffff00',
  L: '#ff8000',
  R: '#ff0000',
  F: '#00ff00',
  B: '#0000ff'
}

// 1つのキューブに貼るマテリアルを生成
function createCubieMaterials() {
  const colors = [faceColors.R, faceColors.L, faceColors.U, faceColors.D, faceColors.F, faceColors.B]
  const materials = colors.map((color) => new THREE.MeshStandardMaterial({ color }))
  return materials
}

// 指定した手数のスクランブルを生成する
function generateScramble(length: number) {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B']
  const modifiers = ['', "'", '2']
  const alg: string[] = []
  let prev = ''
  for (let i = 0; i < length; i++) {
    let face = faces[Math.floor(Math.random() * faces.length)]
    while (face === prev) {
      face = faces[Math.floor(Math.random() * faces.length)]
    }
    prev = face
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)]
    alg.push(face + mod)
  }
  return alg.join(' ')
}

function RubiksCube() {
  const groupRef = useRef<THREE.Group>(null)
  const cubiesRef = useRef<Cubie[]>([])
  const cubeRef = useRef(new Cube())
  const initialized = useRef(false)
  const [scramble, setScramble] = useState('')
  const [scrambleLength, setScrambleLength] = useState(20)
  const [errorMessage, setErrorMessage] = useState('')

  // コンポーネント初回マウント時にソルバーを初期化
  useEffect(() => {
    Cube.initSolver()
  }, [])

  // キューブを初期化する共通処理
  const initCube = () => {
    if (!groupRef.current) return
    const g = groupRef.current
    // 既存の子要素を削除
    while (g.children.length) {
      g.remove(g.children[0])
    }
    const cubies: Cubie[] = []
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98)
          const materials = createCubieMaterials()
          const mesh = new THREE.Mesh(geometry, materials)
          mesh.position.set(x, y, z)
          g.add(mesh)
          cubies.push({ mesh, position: new THREE.Vector3(x, y, z) })
        }
      }
    }
    cubiesRef.current = cubies
  }

  // Canvas が準備できたタイミングで初期化を行う
  const setGroupRef = (node: THREE.Group | null) => {
    groupRef.current = node
    if (node && !initialized.current) {
      initCube()
      initialized.current = true
    }
  }


  // アルゴリズム文字列を順番に実行する
  const executeMoves = async (algorithm: string) => {
    const moves = algorithm.split(' ').filter(Boolean)
    for (const move of moves) {
      await applyMove(move)
    }
  }

  // 1手の回転を実行してアニメーションする
  const applyMove = (move: string) => {
    return new Promise<void>((resolve) => {
      try {
        if (!groupRef.current) return resolve()
        const face = move[0] as 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
        const modifier = move.length > 1 ? move[1] : ''
        const axisMap: Record<string, { axis: 'x' | 'y' | 'z'; layer: number; dir: 1 | -1 }> = {
          U: { axis: 'y', layer: 1, dir: 1 },
          D: { axis: 'y', layer: -1, dir: -1 },
          R: { axis: 'x', layer: 1, dir: 1 },
          L: { axis: 'x', layer: -1, dir: -1 },
          F: { axis: 'z', layer: 1, dir: 1 },
          B: { axis: 'z', layer: -1, dir: -1 }
        }
        const { axis, layer, dir } = axisMap[face]
        let angle = (Math.PI / 2) * dir
        if (modifier === "'") angle *= -1
        if (modifier === '2') angle *= 2

        const selected = cubiesRef.current.filter((c) => Math.round(c.position[axis]) === layer)
        const rotationGroup = new THREE.Group()
        rotationGroup.position[axis] = layer
        groupRef.current!.add(rotationGroup)
        selected.forEach((c) => rotationGroup.attach(c.mesh))
        const params: Record<'x' | 'y' | 'z', number> = { x: 0, y: 0, z: 0 }
        params[axis] = angle
        gsap.to(rotationGroup.rotation, {
          ...params,
          duration: 0.3,
          onComplete: () => {
            rotationGroup.updateMatrixWorld()
            selected.forEach((c) => {
              c.mesh.applyMatrix4(rotationGroup.matrix)
              const v = rotateVector(c.position, axis, angle)
              c.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
              groupRef.current!.attach(c.mesh)
            })
            groupRef.current!.remove(rotationGroup)
            resolve()
          }
        })
      } catch (err) {
        console.error(err)
        setErrorMessage('操作中にエラーが発生しました')
        resolve()
      }
    })
  }

  // ランダムにスクランブルする
  const handleRandom = async () => {
    try {
      const alg = generateScramble(scrambleLength)
      setScramble(alg)
      cubeRef.current = new Cube()
      await executeMoves(alg)
      cubeRef.current.move(alg)
      setErrorMessage('')
    } catch (err) {
      console.error(err)
      setErrorMessage('スクランブル中にエラーが発生しました')
    }
  }

  // キューブを再描画する
  const handleReset = () => {
    cubeRef.current = new Cube()
    setScramble('')
    initCube()
  }

  // 現在の状態を解く
  const handleSolve = async () => {
    try {
      const solution = cubeRef.current.solve()
      await executeMoves(solution)
      cubeRef.current.move(solution)
      setErrorMessage('')
    } catch (err) {
      console.error(err)
      setErrorMessage('解法実行中にエラーが発生しました')
    }
  }

  return (
    <div>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 40 }}
        style={{ height: 500, width: '100%' }}
      >
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
        {errorMessage && (
          <div style={{ marginTop: 8, color: 'red' }}>{errorMessage}</div>
        )}
      </div>
    </div>
  )
}

export default RubiksCube
export { generateScramble }
