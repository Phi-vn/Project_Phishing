FROM python:3.14-slim

WORKDIR /app

COPY requirements-cloud.txt .
RUN pip install --no-cache-dir -r requirements-cloud.txt

COPY main.py models.py database.py phishing_model.pkl ./

RUN mkdir -p /app/data && chmod -R 777 /app/data

ENV PHISHARMOR_CLOUD_MODE=1
ENV PHISHARMOR_DB_PATH=/app/data/phisharmor.db
ENV PHISHARMOR_SETTINGS_PATH=/app/data/settings.json
ENV ADMIN_PORTAL_KEY=phisharmor2026

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
