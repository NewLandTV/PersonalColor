const faceapi = require("face-api.js");
const { createCanvas, Image, ImageData, Canvas, loadImage, DOMImage } = require("canvas");
const path = require("path");

// tfjs-node 대신 WASM 백엔드를 사용하도록 설정
require("@tensorflow/tfjs-backend-wasm");
const tf = require("@tensorflow/tfjs-node");

// Vercel 환경에서 WASM 백엔드 초기화
async function initializeWasmBackend() {
    await tf.setBackend("wasm");
    await tf.ready();
    console.log("TensorFlow.js WASM backend initialized.");
}

initializeWasmBackend();

// face-api.js가 Node.js 환경에서 canvas를 사용하도록 설정
faceapi.env.monkeyPatch({
    Canvas,
    Image: DOMImage || Image,
    ImageData,
    createCanvas,
    createImage: () => new Image()
});

// 모델 파일 경로
const MODELS_DIR = path.join(__dirname, "models");

// 모델 로딩 (최초 한 번만 호출)
async function loadModels() {
    console.log(`Loading face-api.js models from: ${MODELS_DIR}`);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_DIR);
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODELS_DIR);
    console.log("Face API models loaded successfully.");
}

async function detectFaceAndLandmarks(imageBuffer) {
    try {
        const image = await loadImage(imageBuffer);

        // 얼굴 감지 후 랜드마크 추출
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks(true);

        if (!detections) {
            console.log("No face detected.");
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