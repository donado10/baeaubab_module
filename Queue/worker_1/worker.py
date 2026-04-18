from shared.worker_base import run_worker
from handlers import BLHandlerFactory

API_ENDPOINT = "digitale/bonLivraison/events/job-finished"

if __name__ == "__main__":
    run_worker("get_digital_bl_jobs",
               BLHandlerFactory.build_handler_map(), API_ENDPOINT)
