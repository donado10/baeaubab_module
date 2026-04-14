from shared.worker_base import run_worker
from main import main_process_facture_by_entreprise, main_process_factures, main_process_factures_from_bl

API_ENDPOINT = "digitale/bonLivraison/events/job-finished"

handler_map = {
    "all": lambda data: main_process_factures(data["jobId"], data["year"], data["month"]),
    "byEntreprise": lambda data: main_process_facture_by_entreprise(
        data["jobId"], data["en_list"], data["year"], data["month"]),
    "fromBonLivraison": lambda data: main_process_factures_from_bl(
        data["jobId"], data["year"], data["month"], data["en_list"], data["bl_list"]),
}

if __name__ == "__main__":
    run_worker("generate_digital_fact_jobs", handler_map, API_ENDPOINT)
