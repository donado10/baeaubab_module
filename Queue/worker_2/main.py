import datetime

from utils import build_transport_ecriture
from utils import build_ttc_ecriture
from utils import build_tva_ecriture
from utils import build_ht_ecriture
from utils import get_latest_piece_no
from utils import group_bls_by_article
from shared.worker_base import post_job_status, should_post_progress
from db import (
    fact_comptabilise,
    get_bls,
    get_entete_facture,
    get_entreprises,
    get_facture_entete_detail_by_company_id,
    get_facture_entete_detail_by_company_id_and_bl,
    get_facture_ids,
    get_lignes_facture,
    insert_ecritures,
    is_tva_applicable,
)
from builders import FactureBuilderFactory
from collections import defaultdict


API_ENDPOINT = "digitale/facture/events/job-finished"


def generate_factures(jobID, year, month):
    year = int(year)
    month = int(month)

    entreprises = get_entreprises(year, month)

    count = 0
    last_pct = 0

    for entreprise in entreprises:
        entetes = get_facture_entete_detail_by_company_id(
            entreprise, year, month)
        if not len(entetes):
            continue
        builder = FactureBuilderFactory.create(
            "FC1", entreprise, year, month)
        success, _ = builder.build(entetes)
        if success:
            count += 1

            should, last_pct = should_post_progress(
                count, len(entreprises), last_pct)
            if should:
                post_job_status(API_ENDPOINT, jobID,
                                "pending", progress=last_pct)


def generate_factures_by_entreprise(jobID, entreprises, year, month):
    year = int(year)
    month = int(month)

    count = 0
    last_pct = 0

    for entreprise in entreprises:
        entetes = get_facture_entete_detail_by_company_id(
            entreprise, year, month)
        if not len(entetes):
            continue
        builder = FactureBuilderFactory.create(
            "FC1", entreprise, year, month)
        success, _ = builder.build(entetes)
        if success:
            count += 1

            should, last_pct = should_post_progress(
                count, len(entreprises), last_pct)
            if should:
                post_job_status(API_ENDPOINT, jobID,
                                "pending", progress=last_pct)


def generate_factures_for_entreprise(jobID, entreprise, year, month):
    year = int(year)
    month = int(month)

    entetes = get_facture_entete_detail_by_company_id(
        entreprise, year, month)
    if not len(entetes):
        return
    builder = FactureBuilderFactory.create("FC1", entreprise, year, month)
    builder.build(entetes)

    post_job_status(API_ENDPOINT, jobID,
                    "pending", progress=100)


def generate_factures_from_bl(jobID, year, month, entreprise, bls: list):
    year = int(year)
    month = int(month)

    entetes = get_facture_entete_detail_by_company_id_and_bl(
        entreprise, bls, year, month
    )
    if not len(entetes):
        return

    builder = FactureBuilderFactory.create("FC1", entreprise, year, month)
    success, _ = builder.build(entetes)
    if success:
        post_job_status(API_ENDPOINT, jobID, "pending", progress=100)


def generate_ecritures_from_all_factures(jobID, year, month):
    year = int(year)
    month = int(month)

    factures = get_facture_ids(year, month)
    print(f"Factures to process: {factures}")

    count = 0
    last_pct = 0

    for facture in factures:
        generate_ecritures_from_facture(jobID, year, month, facture)

        count += 1

        should, last_pct = should_post_progress(
            count, len(factures), last_pct)
        if should:
            post_job_status(API_ENDPOINT, jobID,
                            "pending", progress=last_pct)


def generate_ecritures_from_selected_factures(jobID, year, month, do_no_list):
    year = int(year)
    month = int(month)

    count = 0
    last_pct = 0

    for do_no in do_no_list:
        generate_ecritures_from_facture(jobID, year, month, do_no)

        count += 1

        should, last_pct = should_post_progress(
            count, len(do_no_list), last_pct)
        if should:
            post_job_status(API_ENDPOINT, jobID,
                            "pending", progress=last_pct)


def generate_ecritures_from_facture(jobID, year, month, do_no):

    # check if do_no is present in the database
    if fact_comptabilise(do_no):
        print(f"Facture {do_no} is already comptabilised.")
        return
    print(f"Processing facture {do_no}...")
    entete_facture = get_entete_facture(do_no, year, month)
    lignes_facture = get_lignes_facture(do_no, year, month)
    bls = get_bls(lignes_facture[0][0], year, month)

    grouped_bls = group_bls_by_article(bls)
    piece_no = get_latest_piece_no(year, month) + 1
    is_tva = is_tva_applicable(entete_facture[3])

    param = {
        "JO_Num": "",
        "EC_No": 0,
        "JM_Date": f"{year}-{month}-01",
        "EC_Jour": entete_facture[7].day,
        "EC_Piece": piece_no,
        "EC_RefPiece": "FACT-" + str(do_no),
        "CT_Num": entete_facture[3],
        "EC_Date": datetime.datetime.now(),
    }

    ttc = build_ttc_ecriture(param, entete_facture)
    tva = build_tva_ecriture(param, entete_facture) if is_tva else None
    ht = build_ht_ecriture(param, grouped_bls, is_tva)
    transport = build_transport_ecriture(
        param, entete_facture) if entete_facture[16] > 0 else None

    print("TTC Ecriture:", ttc)
    print("TVA Ecriture:", tva)
    print("HT Ecritures:", ht)
    print("Transport Ecriture:", transport)

    ecritures = {
        "ttc": ttc,
        "tva": tva,
        "ht": ht,
        "transport": transport,
    }

    insert_ecritures(ecritures)


if __name__ == "__main__":
    generate_ecritures_from_all_factures("test_job_id", 2026, 3)
