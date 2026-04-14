from shared.worker_base import run_worker
from main import main_process_bl_detail, main_process_bl_one

API_ENDPOINT = "digitale/bonLivraison/events/job-finished"

handler_map = {
    "all": lambda data: main_process_bl_detail(data["jobId"], data["year"], data["month"]),
    "bl_some": lambda data: main_process_bl_one(data["jobId"], data["year"], data["month"], data["en_list"]),
}

if __name__ == "__main__":
    run_worker("get_digital_bl_jobs", handler_map, API_ENDPOINT)
