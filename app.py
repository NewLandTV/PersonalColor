import base64
import cv2
from flask import Flask, request, jsonify
import numpy as np
from personal_color_analysis import personal_color

app = Flask(__name__)

@app.route("/personal-diagnosis", methods=["POST"])
def personal_diagnosis():
    # 1. 클라이언트로부터 JSON 요청 수신
    if not request.is_json:
        return jsonify({"status": "error", "message": "Request must be JSON"}), 400

    data = request.get_json()
    if "image" not in data:
        return jsonify({"status": "error", "message": "No image data provided"}), 400

    # 2. Base64 인코딩된 이미지 데이터 디코딩
    try:
        # Base64 데이터 앞에 "data:image/jpeg;base64," 등 메타데이터가 붙어있을 수 있으므로 제거
        image_data_b64 = data["image"]
        if "," in image_data_b64:
            image_data_b64 = image_data_b64.split(",")[1]
        
        image_bytes = base64.b64decode(image_data_b64)
        
        # 바이트 데이터를 NumPy 배열로 변환
        np_image = np.frombuffer(image_bytes, np.uint8)
        # OpenCV로 이미지 디코딩
        img = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image from bytes.")
            
    except Exception as e:
        return jsonify({"status": "error", "message": f"Invalid base64 image data or decoding failed: {e}"}), 400

    # 3. 이미지 분석 및 진단 (메모리 내에서 처리)
    try:
        diagnosis_result = personal_color.analysis(img)
        
        return jsonify({
            "status": "success",
            "diagnosis": diagnosis_result,
            "confidence": 0.9,
            "recommendations": []
        }), 200

    except Exception as e:
        print(f"서버 내부 오류 발생: {e}")
        return jsonify({
            "status": "error",
            "diagnosis": None,
            "confidence": 0.0,
            "recommendations": [],
            "message": f"Server internal error: {e}"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
