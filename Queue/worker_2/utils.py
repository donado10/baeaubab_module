from configparser import ConfigParser
from datetime import datetime, timedelta
import os
import sys

from collections import defaultdict

from shared.mssql_baeaubab.database import execute_select_one, database_objects as dbo_mssql
from db import get_article_cg_num, get_client_info, handle_fact_entete, handle_fact_lignes


def group_bls_by_article(bls: list) -> list:
    totals = defaultdict(lambda: 0)
    for bl in bls:
        article = bl[4]
        price = int(bl[9] or 0)
        totals[article] += price
    return list(totals.items())


def configure(app_config_location):
    if getattr(sys, 'frozen', False):
        return os.path.join(os.path.dirname(sys.argv[0]), app_config_location)

    else:
        return app_config_location


def ini_settings():
    app_config = configure(
        "./configuration/settings.ini")

    config = ConfigParser()
    config.read(app_config)
    return config


def write_to_file(file_path, content):
    with open(file_path, 'r') as file:
        old_content = file.read()
    with open(file_path, 'w') as file:
        file.write(f'{old_content}{content}\n')


def get_log_timestamp():
    return f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}]"


def get_current_date():
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def get_current_month_year():
    now = datetime.now()
    return now.year, now.month


def get_last_day_of_month(year, month):
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    last_day = next_month - timedelta(days=1)
    return last_day.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def calculate_totals(entetes: list, is_tva_applicable: bool, transport: int) -> tuple:
    DO_TotalHT = sum(int(entete[5]) for entete in entetes) + transport
    DO_TotalTVA = DO_TotalHT * 0.18 if is_tva_applicable else 0
    DO_TotalTTC = DO_TotalHT + DO_TotalTVA
    return DO_TotalHT, DO_TotalTVA, DO_TotalTTC


def get_latest_piece_no(year, month):
    query = f"""
    select top 1 EC_Piece from TRANSIT.dbo.F_ECRITUREC_TEMP where year(jm_date) = {year} and month(jm_date) = {month} order by EC_Piece desc
    """
    # Execute the query and return the result
    result = execute_select_one(query)
    return int(result[0]) if result and result[0] else 0


def build_ttc_ecriture(param, entete_facture):
    ttc = param.copy()
    ttc["EC_Montant"] = entete_facture[4]
    ttc["EC_Sens"] = 0
    ttc["EC_Intitule"] = get_client_info(entete_facture[3])[2]
    ttc["CG_Num"] = "411100"
    return ttc


def build_tva_ecriture(param, entete_facture):
    tva = param.copy()
    tva["EC_Montant"] = entete_facture[6]
    tva["EC_Sens"] = 1
    tva["EC_Intitule"] = None
    tva["CG_Num"] = "443100"
    return tva


def build_ht_ecriture(param, grouped_arts, is_tva_applicable):
    ht = param.copy()
    ht_lignes = []
    for article, total in grouped_arts:
        builder = {
            "EC_Montant": total,
            "EC_Sens": 1,
            "EC_Intitule": None,
            "CG_Num": get_article_cg_num(article, is_tva_applicable),
        }
        ht_lignes.append(builder)
    ht["lignes"] = ht_lignes
    return ht


def build_transport_ecriture(param, entete_facture):
    transport = param.copy()
    transport["EC_Montant"] = entete_facture[16]
    transport["EC_Sens"] = 1
    transport["EC_Intitule"] = None
    transport["CG_Num"] = "707110"
    return transport


def generate_facture_retour(entete_facture, lignes_facture, facture_id):

    current_date = get_current_date()
    year, month = get_current_month_year()
    last_day = get_last_day_of_month(year, month)

    entete = [
        facture_id,   # DO_No
        6,            # DO_Type
        entete_facture[2],    # Client_ID
        entete_facture[3],    # CT_Num
        -entete_facture[4],  # DO_TotalTTC
        -entete_facture[5],  # DO_TotalHT
        -entete_facture[6],  # DO_TotalTVA
        last_day,     # DO_Date à changer
        0,            # DO_Status
        current_date,  # created_at
        entete_facture[10],    # DO_Entreprise_Sage
        -entete_facture[16],  # DO_Transport
        1 if entete_facture[17] else 0,  # DO_FactureGenerale
        entete_facture[0],  # DO_FactureReference
        entete_facture[11],  # DO_Entreprise_Digital
    ]
    handle_fact_entete(entete)

    lignes = []
    for ligne in lignes_facture:
        lignes.append([
            facture_id,   # DO_No
            6,            # DO_Type
            ligne[2],    # Client_ID
            ligne[3],    # CT_Num
            ligne[6],    # ART_Design
            -ligne[9],    # DO_TotalHT
            last_day,     # DO_Date
            0,            # DO_Status
            current_date,  # created_at
            ligne[12],    # DO_Entreprise_Sage
            ligne[13],    # DO_Entreprise_Digital
            ligne[0],   # DO_FactureReference
        ])

    handle_fact_lignes(lignes)


def update_facture_as_canceled(do_no, year, month):
    conn_mssql, cursor_mssql = dbo_mssql()
    query = f"""
    UPDATE TRANSIT.dbo.F_DOCENTETE_DIGITAL
    SET DO_Status = 2
    WHERE DO_No = {do_no} AND DO_Type in (6, 7) AND YEAR(DO_Date) = {year} AND MONTH(DO_Date) = {month}
    """
    cursor_mssql.execute(query)
    conn_mssql.commit()


def check_facture_cancellation(jobID, year, month, do_no):
    conn_mssql, cursor_mssql = dbo_mssql()
    query = f"""
    SELECT DO_Status FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL
    WHERE DO_No = {do_no} AND DO_Type in (6, 7) AND YEAR(DO_Date) = {year} AND MONTH(DO_Date) = {month}
    """
    result = execute_select_one(query)
    return result[0] == 2 if result else False


""" process_ecritures({'jobId': '6989cbff001c7f2c576',
                  'year': '2025', 'month': '9', 'check': True}) """
