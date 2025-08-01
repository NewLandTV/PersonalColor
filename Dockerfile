# Python 3.12-slim 이미지를 기반으로 사용합니다.
FROM python:3.12-slim

WORKDIR /app

# dlib을 컴파일하는 데 필요한 시스템 종속성을 설치합니다.
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    g++ \
    libx11-dev \
    libglib2.0-dev \
    libboost-all-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt에 있는 파이썬 패키지들을 설치합니다.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Vercel에 배포할 모든 앱 파일 (app.py, 모델 파일 등)을 Docker 이미지에 복사합니다.
COPY . .