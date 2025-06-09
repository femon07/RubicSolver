import { Canvas } from '@react-three/fiber'
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

function RubiksCube() {
  const groupRef = useRef<THREE.Group>(null)
  const cubiesRef = useRef<Cubie[]>([])
  const cubeRef = useRef(new Cube())
  const [scramble, setScramble] = useState('')

  // キューブを初期化
  useEffect(() => {
    if (!groupRef.current) return
    const g = groupRef.current
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
  }, [])

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
      selected.forEach((c) => rotationGroup.attach(c.mesh))
      groupRef.current!.add(rotationGroup)
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
    })
  }

  // ランダムにスクランブルする
  const handleRandom = async () => {
    Cube.initSolver()
    const alg = Cube.scramble()
    setScramble(alg)
    cubeRef.current = new Cube()
    await executeMoves(alg)
    cubeRef.current.move(alg)
  }

  // 現在の状態を解く
  const handleSolve = async () => {
    Cube.initSolver()
    const solution = cubeRef.current.solve()
    await executeMoves(solution)
    cubeRef.current.move(solution)
  }

  return (
    <div>
      <Canvas style={{ height: 400 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group ref={groupRef} />
      </Canvas>
      <div style={{ marginTop: 10 }}>
        <button onClick={handleRandom}>ランダム</button>
        <button onClick={handleSolve} style={{ marginLeft: 8 }}>
          そろえる
        </button>
        <div style={{ marginTop: 8 }}>スクランブル: {scramble}</div>
      </div>
    </div>
  )
}

export default RubiksCube
