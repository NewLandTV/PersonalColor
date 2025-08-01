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
        let mimeType = "image/jpeg"; // Default

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
        const prompt = `Analyze the person's face in the image to determine their personal color. Provide a concise, single-line response for each point below.
1. 피부 톤:
2. 언더톤 (웜/쿨):
3. 계절 (예: 봄, 여름, 가을, 겨울):
4. 추천 색상 팔레트:
5. 분석 정확도 (백분율로): 
6. 분석 요약 (간단하게):`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return {
            status: "success",
            diagnosis: text
        }
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
            message: "Server internal error: " + error.message
        });
    }
};