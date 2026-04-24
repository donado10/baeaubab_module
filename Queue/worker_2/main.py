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
    get_facturation_type,
    get_facture_ids,
    get_lignes_facture,
    insert_ecritures,
    is_tva_applicable,
)
from builders import FactureBuilderFactory


API_ENDPOINT = "digitale/facture/events/job-finished"


def generate_factures(jobID, year, month):
    year = int(year)
    month = int(month)

    entreprises = get_entreprises(year, month)

    count = 0
    last_pct = 0

    for entreprise in entreprises:

        fact_type_list = get_facturation_type(entreprise)

        success = False
        for fact_type in fact_type_list:

            builder = FactureBuilderFactory.create(
                fact_type, entreprise, year, month)
            success, _ = builder.execute()
            if success:
                success = True
                continue
            success = False

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
        fact_type_list = get_facturation_type(entreprise)

        success = False
        for fact_type in fact_type_list:
            print(
                f"Processing entreprise {entreprise} with facturation type: {fact_type}", flush=True)

            builder = FactureBuilderFactory.create(
                fact_type, entreprise, year, month)
            success, _ = builder.execute()
            if success:
                success = True
                continue
            success = False

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

    fact_type_list = get_facturation_type(entreprise)
    success = False
    for fact_type in fact_type_list:

        builder = FactureBuilderFactory.create(
            fact_type, entreprise, year, month)
        success, _ = builder.execute()
        if success:
            success = True
            continue
        success = False

    post_job_status(API_ENDPOINT, jobID,
                    "pending", progress=100)


def generate_factures_from_bl(jobID, year, month, entreprise, bls: list):
    year = int(year)
    month = int(month)

    builder = FactureBuilderFactory.create("FC3", entreprise, bls, year, month)
    success, _ = builder.execute()
    if success:
        post_job_status(API_ENDPOINT, jobID, "pending", progress=100)


"""
Section for generating ecritures from factures. This is the second step after generating factures.
It will fetch all the factures for a given month and year, then generate ecritures for each facture 
and insert them into the database.

"""


def generate_ecritures_from_all_factures(jobID, year, month):
    year = int(year)
    month = int(month)

    print(f"Fetching factures for {year}-{month}...", flush=True)

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
    print(f"Processing facture {do_no}...", flush=True)
    if fact_comptabilise(do_no):
        print(f"Facture {do_no} is already comptabilised.")
        return
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
        "EC_Valide": 0,
    }

    ttc = build_ttc_ecriture(param, entete_facture)
    tva = build_tva_ecriture(param, entete_facture) if is_tva else None
    ht = build_ht_ecriture(param, grouped_bls, is_tva)
    transport = build_transport_ecriture(
        param, entete_facture) if entete_facture[16] > 0 else None

    print("TTC Ecriture:", ttc, flush=True)
    print("TVA Ecriture:", tva, flush=True)
    print("HT Ecritures:", ht, flush=True)
    print("Transport Ecriture:", transport, flush=True)

    ecritures = {
        "ttc": ttc,
        "tva": tva,
        "ht": ht,
        "transport": transport,
    }

    insert_ecritures(do_no, ecritures)
    post_job_status(API_ENDPOINT, jobID,
                    "pending", progress=100)


""" 
if __name__ == "__main__":
    generate_ecritures_from_all_factures("test_job_id", 2026, 3)
 """
