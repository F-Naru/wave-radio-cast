
import os
from flask import Flask, jsonify, render_template, send_from_directory

app = Flask(__name__)

# recordingsディレクトリへの絶対パスを指定
RECORDINGS_BASE_PATH = os.path.abspath("recordings/grouped")

@app.route('/')
def index():
    """メインページをレンダリングし、放送局のリストを渡す"""
    stations = []
    if os.path.exists(RECORDINGS_BASE_PATH):
        stations = [d for d in os.listdir(RECORDINGS_BASE_PATH) if os.path.isdir(os.path.join(RECORDINGS_BASE_PATH, d))]
    return render_template('index.html', stations=sorted(stations))

@app.route('/api/files/<path:frequency>')
def list_files(frequency):
    """指定された放送局の音声ファイルリストをJSONで返す"""
    station_path = os.path.join(RECORDINGS_BASE_PATH, frequency)
    files = []
    if os.path.exists(station_path):
        files = [f for f in os.listdir(station_path) if f.endswith('.wav')]
    return jsonify(sorted(files, reverse=True))

@app.route('/audio/<path:frequency>/<path:filename>')
def serve_audio(frequency, filename):
    """音声ファイルを配信する"""
    return send_from_directory(os.path.join(RECORDINGS_BASE_PATH, frequency), filename)

if __name__ == '__main__':
    # ポート80で実行するには管理者権限が必要な場合があります
    app.run(host='0.0.0.0', port=80, debug=True)
