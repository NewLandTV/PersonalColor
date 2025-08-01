const faceapi = require("face-api.js");
const { loadImage } = require("canvas");
const path = require("path");

// 모델 파일 경로
const MODEL_URL = path.join(__dirname, "shape_predictor_68_face_landmarks.dat");

// 모델 로딩 (최초 한 번만 호출)
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    console.log("Face API models loaded successfully.");
}

async function detectFaceAndLandmarks(imageBuffer) {
    try {
        const image = await loadImage(imageBuffer);
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks();
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