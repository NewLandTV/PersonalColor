const faceapi = require("face-api.js");
const { createCanvas, Image, ImageData, Canvas, loadImage, DOMImage } = require("canvas");
const path = require("path");
const tf = require("@tensorflow/tfjs-node");

// face-api.js가 Node.js 환경에서 canvas를 사용하도록 설정
faceapi.env.monkeyPatch({
    Canvas,
    Image: DOMImage || Image,
    ImageData,
    createCanvas,
    createImage: () => new Image()
});

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