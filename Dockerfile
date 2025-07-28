# ✅ Use official Python image
FROM python:3.11-slim

# ✅ Set workdir
WORKDIR /app

# ✅ Install deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ✅ Copy app code
COPY . .

# ✅ Expose port (Fly will bind this automatically)
EXPOSE 8080

# ✅ Use Gunicorn + Uvicorn worker to run FastAPI
CMD ["gunicorn", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:8080", "--timeout", "300"]
