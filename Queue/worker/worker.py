from shared.worker_base import run_worker
from main import main_process_all, main_process_some, main_process_set_valid

API_ENDPOINT = "digitale/ecritures/events/job-finished"

handler_map = {
    "all": lambda data: main_process_all(data["jobId"], data["year"], data["month"]),
    "some": lambda data: main_process_some(data["jobId"], data["year"], data["month"], data["bills"]),
    "set_valid": lambda data: main_process_set_valid(data["jobId"], data["year"], data["month"], data["bills"]),
}

if __name__ == "__main__":
    run_worker("check_digital_ec_jobs", handler_map, API_ENDPOINT)
