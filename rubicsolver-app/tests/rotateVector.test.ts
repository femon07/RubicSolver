import { rotateVector } from '../src/components/RubiksCube';
import * as THREE from 'three';

test('90度回転後の座標が整数となる', () => {
  const v = new THREE.Vector3(1, 0, 0);
  const rotated = rotateVector(v, 'y', Math.PI / 2);
  expect(rotated.x).toBeCloseTo(0);
  expect(rotated.z).toBeCloseTo(-1);
});
