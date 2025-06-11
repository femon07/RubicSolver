# RubicSolver

Three.js と React を用いて 3×3×3 のルービックキューブを操作できる Web アプリです。  
[デモはこちら](https://femon07.github.io/RubicSolver/) から利用できます。

実装は `rubicsolver-app` ディレクトリにあります。次のコマンドで開発サーバーを起動できます。

```bash
cd rubicsolver-app
npm ci
npm run dev
```

`npm run build` で本番用ビルドを作成します。ビルド後のファイルは `/RubicSolver/`
をベースとしたパスで出力されます。ローカルサーバーでも同じパスで公開するか、
`vite.config.ts` の `base` オプションを変更して確認してください。

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## GitHub Pages 自動デプロイ

`main` ブランチへの push をトリガーに、GitHub Actions がビルドを行い
GitHub Pages へ自動デプロイします。初回のみリポジトリ設定の
"Pages" で公開ソースを "GitHub Actions" に変更してください。
デプロイの進行状況は GitHub の "Actions" タブから確認でき、完了後数分でページが更新されます。

## ビルドサイズの調査と分割

`vite.config.ts` では `manualChunks` と `rollup-plugin-visualizer` を利用して
依存ライブラリを個別のチャンクに分割しています。`npm run build` を実行すると
`dist/stats.html` が生成され、各ライブラリのサイズを確認できます。

調査の結果、`three` が約 740 kB、`react` 系が約 300 kB、`gsap` が約 70 kB と
特に大きく、その他の依存は数十 kB 程度でした。`three` は描画処理の都合上
置き換えが難しいためそのままとし、必要に応じて動的 `import()` を用いること
で初期ロードを抑えています。
