import pika
import json
import time


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

channel.queue_declare(queue="jobs", durable=True)

def handle(ch, method, properties, body):
    data = json.loads(body)
    print("Received:", data, flush=True)

channel.basic_consume(
    queue="jobs",
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