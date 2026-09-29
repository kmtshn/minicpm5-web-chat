# MiniCPM Web Chat — WebGPU Edition

ブラウザだけで動くローカルAIチャットです。GitHub Pagesでそのまま配信でき、APIキーは不要です。

## 2026 WebGPU版の構成

- **MiniCPM5-2B（テキスト）**
  - 第一選択: `Transformers.js 4.3.0`
  - モデル: `RASMUS/MiniCPM5-2B-ONNX`
  - 実行: `ONNX Runtime WebGPU`
  - dtype: `q4f16`
  - WebGPU + `shader-f16` 必須
  - 初回ダウンロード目安: 約1.83GB
- **フォールバック**
  - WebGPU / shader-f16 が使えない場合、`wllama` + `MiniCPM5-2B-GGUF` へ自動切替
- **MiniCPM-V 4.6（画像）**
  - 現時点では `wllama` + GGUF
  - 画像付き入力をAUTOで選ぶと自動切替
- **ローカル保存**
  - 会話: IndexedDB
  - モデル: ブラウザ / ランタイム側キャッシュ
- **PWA**
  - GitHub Pagesからインストール可能

## Ternary Bonsai 4B（ブラウザwllama）

モデル選択で **Ternary Bonsai 4B** を選ぶと、既存のwllama経路でテキスト推論を実行できます。

- 配布元: [prism-ml/Ternary-Bonsai-4B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-4B-gguf)
- 使用ファイル: `Ternary-Bonsai-4B-Q2_0_g64.gguf`（公式Q2_0 / group-64、約1.14GB）
- 実行ランタイム: `@wllama/wllama@3.6.1`（WebGPU対応時はGPU層を優先、非対応時はWASM CPU）
- Bonsaiでは速度優先のため内部thinkingを無効化
- モデルロード後、Backend欄にwllamaのGPU対応状態とスレッド数を表示
- `Q2_0_g64` はmainline互換の形式です。旧来のgroup-128 `Ternary-Bonsai-4B-Q2_0.gguf` は新しいランタイムでは使いません。
- より小さい `PQ2_0` はPrismML fork向けの形式なので、ブラウザ版では配布していません。
- 4GB RAM端末（Galaxy A25 5Gを想定）では、Bonsai選択時にContextを **2048** へ自動設定します。手動変更した場合はその値を維持します。

画像を添付した場合は、従来どおりAUTOまたはMiniCPM-V 4.6を使ってください。Ternary Bonsai 4Bはテキスト専用です。

## 推奨環境

最優先は最新の Chrome / Edge（Chromium系）です。

テキストをWebGPUで動かすには、ブラウザで `navigator.gpu` が利用でき、GPU adapterが `shader-f16` featureを公開している必要があります。
非対応時は自動でWASM版へフォールバックします。

## プライバシー

会話本文を外部AI APIへ送信しません。

ただし初回実行時は次の配布元からモデルやJavaScript実行資産を取得します。

- Hugging Face
- jsDelivr

モデル取得後もブラウザのキャッシュ削除などで再取得が必要になる場合があります。

## GitHub Pages

`main` ブランチをPages公開する場合は通常どおりルート `/` を指定してください。

## Cloudflare Pages版（推奨）

GitHub Pagesでは設定できないCOOP / COEPヘッダーを、Cloudflare Pagesの`_headers`で付与します。これにより、wllamaがSharedArrayBufferを使える環境ではマルチスレッド実行へ切り替えられます。

追加したファイル:

- `_headers` — Cloudflare Pages用のCross-Origin Isolation設定
- `wrangler.jsonc` — ルートをそのままPagesへ公開する設定

CloudflareダッシュボードのGit連携でこのリポジトリを接続し、ビルドコマンドなし・出力ディレクトリ `.` で公開できます。Direct Uploadの場合は、必ずこのリポジトリのルートへ移動してから実行してください。`C:\\Users\\user`などホームディレクトリで `.` を指定すると、ホーム内の大容量ファイルまでアップロード対象になります。

```powershell
cd C:\\path\\to\\minicpm5-web-chat
npx wrangler pages project create minicpm5-web-chat
npx wrangler pages deploy . --project-name=minicpm5-web-chat
```

公開後、ブラウザの開発者コンソールで `crossOriginIsolated === true` を確認し、アプリのBackend欄が `SharedArrayBuffer有効` になっていることを確認してください。Cloudflare PagesのDirect Upload手順は[公式ドキュメント](https://developers.cloudflare.com/pages/get-started/direct-upload/)を参照してください。
## 主なファイル

- `index.html` — UI
- `styles.css` — デザイン
- `app.js` — WebGPU/WASM切替・生成・履歴・添付処理
- `sw.js` — PWAのアプリシェルキャッシュ
- `manifest.webmanifest` — PWA設定

## 注意

MiniCPM5-2BのWebGPU ONNXは大きいため、スマートフォンではGPUメモリ・ブラウザ制約により読み込みに失敗する可能性があります。その場合はWASMフォールバックを使うか、Galaxy A25 5Gなど4GB RAM端末ではTernary Bonsai 4B（Context 2048）を選んでください。
