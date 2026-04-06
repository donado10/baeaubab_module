from datetime import datetime, timedelta
import re
import requests
from mssql_baeaubab.database import database_objects as dbo_mssql, execute_select_all, execute_select_one
from mysql_digital.database import database_objects as dbo_mysql, execute_select_all as mysql_execute_select_all


def get_entreprises(year, month):
    query = f"""
    select  distinct DO_ENTREPRISE_Sage from TRANSIT.dbo.F_DOCENTETE_DIGITAL where year(created_at) = {year} and month(created_at) = {month} and do_type=3 and DO_Status != 2 and DO_ENTREPRISE_Sage is not null and do_valide != 1
"""
    results = execute_select_all(query)
    return [x[0] for x in results]


def get_residences(year, month):
    query = f"""
    select  distinct client_id from TRANSIT.dbo.F_DOCENTETE_DIGITAL where year(created_at) = {year} and month(created_at) = {month} and do_type=3 and DO_Status != 2 and DO_ENTREPRISE_Sage is null and do_valide != 1
"""
    results = execute_select_all(query)
    return [x[0] for x in results]


# get the details of the facture and insert into the database based on the company id
def get_facture_entete_detail_by_company_id(company_id, year, month):
    query = f"""
    select  * from TRANSIT.dbo.F_DOCENTETE_DIGITAL where year(created_at) = {year} and month(created_at) = {month} and do_type=3 and DO_Status != 2 and DO_Entreprise_Sage='{company_id}' and DO_TotalHT is not null and DO_TotalHT != 0 and do_valide != 1
"""
    results = execute_select_all(query)
    return results


def get_facture_entete_detail_by_company_id_and_bl(company_id, bls, year, month):
    query = f"""
    select  * from TRANSIT.dbo.F_DOCENTETE_DIGITAL where do_no in ({','.join(bls)}) and year(created_at) = {year} and month(created_at) = {month} and do_type=3 and DO_Status != 2 and DO_Entreprise_Sage='{company_id}' and DO_TotalHT is not null and DO_TotalHT != 0 and do_valide != 1
"""
    results = execute_select_all(query)
    return results


def get_facture_entete_detail_by_residence_id(client_id, year, month):
    query = f"""
    select  * from TRANSIT.dbo.F_DOCENTETE_DIGITAL where year(created_at) = {year} and month(created_at) = {month} and do_type=3 and DO_Status != 2 and client_id={client_id} and DO_TotalHT is not null and do_valide != 1
"""
    results = execute_select_all(query)
    return results


def get_agence_dg_by_company_id(company_id):
    query = f"""
    SELECT * FROM [TRANSIT].[dbo].[F_COMPTET_DIGITAL] where CT_Entreprise_Sage = '{company_id}' and CT_DG=1
"""
    result = execute_select_one(query)
    if result:
        return result
    query = f"""
        SELECT top 1 * FROM [TRANSIT].[dbo].[F_COMPTET_DIGITAL] where CT_Entreprise_Sage = '{company_id}'
    """
    result = execute_select_one(query)
    return result if result else None


def get_agence_dg_by_residence_id(residence_id):
    query = f"""
    SELECT * FROM [TRANSIT].[dbo].[F_COMPTET_DIGITAL] where CT_No = {residence_id}
"""
    result = execute_select_one(query)
    return result if result else None


def get_latest_facture_id():
    query = f"""
    SELECT MAX(DO_No) FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL where do_type=6
"""
    result = execute_select_all(query)
    return result[0][0] if result and result[0][0] else 127311


def handle_fact_entete(entete: list) -> list:

    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        set dateformat ymd;
        INSERT INTO [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL]
           ([DO_No]
            ,[DO_Type]
            ,[Client_ID]
            ,[CT_Num]
            ,[DO_TotalTTC]
            ,[DO_TotalHT]
            ,[DO_TotalTVA]
            ,[DO_Date]
            ,[DO_Status]
            ,[created_at]
            ,[DO_Entreprise_Sage])
     VALUES
           (?,?,?,?,?,?,?,?,?,?,?)
