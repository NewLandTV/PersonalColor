const { json } = require("micro");

module.exports = async (request, response) => {
    if (request.method !== "POST") {
        return response.status(405).json({ status: "error", message: "Method Not Allowed" });
    }

    try {
        // 1. 클라이언트로부터 JSON 요청 수신
        const data = await json(request);

        if (!data.image) {
            return response.status(400).json({ status: "error", message: "No image data provided" });
        }

        // TODO: 2. Base64 인코딩된 이미지 데이터 처리
        // TODO: 3. JS 기반 퍼스널 컬러 분석 및 진단
        
        // TEST: 4. 테스트를 위한 더미 데이터 전송
        const dummyResult = {
            status: "success",
            diagnosis: "봄웜톤(spring)",
            confidence: 0.9,
            recommendations: ["노란색 계열 옷 추천", "따뜻한 계열의 액세서리 추천"]
        };

        // 5. JSON 응답
        return response.status(200).json(dummyResult);
    } catch (error) {
        console.error("Server internal error:", error);
        return response.status(500).json({ 
            status: "error",
            message: "Server internal error: " + error.message
        });
    }
};