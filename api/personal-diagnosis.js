const { json, send } = require("micro");

const processImage = async (imageDataB64) => {
    const imageBuffer = Buffer.from(imageDataB64, "base64");

    // TODO: JS 기반 퍼스널 컬러 분석 및 진단
  
    console.log(`Received image buffer of size: ${imageBuffer.length} bytes`);

    const dummyResult = {
        status: "success",
        diagnosis: "봄웜톤(spring)",
        confidence: 0.9,
        recommendations: ["노란색 계열 옷 추천", "따뜻한 계열의 액세서리 추천"]
    }

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