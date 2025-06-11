# RubicSolver アプリケーション

Vite と React で構築されたルービックキューブソルバーです。
推奨 Node.js バージョンは **20 以上** です。

## 開発サーバー

```bash
npm ci
npm run dev
```

## ビルド

```bash
npm run build
```

本番ビルドは `/RubicSolver/` を基点に生成されます。ローカル環境で確認する場合は
同じパスでサーバーを立てるか、`vite.config.ts` の `base` を変更して調整してくださ
い。
