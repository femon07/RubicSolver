export default interface ICubeRenderer {
  applyMove(move: string): Promise<void>;
  getState(): string;
  reset(): void;
  dispose(): void;
}
