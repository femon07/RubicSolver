# RubicSolver アプリケーション

Vite と React で構築されたルービックキューブソルバーです。

## 開発サーバー

```bash
npm ci
npm run dev
```

## ビルド

依存関係をインストールした後に実行します。

```bash
npm ci
npm run build
```

本番ビルドは `/RubicSolver/` を基点に生成されます。ローカル環境で確認する場合は
同じパスでサーバーを立てるか、`vite.config.ts` の `base` を変更して調整してくださ
い。

## Lint

依存関係をインストールした後、次のコマンドで Lint を実行できます。

```bash
npm ci
npm run lint
```
