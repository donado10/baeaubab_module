FROM python:3.12
WORKDIR /app
RUN pip install pika
COPY worker.py .
CMD ["python", "worker.py"]
