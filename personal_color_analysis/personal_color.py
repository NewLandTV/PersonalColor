import numpy as np
from personal_color_analysis import tone_analysis
from personal_color_analysis.detect_face import DetectFace
from personal_color_analysis.color_extract import DominantColors
from colormath.color_objects import LabColor, sRGBColor, HSVColor
from colormath.color_conversions import convert_color

def analysis(imgpath):
    try:
        #######################################
        #           Face detection            #
        #######################################
        df = DetectFace(imgpath)
        face = [df.left_cheek, df.right_cheek,
                df.left_eyebrow, df.right_eyebrow,
                df.left_eye, df.right_eye]

        #######################################
        #         Get Dominant Colors         #
        #######################################
        temp = []
        clusters = 4
        for f in face:
            dc = DominantColors(f, clusters)
            face_part_color, _ = dc.getHistogram()
            # dc.plotHistogram()
            temp.append(np.array(face_part_color[0]))
        cheek = np.mean([temp[0], temp[1]], axis=0)
        eyebrow = np.mean([temp[2], temp[3]], axis=0)
        eye = np.mean([temp[4], temp[5]], axis=0)

        Lab_b, hsv_s = [], []
        color = [cheek, eyebrow, eye]
        for i in range(3):
            rgb = sRGBColor(color[i][0], color[i][1], color[i][2], is_upscaled=True)
            lab = convert_color(rgb, LabColor, through_rgb_type=sRGBColor)
            hsv = convert_color(rgb, HSVColor, through_rgb_type=sRGBColor)
            Lab_b.append(float(format(lab.lab_b, ".2f")))
            hsv_s.append(float(format(hsv.hsv_s, ".2f")) * 100)

        # print("Lab_b[skin, eyebrow, eye]", Lab_b)
        # print("hsv_s[skin, eyebrow, eye]", hsv_s)
        #######################################
        #      Personal color Analysis        #
        #######################################
        Lab_weight = [30, 20, 5]
        hsv_weight = [10, 1, 1]
        if tone_analysis.is_warm(Lab_b, Lab_weight):
            if tone_analysis.is_spring(hsv_s, hsv_weight):
                tone = "봄웜톤(spring)"
            else:
                tone = "가을웜톤(fall)"
        else:
            if tone_analysis.is_summer(hsv_s, hsv_weight):
                tone = "여름쿨톤(summer)"
            else:
                tone = "겨울쿨톤(winter)"
        # Print Result and return
        result = f"{imgpath}의 퍼스널 컬러는 {tone}입니다."
        print(result)
        return result
    except RuntimeError as re: # DetectFace에서 발생시킨 사용자 정의 예외 처리
        print(f"Face detection error: {re}")
        return f"Analysis Failed: No face detected. Please try again with a clear photo."
    except ValueError as ve: # 이미지 로드 실패 등
        print(f"Image processing error: {ve}")
        return f"Analysis Failed: Invalid image. {ve}"
    except Exception as e:
        print(f"General error during personal color analysis: {e}")
        # 오류 메시지를 명확하게 클라이언트에 전달하도록 수정
        return f"Analysis Failed: An unexpected error occurred - {e}"
