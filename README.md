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

## 主なファイル

- `index.html` — UI
- `styles.css` — デザイン
- `app.js` — WebGPU/WASM切替・生成・履歴・添付処理
- `sw.js` — PWAのアプリシェルキャッシュ
- `manifest.webmanifest` — PWA設定

## 注意

MiniCPM5-2BのWebGPU ONNXは大きいため、スマートフォンではGPUメモリ・ブラウザ制約により読み込みに失敗する可能性があります。その場合はWASMフォールバックを使うか、より小さいモデルの追加を検討してください。
