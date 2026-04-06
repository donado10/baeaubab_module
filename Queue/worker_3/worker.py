import pika
import json
import time
import requests

from main import main_process_bl_detail, main_process_bl_one


def connect_with_retry(host="rabbitmq", tries=30, delay=2):
    for i in range(tries):
        try:
            return pika.BlockingConnection(pika.ConnectionParameters(host=host))
        except pika.exceptions.AMQPConnectionError:
            print(f"RabbitMQ not ready yet... retry {i+1}/{tries}")
            time.sleep(delay)
    raise RuntimeError("Could not connect to RabbitMQ")


connection = connect_with_retry()

channel = connection.channel()

channel.queue_declare(queue="get_digital_bl_jobs", durable=True)


def handle(ch, method, properties, body):
    data = json.loads(body)
    print("Received:", data, flush=True)

    time.sleep(2)

    requests.post(
        "http://172.30.0.1:3000/api/digitale/bonLivraison/events/job-finished",
        json={
            "jobId": data["jobId"],
            "status": "pending",
            "ec_total": "",
            "ec_count": ""
        }
    )

    if data["type"] == "all":
        main_process_bl_detail(
            data["jobId"], data["year"], data["month"])

    if data["type"] == "bl_some":
        main_process_bl_one(
            data["jobId"], data["year"], data["month"], data["en_list"])

    requests.post(
        "http://172.30.0.1:3000/api/digitale/bonLivraison/events/job-finished",
        json={
            "jobId": data["jobId"],
            "status": "done",
            "ec_total": "",
            "ec_count": ""
        }
    )


channel.basic_consume(
    queue="get_digital_bl_jobs",
    on_message_callback=handle,
    auto_ack=True
)

print("Waiting for jobs...", flush=True)
try:
    channel.start_consuming()
except Exception as e:
    print("❌ start_consuming stopped because:", repr(e), flush=True)
    raise
finally:
    print("❌ worker is exiting now", flush=True)
