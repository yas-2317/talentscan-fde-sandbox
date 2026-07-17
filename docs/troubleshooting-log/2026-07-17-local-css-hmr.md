# 2026-07-17｜ローカルだけ新しいCSSが反映されない

## 症状

- Vercel公開版では新しい学習ログ画面が正しく表示された。
- localhostでは新しいHTMLの内容は見えるが、レイアウトや装飾が崩れていた。
- ロゴが`FFDE LearningBuild the foundation`のようにつながり、ログ一覧も縦に並ぶだけだった。

## 期待する状態

localhostとVercel公開版が、同じcommitのHTMLとCSSを使って同じデザインを表示する。

## 原因

デプロイ前から起動し続けていたNext.js開発サーバーで、TurbopackのHMRが古いCSS bundleを保持していた。HTMLは最新版へ更新された一方、CSSだけが旧版のまま配信され、世代が不一致になっていた。

ソースコードやGit commitの差が原因ではなかった。ローカルと`origin/main`は同じmerge commit `a346749`を指していた。

## 確認した証拠

再起動前にlocalhostが配信していたCSSは14,904 bytesで、次の新しいクラスが含まれていなかった。

```text
.archive-layout
.timeline-row
```

開発サーバー再起動後のCSSは32,556 bytesになり、次のクラスを確認できた。

```text
.archive-layout
.learning-brand
.learning-header
.timeline-row
```

HTMLには再起動前から`Learning Archive`や`timeline-row`が存在していたため、「新しいHTMLと古いCSSの組み合わせ」と切り分けられた。

## 解決方法

起動中のNext.js開発サーバーを停止し、プロジェクトルートで再起動した。

```bash
pnpm dev
```

その後、必要に応じてブラウザを`Command + Shift + R`で強制再読み込みする。

## 再発時の確認手順

1. `git status`と`git rev-parse HEAD`でソースの状態を確認する。
2. localhostのHTMLに新しいclass名が存在するか確認する。
3. localhostが配信するCSSに同じclass名が存在するか確認する。
4. HTMLだけ新しくCSSが古い場合は、開発サーバーを再起動する。
5. 改善しなければブラウザを強制再読み込みする。
6. それでも直らない場合に`.next`キャッシュやCSS importを調査する。

最初から`.next`を削除するのではなく、まず影響の小さい開発サーバー再起動から試す。

## 関連キーワード

- localhostとVercelの表示差
- CSSが効かない
- HTMLは新しいがスタイルが古い
- Next.js
- Turbopack
- HMR
- CSS bundle
- 開発サーバー再起動
- ブラウザの強制再読み込み
