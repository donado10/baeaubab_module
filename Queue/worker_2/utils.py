from configparser import ConfigParser
from datetime import datetime, timedelta
import os
import sys

from collections import defaultdict

from shared.mssql_baeaubab.database import execute_select_one
from db import get_article_cg_num, get_client_info


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


""" process_ecritures({'jobId': '6989cbff001c7f2c576',
                  'year': '2025', 'month': '9', 'check': True}) """
