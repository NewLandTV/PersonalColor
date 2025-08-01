/**
 * @param {*} lab_b [skin_b, hair_b, eye_b]
 * @param {*} a 가중치 [skin, hair, eye]
 * @returns 질의색상 lab_b값에서 warm의 lab_b, cool의 lab_b값 간의 거리를
    각각 계산하여 warm이 가까우면 1, cool에 가까우면 0 반환
 */
function isWarm(lab_b, a) {
    // skin, eyebrow, eye
    warm_b_std = [11.6518, 11.71445, 3.6484];
    cool_b_std = [4.64255, 4.86635, 0.18735];
    warm_dist = 0;
    cool_dist = 0;

    for (let i = 0; i < 3; i++) {
        warm_dist += Math.abs(lab_b[i] - warm_b_std[i]) * a[i];
        cool_dist += Math.abs(lab_b[i] - cool_b_std[i]) * a[i];
    }

    return warm_dist <= cool_dist;
}

/**
 * @param {*} hsv_s [skin_s, hair_s, eye_s]
 * @param {*} a 가중치 [skin, hair, eye]
 * @returns 질의색상 hsv_s값에서 spring의 hsv_s, fall의 hsv_s값 간의 거리를
    각각 계산하여 spring이 가까우면 1, fall에 가까우면 0 반환
 */
function isSpring(hsv_s, a) {
    // skin, hair, eye
    spring_s_std = [18.59296, 30.30303, 25.80645];
    fall_s_std = [27.13987, 39.75155, 37.5];
    spring_dist = 0;
    fall_dist = 0;

    for (let i = 0; i < 3; i++) {
        spring_dist += Math.abs(hsv_s[i] - spring_s_std[i]) * a[i];
        fall_dist += Math.abs(hsv_s[i] - fall_s_std[i]) * a[i];
    }
        
    return spring_dist <= fall_dist;
}

/**
 * @param {*} hsv_s [skin_s, hair_s, eye_s]
 * @param {*} a 가중치 [skin, hair, eye]
 * @returns 질의색상 hsv_s값에서 summer의 hsv_s, winter의 hsv_s값 간의 거리를
    각각 계산하여 summer가 가까우면 1, winter에 가까우면 0 반환
 */
function isSummer(hsv_s, a) {
    // skin, eyebrow, eye
    a[1] = 0.5 // eyebrow 영향력 적기 때문에 가중치 줄임
    summer_s_std = [12.5, 21.7195, 24.77064];
    winter_s_std = [16.73913, 24.8276, 31.3726];
    summer_dist = 0;
    winter_dist = 0;

    for (let i = 0; i < 3; i++) {
        summer_dist += Math.abs(hsv_s[i] - summer_s_std[i]) * a[i];
        winter_dist += Math.abs(hsv_s[i] - winter_s_std[i]) * a[i];
    }

    return summer_dist <= winter_dist;
}

function analyzeTone(color) {
    if (!color) {
        return null;
    }

    // 색상(RGB)을 기반으로 웜톤/쿨톤을 판단하는 로직
    // Python 코드에서 사용했던 색상 분석 로직을 JS로 포팅
    const { r, g, b } = color;

    // 예시: 간단한 웜톤/쿨톤 판단
    // (g 값이 r과 b 값보다 높으면 웜톤일 가능성이 높음)
    const warmthScore = (r * 0.299) + (g * 0.587) + (b * 0.114);
    const coolnessScore = (b / (r + g + b)) * 255;
    
    let diagnosis;
    if (warmthScore > 120 && coolnessScore < 80) {
        diagnosis = "봄웜톤(spring)";
    } else if (warmthScore > 120 && coolnessScore >= 80) {
        diagnosis = "가을웜톤(autumn)";
    } else if (warmthScore <= 120 && coolnessScore > 80) {
        diagnosis = "여름쿨톤(summer)";
    } else {
        diagnosis = "겨울쿨톤(winter)";
    }

    // TODO: 실제로는 더 복잡한 색상 공간(HSV 등) 분석 로직이 필요합니다.

    return {
        diagnosis,
        confidence: 0.9,
        recommendations: ["노란색 계열 옷 추천"]
    };
}

module.exports = {
    isWarm,
    isSpring,
    isSummer,
    analyzeTone
};