# RubikSolver

Three.js と React を用いて 3×3×3 のルービックキューブを操作できる Web アプリです。
[デモはこちら](https://femon07.github.io/RubikSolver/) から利用できます。

実装は `rubicsolver-app` ディレクトリにあります。次のコマンドで開発サーバーを起動できます。
推奨 Node.js バージョンは **20 以上** です。

```bash
cd rubicsolver-app
npm ci
npm run dev
```

`npm run build` で本番用ビルドを作成します。ビルド後のファイルは `/RubikSolver/` をベースとしたパスで出力されます。ローカルサーバーでも同じパスで公開するか、`vite.config.ts` の `base` オプションを変更して確認してください。

Lint やビルドを実行する前には依存関係をインストールしておく必要があります。次のコマンドで Lint を実行できます。

```bash
npm ci
npm run lint
```

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## GitHub Pages 自動デプロイ

`main` ブランチへの push をトリガーに、GitHub Actions がビルドを行い
GitHub Pages へ自動デプロイします。初回のみリポジトリ設定の
"Pages" で公開ソースを "GitHub Actions" に変更してください。
デプロイの進行状況は GitHub の "Actions" タブから確認でき、完了後数分でページが更新されます。
