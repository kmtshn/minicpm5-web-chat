# MiniCPM5 Web Chat

GitHub Pages上で動作する、APIキー不要のMiniCPM5-2Bチャットです。

## 特徴

- OpenAI APIなどの外部AI APIは不使用
- APIキー不要
- 推論はブラウザ内で実行
- MiniCPM5-2B GGUF `Q4_K_M` を使用
- 初回モデルダウンロード後はブラウザキャッシュを利用
- スマートフォン向けUI
- GitHub Pagesのみで公開可能

## 使用モデル

- Model: `openbmb/MiniCPM5-2B-GGUF`
- File: `MiniCPM5-2B-Q4_K_M.gguf`
- Size: 約1.56GB

モデル自体はHugging Faceからブラウザへ直接ダウンロードされます。

## 推論ランタイム

[@wllama/wllama](https://github.com/ngxson/wllama) を利用します。

GitHub Pagesでは任意のHTTPレスポンスヘッダーを設定できないため、マルチスレッドWASMを前提にせず `n_threads: 1` で起動します。対応ブラウザではWebGPUが利用されます。

## GitHub Pages公開手順

1. GitHubのこのリポジトリを開く
2. `Settings` → `Pages`
3. `Build and deployment`
4. Sourceを `Deploy from a branch`
5. Branchを `main`
6. Folderを `/ (root)`
7. `Save`

公開URLは通常以下です。

`https://kmtshn.github.io/minicpm5-web-chat/`

## 推奨環境

- Android: Chrome最新版
- PC: Chrome / Edge最新版
- 十分な空きメモリがある端末
- Wi-Fi環境推奨（初回約1.56GB）

2Bモデルをブラウザ内で動かすため、端末によっては読み込み失敗、強制終了、生成速度低下が発生します。

## データの扱い

入力した会話文はAI APIへ送信しません。モデルファイル取得時にはHugging Faceへアクセスし、JavaScript/WASM取得時にはjsDelivrへアクセスします。

つまり「完全オフライン配布」ではありませんが、AI推論自体はユーザー端末内で完結します。

## ライセンス

MiniCPM5のライセンスおよびwllamaのライセンスは、それぞれ配布元の条件に従ってください。
