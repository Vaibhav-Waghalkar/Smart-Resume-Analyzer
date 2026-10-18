# Use official lightweight Python image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose standard port
EXPOSE 8000

# Start Uvicorn production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
