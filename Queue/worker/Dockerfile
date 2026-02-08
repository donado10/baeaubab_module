FROM python:3.12
WORKDIR /app
RUN pip install pika
RUN pip install requests
COPY worker.py .
CMD ["python", "worker.py"]
