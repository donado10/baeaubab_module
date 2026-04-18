from shared.worker_base import run_worker
from handlers import FactureHandlerFactory

API_ENDPOINT = "digitale/facture/events/job-finished"

if __name__ == "__main__":
    run_worker("comptabilite-jobs",
               FactureHandlerFactory.build_handler_map(), API_ENDPOINT)
