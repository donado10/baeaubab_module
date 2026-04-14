import pika
import json
import time
import requests
import logging

from shared.utils import ini_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def get_api_base_url():
    """Read base API URL from settings.ini [API] section, with fallback."""
    config = ini_settings()
    try:
        return config['API']['base_url'].rstrip('/')
    except (KeyError, TypeError):
        return "http://172.30.0.1:3000"


def post_job_status(api_endpoint, job_id, status, ec_total="", ec_count=""):
    """POST job status to the API with error handling and retries."""
    url = f"{get_api_base_url()}/api/{api_endpoint}"
    payload = {
        "jobId": job_id,
        "status": status,
        "ec_total": ec_total,
        "ec_count": ec_count,
    }
    for attempt in range(3):
        try:
            resp = requests.post(url, json=payload, timeout=10)
            resp.raise_for_status()
            return resp
        except requests.exceptions.RequestException as e:
            logger.warning(
                "POST %s attempt %d/3 failed: %s", url, attempt + 1, e
            )
            if attempt < 2:
                time.sleep(1)
    logger.error("POST %s failed after 3 attempts for job %s", url, job_id)
    return None


def connect_with_retry(host="rabbitmq", tries=30, delay=2):
    for i in range(tries):
        try:
            return pika.BlockingConnection(pika.ConnectionParameters(host=host))
        except pika.exceptions.AMQPConnectionError:
            logger.info("RabbitMQ not ready yet... retry %d/%d", i + 1, tries)
            time.sleep(delay)
    raise RuntimeError("Could not connect to RabbitMQ")


def run_worker(queue_name, handler_map, api_endpoint):
    """
    Start a RabbitMQ consumer for the given queue.

    Args:
        queue_name: Name of the RabbitMQ queue to consume.
        handler_map: Dict mapping job type strings to handler functions.
            Each handler receives (job_id, **job_data) where job_data
            is the full decoded message minus 'jobId' and 'type'.
        api_endpoint: The API event endpoint path (e.g. 'digitale/ecritures/events/job-finished').
    """
    connection = connect_with_retry()
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)

    def handle(ch, method, properties, body):
        data = json.loads(body)
        logger.info("Received: %s", data)

        time.sleep(2)

        post_job_status(api_endpoint, data["jobId"], "pending")

        job_type = data.get("type")
        handler_fn = handler_map.get(job_type)
        if handler_fn is None:
            logger.error("Unknown job type '%s' for queue '%s'",
                         job_type, queue_name)
        else:
            try:
                handler_fn(data)
            except Exception:
                logger.exception(
                    "Handler failed for job %s (type=%s)", data.get("jobId"), job_type)
                post_job_status(api_endpoint, data["jobId"], "failed")
                return

        post_job_status(api_endpoint, data["jobId"], "done")

    channel.basic_consume(
        queue=queue_name,
        on_message_callback=handle,
        auto_ack=True,
    )

    logger.info("Waiting for jobs on '%s'...", queue_name)
    try:
        channel.start_consuming()
    except Exception as e:
        logger.error("start_consuming stopped: %r", e)
        raise
    finally:
        logger.warning("Worker for '%s' is exiting now", queue_name)
