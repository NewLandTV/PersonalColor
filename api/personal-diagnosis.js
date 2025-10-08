const { json, send } = require("micro");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processImage(imageDataB64) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 500,
            }
        });

        if (!imageDataB64 || typeof imageDataB64 !== "string") {
            throw new Error("Invalid image data format.");
        }

        let base64Data = imageDataB64;
        let mimeType = "image/jpeg";    // Default

        // 'data:image/jpeg;base64,' 접두사가 있는지 확인하고 처리
        if (imageDataB64.startsWith("data:")) {
            const parts = imageDataB64.split(";");
            mimeType = parts[0].split(":")[1];
            base64Data = parts[1].split(",")[1];
        }
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };
        
        // Gemini에게 요청할 프롬프트
        const prompt = `사진 속 인물의 얼굴을 분석하여 퍼스널 컬러를 진단해주세요.
            - 만약 사진에 인물의 얼굴이 있으면, 다음 JSON 형식으로 응답하세요:
            {
                "status": "success",
                "diagnosis": "계절(예: 봄, 여름, 가을, 겨울) 그리고 (웜 또는 쿨)"
                "confidence": "분석 정확도 (백분율)",
                "recommendations": ["(추천 항목)", "(추천 항목)", "(추천 항목)"],
                "message": "분석 완료"
            }
            - 만약 사진에 인물의 얼굴이 없으면, 다음 JSON 형식으로 응답하세요:
            {
                "status": "error",
                "message": "사진에서 얼굴을 찾을 수 없습니다."
            }
            반드시 JSON 객체만 반환하고, 다른 텍스트는 포함하지 마세요.`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        // 응답이 비어있을 경우 에러 처리
        if (!text) {
            throw new Error("Gemini API returned an empty response.");
        }
        
        // JSON 문자열을 객체로 변환하여 반환
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            status: "error",
            message: "An error occurred with the Gemini API."
        };
    }
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
            message: `Server internal error: ${error.message}`
        });
    }
};