const faceapi = require("face-api.js");
const { loadImage } = require("canvas");
const path = require("path");

// 모델 파일 경로
const MODEL_URL = path.join(__dirname, "models");

// 모델 로딩 (최초 한 번만 호출)
async function loadModels() {
    console.log(`Loading face-api.js models from: ${MODEL_URL}`);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODEL_URL);
    console.log("Face API models loaded successfully.");
}

async function detectFaceAndLandmarks(imageBuffer) {
    try {
        const image = await loadImage(imageBuffer);

        // 얼굴 감지 후 랜드마크 추출
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks(true);

        if (!detections) {
             return null;
        }
        
        return { image, detections };
    } catch (error) {
        console.error("Error detecting face and landmarks:", error);
        return null;
    }
}

module.exports = {
    loadModels,
    detectFaceAndLandmarks
};