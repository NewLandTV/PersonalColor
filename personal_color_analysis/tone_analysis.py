def is_warm(lab_b, a):
    """
    Parameters\n
    lab_b = [skin_b, hair_b, eye_b]\n
    a = 가중치 [skin, hair, eye]\n
    질의색상 lab_b값에서 warm의 lab_b, cool의 lab_b값 간의 거리를
    각각 계산하여 warm이 가까우면 1, cool에 가까우면 0 반환
    """
    # skin, eyebrow, eye
    warm_b_std = [11.6518, 11.71445, 3.6484]
    cool_b_std = [4.64255, 4.86635, 0.18735]
    warm_dist = 0
    cool_dist = 0

    for i in range(3):
        warm_dist += abs(lab_b[i] - warm_b_std[i]) * a[i]
        cool_dist += abs(lab_b[i] - cool_b_std[i]) * a[i]
    return 1 if warm_dist <= cool_dist else 0

def is_spring(hsv_s, a):
    """
    Parameters\n
    hsv_s = [skin_s, hair_s, eye_s]\n
    a = 가중치 [skin, hair, eye]\n
    질의색상 hsv_s값에서 spring의 hsv_s, fall의 hsv_s값 간의 거리를
    각각 계산하여 spring이 가까우면 1, fall에 가까우면 0 반환
    """
    # skin, hair, eye
    spring_s_std = [18.59296, 30.30303, 25.80645]
    fall_s_std = [27.13987, 39.75155, 37.5]
    spring_dist = 0
    fall_dist = 0

    for i in range(3):
        spring_dist += abs(hsv_s[i] - spring_s_std[i]) * a[i]
        fall_dist += abs(hsv_s[i] - fall_s_std[i]) * a[i]
    return 1 if spring_dist <= fall_dist else 0

def is_summer(hsv_s, a):
    """
    Parameters\n
    hsv_s = [skin_s, hair_s, eye_s]\n
    a = 가중치 [skin, hair, eye]\n
    질의색상 hsv_s값에서 summer의 hsv_s, winter의 hsv_s값 간의 거리를
    각각 계산하여 summer가 가까우면 1, winter에 가까우면 0 반환
    """
    # skin, eyebrow, eye
    a[1] = 0.5 # eyebrow 영향력 적기 때문에 가중치 줄임
    summer_s_std = [12.5, 21.7195, 24.77064]
    winter_s_std = [16.73913, 24.8276, 31.3726]
    summer_dist = 0
    winter_dist = 0

    for i in range(3):
        summer_dist += abs(hsv_s[i] - summer_s_std[i]) * a[i]
        winter_dist += abs(hsv_s[i] - winter_s_std[i]) * a[i]
    return 1 if summer_dist <= winter_dist else 0
