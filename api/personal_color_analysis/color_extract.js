const { createCanvas } = require("canvas");

function extractCheekColor(image, landmarks) {
    // 랜드마크를 사용하여 뺨 영역을 정의
    // 이 예시에서는 왼쪽 뺨 영역의 픽셀을 추출합니다.
    const leftCheekPoints = landmarks.getJawOutline().slice(3, 7);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    let totalR = 0, totalG = 0, totalB = 0;
    let pixelCount = 0;

    // 뺨 영역의 좌표를 기반으로 픽셀 데이터 추출
    // 이 부분은 OpenCV의 로직을 JS로 포팅한 것입니다.
    for (const point of leftCheekPoints) {
        // 간단화를 위해 랜드마크 주변의 픽셀을 추출
        const pixelData = ctx.getImageData(point.x, point.y, 10, 10).data;
        for (let i = 0; i < pixelData.length; i += 4) {
            totalR += pixelData[i];
            totalG += pixelData[i + 1];
            totalB += pixelData[i + 2];
            pixelCount++;
        }
    }

    if (pixelCount === 0) return null;

    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;

    return { r: avgR, g: avgG, b: avgB };
}

module.exports = {
    extractCheekColor
};