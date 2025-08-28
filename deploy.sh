#!/bin/bash

# スクリプトがエラーで停止するように設定
set -e

# ディレクトリパスの定義
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="${SCRIPT_DIR}/react"
BACKEND_DIR="${SCRIPT_DIR}/flask"

# 開始メッセージ
echo "🚀 本番環境へのデプロイを開始します..."
echo "------------------------------"

# 1. フロントエンドのビルド
echo "🌐 フロントエンドをビルド中..."
cd "${FRONTEND_DIR}"
npm install
npm run build

# 2. ビルド済みファイルをバックエンドに移動
echo "------------------------------"
echo "📂 ビルド済みファイルをバックエンドディレクトリに移動中..."
rm -rf "${BACKEND_DIR}/build"
mv "${FRONTEND_DIR}/build" "${BACKEND_DIR}/build"
echo "✅ buildディレクトリの移動が完了しました。"

# 3. バックエンドサーバーの起動
echo "------------------------------"
echo "🐍 バックエンドを起動中..."
cd "${BACKEND_DIR}"

# 既存のFlaskプロセスを停止
echo "⏹️ 既存のプロセスを停止中..."
PROCESS_ID=$(ps aux | grep 'python app.py' | grep -v grep | awk '{print $2}')
if [ -n "$PROCESS_ID" ]; then
    kill "$PROCESS_ID"
    echo "✅ プロセス ID: $PROCESS_ID を停止しました。"
else
    echo "⚠️ 実行中のプロセスはありませんでした。"
fi

# バックエンドサーバーをバックグラウンドで起動
# 標準出力と標準エラー出力をログファイルにリダイレクト
nohup python app.py > output.log 2>&1 &

echo "✅ 新しいサーバーがバックグラウンドで起動しました。"
echo "------------------------------"
echo "🎉 デプロイ完了！"
echo "以下のURLでアクセス可能です: http://[研究室マシンのIPアドレス]:5000"
