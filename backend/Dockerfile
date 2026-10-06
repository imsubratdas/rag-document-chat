FROM python:3.11-slim

WORKDIR /app

# Install CPU-only torch first to prevent downloading multi-gigabyte CUDA packages
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch==2.14.0

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]