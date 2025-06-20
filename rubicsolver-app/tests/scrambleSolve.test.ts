import { generateScramble } from '../src/lib/CubeController';
import { AXIS_GROUPS } from '../src/constants/axisGroups';
import Cube from 'cubejs';

// スクランブル生成のテスト
it('generateScramble が指定手数のスクランブルを生成する', () => {
  const alg = generateScramble(10);
  const moves = alg.split(' ').filter(Boolean);
  expect(moves).toHaveLength(10);
  for (const move of moves) {
    expect(move).toMatch(/^[UDLRFB](2|'|)?$/);
  }
});

// 同じ軸が連続しないか確認
it('generateScramble で連続して同じ軸を選ばない', () => {
  const alg = generateScramble(20);
  const moves = alg.split(' ').filter(Boolean);
  let prevAxis = '';
  for (const move of moves) {
    const axis = AXIS_GROUPS[move[0] as keyof typeof AXIS_GROUPS];
    if (prevAxis) {
      expect(axis).not.toBe(prevAxis);
    }
    prevAxis = axis;
  }
});

// スクランブル後に solve を実行して元に戻るかを確認
it('Cube.solve でスクランブル状態から復元できる', () => {
  Cube.initSolver();
  const cube = new Cube();
  const scramble = generateScramble(10);
  cube.move(scramble);
  const solution = cube.solve();
  cube.move(solution);
  expect(cube.isSolved()).toBe(true);
});
