FROM python:3.12-slim

# 필요한 시스템 종속성들을 설치합니다.
# 아래는 일반적인 dlib 설치에 필요한 패키지입니다.
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    libx11-dev \
    libglib2.0-dev \
    libatlas-base-dev \
    libboost-all-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements.txt에 명시된 파이썬 패키지들을 설치합니다.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Vercel에서 필요한 파일들 (앱 코드, 모델 파일 등)을 복사합니다.
COPY . .

# Flask 앱을 실행할 명령어를 설정합니다.
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "app:app"]