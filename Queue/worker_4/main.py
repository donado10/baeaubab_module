from shared.worker_base import post_job_status, should_post_progress
from shared.mssql_baeaubab.database import database_objects as dbo_mssql
from db import (
    get_entreprises,
    get_facture_entete_detail_by_company_id,
    get_facture_entete_detail_by_company_id_and_bl,
    get_agence_dg_by_company_id,
    get_latest_facture_id,
    get_transport_value,
    handle_fact_entete,
    handle_fact_lignes,
    set_bl_valide,
)
from utils import get_current_date, get_last_day_of_month, calculate_totals

API_ENDPOINT = "digitale/facture/events/job-finished"


def build_facture(agence_dg: tuple, entetes: list, latest_fact_id, year, month):
    current_date = get_current_date()

    DO_Transport = get_transport_value(agence_dg[5])

    DO_TotalHT, DO_TotalTVA, DO_TotalTTC = calculate_totals(
        entetes, agence_dg[3] == 1, DO_Transport
    )

    facture_entete = []
    facture_entete.append(int(latest_fact_id) + 1)  # DO_No
    facture_entete.append(6)  # DO_Type
    facture_entete.append(agence_dg[0])  # Client_ID
    facture_entete.append(agence_dg[2])  # CT_Num
    facture_entete.append(DO_TotalTTC)  # DO_TotalTTC
    facture_entete.append(DO_TotalHT)  # DO_TotalHT
    facture_entete.append(DO_TotalTVA)  # DO_TotalTVA
    facture_entete.append(get_last_day_of_month(year, month))  # DO_Date
    facture_entete.append(0)  # DO_Status
    facture_entete.append(current_date)  # created_at
    facture_entete.append(agence_dg[5])  # entreprise_id
    facture_entete.append(DO_Transport)  # DO_Transport

    handle_fact_entete(facture_entete)

    facture_lignes = []
    for entete in entetes:
        facture_ligne = []
        facture_ligne.append(int(latest_fact_id) + 1)  # DO_No
        facture_ligne.append(6)  # DO_Type
        facture_ligne.append(agence_dg[0])  # Client_ID
        facture_ligne.append(agence_dg[2])  # CT_Num
        facture_ligne.append(entete[0])  # ART_Design
        facture_ligne.append(entete[5])  # DO_TotalHT
        facture_ligne.append(get_last_day_of_month(year, month))  # do_date
        facture_ligne.append(0)  # do_status
        facture_ligne.append(current_date)  # created_at
        facture_ligne.append(agence_dg[5])  # entreprise_id
        facture_lignes.append(facture_ligne)

    handle_fact_lignes(facture_lignes)
    set_bl_valide(entetes, latest_fact_id)

    conn_mssql, _ = dbo_mssql()
    conn_mssql.commit()


def generate_factures(jobID, year, month):
    year = int(year)
    month = int(month)

    entreprises = get_entreprises(year, month)
    latest_fact_id = get_latest_facture_id()

    count = 0
    last_pct = 0

    for entreprise in entreprises:
        entetes = get_facture_entete_detail_by_company_id(
            entreprise, year, month)
        if not len(entetes):
            continue
        agence_dg = get_agence_dg_by_company_id(entreprise)
        if agence_dg:
            build_facture(agence_dg, entetes, latest_fact_id, year, month)
            latest_fact_id += 1

            count += 1

            should, last_pct = should_post_progress(
                count, len(entreprises), last_pct)
            if should:
                post_job_status(API_ENDPOINT, jobID,
                                "pending", progress=last_pct)


def generate_factures_by_entreprise(jobID, entreprises, year, month):
    year = int(year)
    month = int(month)

    latest_fact_id = get_latest_facture_id()

    count = 0
    last_pct = 0

    for entreprise in entreprises:
        entetes = get_facture_entete_detail_by_company_id(
            entreprise, year, month)
        if not len(entetes):
            continue
        agence_dg = get_agence_dg_by_company_id(entreprise)
        if agence_dg:
            build_facture(agence_dg, entetes, latest_fact_id, year, month)
            latest_fact_id += 1

            count += 1

            should, last_pct = should_post_progress(
                count, len(entreprises), last_pct)
            if should:
                post_job_status(API_ENDPOINT, jobID,
                                "pending", progress=last_pct)


def generate_factures_for_entreprise(jobID, entreprise, year, month):
    year = int(year)
    month = int(month)

    latest_fact_id = get_latest_facture_id()

    entetes = get_facture_entete_detail_by_company_id(
        entreprise, year, month)
    if not len(entetes):
        return
    agence_dg = get_agence_dg_by_company_id(entreprise)
    if agence_dg:
        build_facture(agence_dg, entetes, latest_fact_id, year, month)
        latest_fact_id += 1

    post_job_status(API_ENDPOINT, jobID,
                    "pending", progress=100)


def generate_factures_from_bl(jobID, year, month, entreprise, bls: list):
    year = int(year)
    month = int(month)

    latest_fact_id = get_latest_facture_id()

    count = 0
    last_pct = 0

    entetes = get_facture_entete_detail_by_company_id_and_bl(
        entreprise, bls, year, month
    )
    if not len(entetes):
        return

    agence_dg = get_agence_dg_by_company_id(entreprise)
    if agence_dg:
        build_facture(agence_dg, entetes, latest_fact_id, year, month)
        latest_fact_id += 1

        count += 1

        should, last_pct = should_post_progress(
            count, len(entreprise), last_pct)
        if should:
            post_job_status(API_ENDPOINT, jobID,
                            "pending", progress=last_pct)
