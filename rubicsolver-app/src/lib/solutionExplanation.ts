export function moveToExplanation(move: string): string {
  const faceMap: Record<string, string> = {
    U: '上面',
    D: '下面',
    L: '左面',
    R: '右面',
    F: '前面',
    B: '背面'
  }
  const face = faceMap[move[0]] || ''
  const modifier = move.slice(1)
  let rotation = '時計回りに回してブロックを移動する'
  if (modifier === "'") {
    rotation = '反時計回りに回してブロックを移動する'
  } else if (modifier === '2') {
    rotation = '2回回してブロックを移動する'
  }
  return `${face}を${rotation}`
}

export function generateExplanations(moves: string[]): string[] {
  return moves.map(moveToExplanation)
}
