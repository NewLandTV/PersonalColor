const { json, send } = require("micro");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processImage(imageDataB64) {    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        
        // Base64 이미지를 이미지 파트로 변환
        const imagePart = {
            inlineData: {
                data: imageDataB64.split(",")[1], // "data:image/jpeg;base64," 제거
                mimeType: imageDataB64.split(",")[0].split(":")[1].split(";")[0] // mimeType 추출
            }
        };
        
        // Gemini에게 요청할 프롬프트
        const prompt = "Analyze the skin tone and undertone from the person's face in this image. Is the person warm tone or cool tone? Explain why.";

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