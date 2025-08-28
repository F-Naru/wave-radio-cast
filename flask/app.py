import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='build/static', template_folder='build')
CORS(app)

RECORDINGS_DIR = "/mnt/recordings/grouped"

@app.route('/')
@app.route('/<path:path>')
def serve(path=''):
    if path != "" and os.path.exists(app.template_folder + '/' + path):
        return send_from_directory(app.template_folder, path)
    else:
        return send_from_directory(app.template_folder, 'index.html')

@app.route('/api/frequencies', methods=['GET'])
def get_frequencies():
    """
    recordings/grouped以下のディレクトリ名（周波数）をリストで返すAPIエンドポイント
    """
    if not os.path.exists(RECORDINGS_DIR):
        return jsonify({"error": "Recordings directory not found."}), 404

    frequencies = [d for d in os.listdir(RECORDINGS_DIR) if os.path.isdir(os.path.join(RECORDINGS_DIR, d))]
    
    return jsonify({"frequencies": frequencies})

@app.route('/api/search', methods=['GET'])
def search_file():
    """
    周波数と日時を指定して録音ファイルを検索するAPIエンドポイント
    例: /api/search?frequency=92.3MHz&date=2025-08-28T17-19
    """
    frequency = request.args.get('frequency')
    date = request.args.get('date')

    if not frequency or not date:
        return jsonify({"error": "Frequency and date parameters are required."}), 400

    file_name = f"{date}.wav"
    file_path = os.path.join(RECORDINGS_DIR, frequency, file_name)
    
    if os.path.exists(file_path):
        return jsonify({
            "success": True,
            "url": f"/recordings/{frequency}/{file_name}"
        })
    else:
        return jsonify({
            "success": False,
            "error": "File not found."
        }), 404

@app.route('/recordings/<path:filename>')
def serve_recording(filename):
    """
    指定された録音ファイルを配信するエンドポイント
    """
    return send_from_directory(RECORDINGS_DIR, filename)

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000)
