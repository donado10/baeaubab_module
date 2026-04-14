from shared.worker_base import run_worker
from main import main_process_facture_detail

API_ENDPOINT = "digitale/ecritures/events/job-finished"

handler_map = {
    "facture_detail": lambda data: main_process_facture_detail(
        data["jobId"], data["year"], data["month"], data["journal"], data["database"]),
}

if __name__ == "__main__":
    run_worker("integrate_digital_ec_jobs", handler_map, API_ENDPOINT)
