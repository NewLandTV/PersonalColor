const tf = require("@tensorflow/tfjs-core");
require("@tensorflow/tfjs-backend-wasm");
const faceapi = require("face-api.js");
const { createCanvas, Image, ImageData } = require("canvas");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

// TF.js 백엔드 초기화
(async () => {
    console.log("Initializing TF.js WASM backend...");
    try {
        await tf.setBackend("wasm");
        await tf.ready();
        console.log("TF.js WASM backend is ready.");
    } catch (err) {
        console.error("Failed to initialize TF.js WASM backend:", err);
        // 오류 발생 시, 프로세스를 종료하여 명확하게 알립니다.
        process.exit(1);
    }
})();

faceapi.env.monkeyPatch({
    createCanvas,
    createImage: () => new Image(),
    ImageData
});

// 모델 파일 경로
const MODELS_DIR = path.join(__dirname, "models");

// 이 Promise가 모델 로딩의 완료를 보장합니다.
let modelsLoadedPromise = null;

async function loadModelsAndInitialize() {
    if (modelsLoadedPromise) {
        return modelsLoadedPromise;
    }
  
    modelsLoadedPromise = (async () => {
        // TF.js 백엔드 초기화를 기다립니다.
        await tf.engine().ready;

        // 모델 로딩 (최초 한 번만 호출)
        console.log(`Loading face-api.js models from: ${MODELS_DIR}`);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_DIR);
        await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODELS_DIR);
        console.log("Face API models loaded successfully.");
    })();
    
    return modelsLoadedPromise;
}

async function detectFaceAndLandmarks(imageBuffer) {
    await loadModelsAndInitialize(); // 모델 로딩이 완료될 때까지 기다림

    try {
        const image = new Image();

        image.src = imageBuffer;

        // 이미지 객체를 텐서로 변환
        const netInput = tf.browser.fromPixels(image);

        // 얼굴 감지 후 랜드마크 추출
        const detections = await faceapi.detectSingleFace(netInput).withFaceLandmarks(true);

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