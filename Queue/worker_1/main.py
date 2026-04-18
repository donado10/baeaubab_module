from shared.worker_base import post_job_status, should_post_progress
from shared.mssql_baeaubab.database import database_objects as dbo_mssql
from db import (
    handle_new_articles, handle_entreprise, handle_client_price, handle_new_client,
    handle_transport, handle_livreurs,
    build_entreprise_residence, set_entreprise_sage, update_comptet_digital_entreprise,
    update_entreprise_tva,
    get_bls, get_one_company_bls, get_bl,
    handle_bl_entete, handle_bl_ligne,
    update_entete, update_ligne,
    update_entreprise_id, get_nbr_bls_some_companies,
)

API_ENDPOINT = "digitale/bonLivraison/events/job-finished"


def handle_clients(year, month):
    handle_entreprise()
    handle_client_price()
    handle_new_client()
    handle_transport()
    update_entreprise(year, month)


def update_entreprise(year, month):
    build_entreprise_residence()
    set_entreprise_sage(
        'select EN_No_digital from transit.dbo.F_entreprise_digital where EN_No_digital is not null and EN_No_Sage is null and en_no_digital > 0 order by EN_No_digital asc')
    set_entreprise_sage(
        'select EN_No_digital from transit.dbo.F_entreprise_digital where EN_No_digital is not null and EN_No_Sage is null and en_no_digital < 0 order by EN_No_digital asc')

    update_comptet_digital_entreprise()
    update_entreprise_tva(year, month)


def handle_bl(bl: int):
    conn_mssql, _ = dbo_mssql()
    bl = get_bl(bl)

    handle_bl_entete(bl)
    handle_bl_ligne(bl)
    conn_mssql.commit()

    update_entete(bl)
    update_ligne(bl)

    conn_mssql.commit()


def handle_bl_documents(jobID, year, month):
    results = get_bls(year, month)
    count = 0
    last_pct = 0
    for bl in results:
        count = count + 1
        handle_bl(bl)
        should, last_pct = should_post_progress(count, len(results), last_pct)
        if should:
            post_job_status(
                API_ENDPOINT,
                jobID, "pending",
                progress=last_pct
            )


def handle_some_bl_document(jobID, year, month, en_list):
    nbr_bls = get_nbr_bls_some_companies(year, month, en_list)
    count = 0
    last_pct = 0
    for en_no in en_list:
        results = get_one_company_bls(year, month, en_no)
        for bl in results:
            count = count + 1
            handle_bl(bl)
            should, last_pct = should_post_progress(
                count, nbr_bls, last_pct)
            if should:
                post_job_status(
                    API_ENDPOINT,
                    jobID, "pending",
                    progress=last_pct
                )


def main_process_bl_detail(jobID, year, month):
    # handle_new_articles()
    handle_clients(year, month)
    handle_livreurs()
    handle_bl_documents(jobID, year, month)
    update_entreprise_id()


def main_process_bl_one(jobID, year, month, en_list):
    # handle_new_articles()
    handle_clients(year, month)
    handle_livreurs()
    handle_some_bl_document(jobID, year, month, en_list)
    update_entreprise_id()
