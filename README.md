# 鬼退治 ～手裏剣忍法帖～

和風の縦スクロールシューティング（PWA）。iPhoneのホーム画面に追加して遊べます。

## ファイル構成
- `index.html` … ゲーム本体（HTML・CSS・JavaScriptが全部入り）
- `manifest.json` … アプリ名・アイコンなど、ホーム画面アプリとしての設定
- `sw.js` … オフラインでも遊べるようにする仕組み（Service Worker）
- `icons/` … アプリのアイコン画像

## PCで試す
`index.html` をダブルクリックしてブラウザで開けば遊べます（マウスのドラッグで操作）。

## iPhoneに入れる（GitHub Pages・無料）
1. GitHub（https://github.com）でアカウントを作る
2. 右上の「＋」→「New repository」で、名前を `oni-taiji` などにして **Public** で作成
3. 「uploading an existing file」をクリックし、このフォルダの中身（`index.html`、`manifest.json`、`sw.js`、`icons` フォルダ）をまとめてドラッグ＆ドロップ →「Commit changes」
4. リポジトリの「Settings」→ 左メニュー「Pages」→ Branch を `main` / `/(root)` にして「Save」
5. 1〜2分待つと `https://（ユーザー名）.github.io/oni-taiji/` で公開される
6. iPhoneのSafari（またはChrome）でそのURLを開き、共有ボタン →「ホーム画面に追加」→「Webアプリとして開く」がオンのまま「追加」

## 改造してみよう（index.html の中を探してみる）
- 連射の速さ：`shotTimer = 0.14;`（小さくすると速くなる）
- 敵の出やすさ：`spawnTimer = Math.max(0.25, 0.9 - time / 100);`
- 鬼の硬さ：`hp: 4`
- 命の数：`lives: 3`

改造してGitHubに上げ直したら、`sw.js` の `oni-taiji-v1` を `v2` に変えると、iPhone側も新しい版に入れ替わります。
