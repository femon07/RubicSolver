# RubicSolver
この README の英語版は [README.en.md](README.en.md) を参照してください。

Three.js と React を用いて 3×3×3 のルービックキューブを操作できる Web アプリです。
デバッグを容易にするため、現在は 2D 表示版が既定で動作します。将来的には 3D 表示へ切り替え可能にする予定です。
背景には `public/fractal.svg` を利用した淡いフラクタル模様を使用しています。
ブラウザのダークモード設定に応じて背景色が自動で切り替わります。
[デモはこちら](https://femon07.github.io/RubicSolver/) から利用できます。

ランダムボタンの横に手数を入力する欄があり、指定した回数だけランダムにスクランブルできます。

実装は `rubicsolver-app` ディレクトリにあります。次のコマンドで開発サーバーを起動できます。
推奨 Node.js バージョンは **20 以上** です。

```bash
cd rubicsolver-app
npm ci
npm run dev
```

`npm run build` で本番用ビルドを作成します。
出力時のベースパスは `VITE_BASE_PATH` 環境変数で指定できます。
GitHub Pages へデプロイする場合は `/RubicSolver/` を設定してください。

## キーボードショートカット

```
U: U面を右回転 / Shift+U: U面を左回転
R: R面を右回転 / Shift+R: R面を左回転
F: F面を右回転 / Shift+F: F面を左回転
D: D面を右回転 / Shift+D: D面を左回転
L: L面を右回転 / Shift+L: L面を左回転
B: B面を右回転 / Shift+B: B面を左回転
```

Lint・テスト・ビルドを実行する前には依存関係をインストールしておく必要があります。次の
コマンドで一連のチェックを実行できます。

```bash
npm ci
npm run lint
npm run test
npm run build
```

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## GitHub Pages 自動デプロイ

`main` ブランチへの push をトリガーに、GitHub Actions がビルドを行い
GitHub Pages へ自動デプロイします。初回のみリポジトリ設定の
"Pages" で公開ソースを "GitHub Actions" に変更してください。
デプロイの進行状況は GitHub の "Actions" タブから確認でき、完了後数分でページが更新されます。

## Lint・テスト・ビルド

`pull_request` 発生時に動作する GitHub Actions ワークフロー `Lint, Test and Build` を追加しています。
`npm run lint`、`npm test`、`npm run build` が実行され、成功しないとマージできないようブランチ保護ルールで設定してください。

## ブランチ命名規則

開発用ブランチは `feature/<topic>` 形式で作成してください。
`<topic>` にはタスク内容を表す英数字とハイフンのみを使用し、日本語は含めません。
例: `feature/add-ci`, `feature/fix-bug-123`。
