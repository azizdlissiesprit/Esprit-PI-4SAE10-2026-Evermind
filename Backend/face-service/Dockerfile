FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by OpenCV and deepface
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Facenet weights so the container starts instantly
RUN python -c "from deepface import DeepFace; DeepFace.build_model(task='facial_recognition', model_name='Facenet')" || true

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
