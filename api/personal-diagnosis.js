const { json, send } = require("micro");
const { loadModels, detectFaceAndLandmarks } = require("./personal_color_analysis/detect_face");
const { extractCheekColor } = require("./personal_color_analysis/color_extract");
const { analyzeTone } = require("./personal_color_analysis/tone_analysis");

// 모델 로딩 상태를 관리하는 변수
let modelsAreLoaded = false;

// 모델을 미리 로드하여 콜드 스타트 시간을 단축합니다. (모델 로딩 Promise)
let modelsPromise = loadModels().then(() => {
    modelsAreLoaded = true;
    console.log("All models loaded and ready for use.");
}).catch(err => {
    console.error("Failed to load models:", err);
});

async function processImage(imageDataB64) {
    // 모델 로딩이 완료될 때까지 기다립니다.
    if (!modelsAreLoaded) {
        console.log("Waiting for models to load...");
        await modelsPromise;
    }
    
    const imageBuffer = Buffer.from(imageDataB64, "base64");

    console.log(`Received image buffer of size: ${imageBuffer.length} bytes`);

    // 얼굴 및 랜드마크 감지
    const detectionResult = await detectFaceAndLandmarks(imageBuffer);
    if (!detectionResult || !detectionResult.detections) {
        return { status: "error", message: "No face detected or an error occurred." };
    }
    
    const { image, detections } = detectionResult;
    
    // 뺨 색상 추출
    const cheekColor = extractCheekColor(image, detections.landmarks);
    if (!cheekColor) {
        return { status: "error", message: "Could not extract cheek color." };
    }
    
    // 톤 분석 및 진단
    const result = analyzeTone(cheekColor);
    
    const dummyResult = {
        status: "success",
        ... result
    };

    return dummyResult;
}

module.exports = async (request, response) => {
    if (request.method !== "POST") {
        return send(response, 405, { status: "error", message: "Method Not Allowed" });
    }

    try {
        // 클라이언트로부터 JSON 요청 수신
        const data = await json(request);
        const imageDateB64 = data.image;

        if (!imageDateB64) {
            return send(response, 400, { status: "error", message: "No image data provided" });
        }
        
        const result = await processImage(imageDateB64);

        // JSON 응답
        return send(response, 200, result);
    } catch (error) {
        console.error("Server internal error:", error);
        return response.status(500).json({ 
            status: "error",
            message: "Server internal error: " + error.message
        });
    }
};