"""
    cursor_mssql.execute(script, entete)


def handle_fact_lignes(lignes: list):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        set dateformat ymd;
        INSERT INTO [TRANSIT].[dbo].[F_DOCLIGNE_DIGITAL]
           ([DO_No]
            ,[DO_Type]
            ,[Client_ID]
            ,[CT_Num]
            ,[ART_Design]
            ,[DO_TotalHT]
            ,[DO_Date]
            ,[DO_Status]
            ,[created_at]
            ,[DO_Entreprise_Sage])
     VALUES
           (?,?,?,?,?,?,?,?,?,?)
"""
    for ligne in lignes:
        cursor_mssql.execute(script, ligne)


def get_current_date():
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

# function to get the lastest day of the month in this format 2026-01-31 00:00:00.000


def get_last_day_of_month(year, month):
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    last_day = next_month - timedelta(days=1)
    return last_day.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def calculate_totals(entetes: list, is_tva_applicable: bool) -> tuple:
    """
    Calculate DO_TotalHT, DO_TotalTVA, and DO_TotalTTC.
    """
    DO_TotalHT = sum(int(entete[5]) for entete in entetes)
    DO_TotalTVA = DO_TotalHT * 0.18 if is_tva_applicable else 0
    DO_TotalTTC = DO_TotalHT + DO_TotalTVA
    return DO_TotalHT, DO_TotalTVA, DO_TotalTTC


def set_bl_valide(entetes: list, latest_fact_id):
    conn_mssql, cursor_mssql = dbo_mssql()
    for entete in entetes:
        script = f"""
        UPDATE [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL]
        SET do_valide = 1,do_facturereference = {latest_fact_id + 1}
        WHERE do_no = {entete[0]} and do_type = 3
        """
        cursor_mssql.execute(script)

        script = f"""
        UPDATE [TRANSIT].[dbo].[F_DOCLIGNE_DIGITAL]
        SET do_facturereference = {latest_fact_id + 1}
        WHERE do_no = {entete[0]} and do_type = 3
        """
        cursor_mssql.execute(script)


def build_facture(agence_dg: tuple, entetes: list, latest_fact_id, year, month):
    current_date = get_current_date()
    DO_TotalHT, DO_TotalTVA, DO_TotalTTC = calculate_totals(
        entetes, agence_dg[3] == 1
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


def main_process_factures_from_bl(jobID, year, month, entreprises: list, bls: list):
    year = int(year)
    month = int(month)

    # process_facture_detail(jobId, year, month, journal, database)

    latest_fact_id = get_latest_facture_id()

    count = 0

    for entreprise in entreprises:
        entetes = get_facture_entete_detail_by_company_id_and_bl(
            entreprise, bls, year, month)
        if not len(entetes):
            continue
        agence_dg = get_agence_dg_by_company_id(entreprise)
        if agence_dg:
            build_facture(agence_dg, entetes, latest_fact_id, year, month)
            latest_fact_id += 1

            count += 1

            requests.post(
                "http://172.30.0.1:3000/api/digitale/bonLivraison/events/job-finished",
                json={
                    "jobId": jobID,
                    "status": "pending",
                    "ec_total": len(entreprises),
                    "ec_count": count
                }
            )


def main_process_factures(jobID, year, month):
    year = int(year)
    month = int(month)

    # process_facture_detail(jobId, year, month, journal, database)
    entreprises = get_entreprises(year, month)

    latest_fact_id = get_latest_facture_id()

    count = 0

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

            requests.post(
                "http://172.30.0.1:3000/api/digitale/bonLivraison/events/job-finished",
                json={
                    "jobId": jobID,
                    "status": "pending",
                    "ec_total": len(entreprises),
                    "ec_count": count
                }
            )


def main_process_facture_by_entreprise(jobID, entreprises, year, month):
    year = int(year)
    month = int(month)

    # process_facture_detail(jobId, year, month, journal, database)
    latest_fact_id = get_latest_facture_id()

    count = 0

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

            requests.post(
                "http://172.30.0.1:3000/api/digitale/bonLivraison/events/job-finished",
                json={
                    "jobId": jobID,
                    "status": "pending",
                    "ec_total": len(entreprises),
                    "ec_count": count
                }
            )


# main_process_factures(2026, 1)


# main_process_facture_detail(1, 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')
