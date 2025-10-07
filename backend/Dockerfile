FROM python:3.9-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         libgl1-mesa-glx \
         libglib2.0-0 \
         build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel --no-cache-dir \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn==20.1.0

COPY . .

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
