const tf = require("@tensorflow/tfjs-core");
require("@tensorflow/tfjs-backend-wasm"); // tfjs-node 대신 WASM 백엔드를 사용하도록 설정
const faceapi = require("face-api.js");
const { createCanvas, Image, ImageData, Canvas, loadImage, DOMImage } = require("canvas");
const path = require("path");

// Vercel 환경에서 WASM 백엔드 초기화
(async () => {
    console.log("Initializing TF.js WASM backend...");
    try {
        await tf.setBackend("wasm");
        await tf.ready();
        console.log("TF.js WASM backend is ready.");
    } catch (err) {
        console.error("Failed to initialize TF.js WASM backend:", err);
        throw err; // 초기화 실패 시 프로세스 종료
    }
})();

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
const loadModelsPromise = (async () => {
    console.log(`Loading face-api.js models from: ${MODELS_DIR}`);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_DIR);
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODELS_DIR);
    console.log("Face API models loaded successfully.");
})();

async function detectFaceAndLandmarks(imageBuffer) {
    await loadModelsPromise; // 모델 로딩이 완료될 때까지 기다림

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
    detectFaceAndLandmarks
};