from datetime import datetime

import requests
from mssql_baeaubab.database import database_objects as dbo_mssql, execute_select_all, execute_select_one
from mysql_digital.database import database_objects as dbo_mysql


def build_date(year: int, month: int) -> str:
    return f"{year}-{month:02d}-01"


def change_date_format():
    conn_mssql, cursor_mssql = dbo_mssql()

    insert_query = 'SET DATEFORMAT ymd'
    cursor_mssql.execute(insert_query)

    # conn_mssql.commit()


def create_jmouv(year, month, journal, database):
    change_date_format()

    conn_mssql, cursor_mssql = dbo_mssql()

    check_query = f"select 1 from {database}.dbo.F_JMOUV where jm_date= '{build_date(year, month)}'"

    is_jmouv_exists = execute_select_one(check_query)

    print(is_jmouv_exists)

    if is_jmouv_exists:
        return

    insert_query = f'insert into {database}.dbo.F_JMOUV (JO_Num,JM_Date,JM_Cloture,JM_Impression) values (?,?,?,?)'
    cursor_mssql.execute(insert_query, journal, build_date(year, month), 0, 0)
    # conn_mssql.commit()


def getData(year, month):
    query = f"""
        Select JO_Num,EC_No,JM_Date,EC_Jour,EC_Date,EC_Piece,EC_RefPiece,CG_Num,CT_Num,EC_Intitule,
        EC_Sens,EC_Montant from TRANSIT.dbo.f_ecriturec_temp
        where year(jm_date)={year} and month(jm_date)={month} and row_status=2 
        """

    return execute_select_all(query)


def getBills(year, month):
    query = f"""
        Select distinct EC_RefPiece from TRANSIT.dbo.f_ecriturec_temp
        where year(jm_date)={year} and month(jm_date)={month} and row_status=2 
        """

    return execute_select_all(query)


def convert_to_datetime(date_string):
    try:
        # Convert the input date string to a datetime object
        if date_string == None:
            return date_string
        datetime_object = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
        return datetime_object
    except ValueError as e:
        # Handle the case where the input string is not in the expected format
        print(f"Error: {e}")
        return None


def process_data(rows, bill):
    data = []

    non_required = {
        "EC_NoLink": 0,
        "EC_TresoPiece": "",
        "N_Reglement": 0,
        "EC_Parite": "0.000000",
        "EC_Quantite": "0.000000",
        "N_Devise": 0,
        "EC_Lettre": 0,
        "EC_Lettrage": "",
        "EC_Point": 0,
        "EC_Pointage": "",
        "EC_Impression": 0,
        "EC_Cloture": 0,
        "EC_CType": 0,
        "EC_Rappel": 0,
        "CT_NumCont": None,
        "EC_LettreQ": 0,
        "EC_LettrageQ": "",
        "EC_ANType": 0,
        "EC_RType": 0,
        "EC_Devise": "0.000000",
        "EC_Remise": 0,
        "EC_ExportExpert": 0,
        "EC_ExportRappro": 0,
        "TA_Code": None,
        "EC_Norme": 0,
        "TA_Provenance": 0,
        "EC_PenalType": 0,
        "EC_DatePenal": "1753-01-01 00:00:00",
        "EC_DateRelance": "1753-01-01 00:00:00",
        "EC_DateRappro": "1753-01-01 00:00:00",
        "EC_Reference": "",
        "EC_StatusRegle": 0,
        "EC_MontantRegle": "0.000000",
        "EC_DateRegle": "1753-01-01 00:00:00",
        "EC_RIB": 0,
        "EC_NoCloture": 1,
        "EC_DateOp": "1753-01-01 00:00:00",
        "EC_DateCloture": "1753-01-01 00:00:00",
        "EC_PayNowUrl": "",
        "EC_ExtProvenance": 0,
        "EC_ExtSequence": 0,
        "cbCreationUser": "CA2D6792-F19C-4A59-9EA0-16FEB0560939",
        "SAC_id": "00000000-0000-0000-0000-000000000000"
    }

    for row in rows:
        required = {
        }
        required['EC_Echeance'] = "1753-01-01 00:00:00"
        required['JO_Num'] = row[0]
        required['EC_No'] = row[1]
        required['JM_Date'] = row[2]
        required['EC_Jour'] = row[3]
        required['EC_Date'] = row[4]
        required['EC_Piece'] = row[5]
        required['EC_RefPiece'] = row[6]
        required['CG_Num'] = row[7]
        if row[8]:
            required['CT_Num'] = row[8]
        else:
            required['CT_Num'] = None

        required['EC_Intitule'] = row[9]
        required['EC_Sens'] = row[10]
        required['EC_Montant'] = row[11]

        data.append(
            {'Obligatoire': required, 'Auto': non_required})

    return data


def insert_data(ecritures, database, journal):
    conn_mssql, cursor_mssql = dbo_mssql()

    insert_query = f"Insert into {database}.dbo.F_ECRITUREC (\
                    EC_No,JO_Num,JM_Date,EC_Jour,EC_Date,EC_Piece,EC_RefPiece,\
                    CG_Num,CT_Num,EC_Intitule,EC_Echeance,EC_Sens,EC_Montant, \
                    EC_NoLink,EC_TresoPiece,N_Reglement,EC_Parite,EC_Quantite,\
                    N_Devise,EC_Lettre,EC_Lettrage,EC_Point,EC_Pointage,EC_Impression,\
                    EC_Cloture,EC_CType,EC_Rappel,CT_NumCont,EC_LettreQ,EC_LettrageQ,\
                    EC_ANType,EC_RType,EC_Devise,EC_Remise,EC_ExportExpert,EC_ExportRappro,\
                    TA_Code,EC_Norme,TA_Provenance,EC_PenalType,EC_DatePenal,\
                    EC_DateRelance,EC_DateRappro,EC_Reference,EC_StatusRegle,\
                    EC_MontantRegle,EC_DateRegle,EC_RIB,EC_NoCloture,EC_DateOp,\
                    EC_DateCloture,EC_PayNowUrl,EC_ExtProvenance,\
                    EC_ExtSequence,cbCreationUser,SAC_id)\
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,\
                            ?,?,?,?,?,?,?,?,?,?,?,\
                            ?,?,?,?,?,?,?,?,?,?,?,\
                            ?,?,?,?,?,?,?,?,?,?,\
                            ?,?,?,?,?,?,?,?,?,?)"

    for ecriture in ecritures:
        try:
            cursor_mssql.execute(insert_query, 0, journal,
                                 ecriture['Obligatoire']['JM_Date'],
                                 ecriture['Obligatoire']['EC_Jour'], ecriture['Obligatoire']['EC_Date'],
                                 ecriture['Obligatoire']['EC_Piece'], ecriture['Obligatoire']['EC_RefPiece'],
                                 ecriture['Obligatoire']['CG_Num'], ecriture['Obligatoire']['CT_Num'], ecriture['Obligatoire']['EC_Intitule'],
                                 ecriture['Obligatoire']['EC_Echeance'],
                                 ecriture['Obligatoire']['EC_Sens'], ecriture['Obligatoire']['EC_Montant'],
                                 ecriture['Auto']['EC_NoLink'], ecriture['Auto']['EC_TresoPiece'],
                                 ecriture['Auto']['N_Reglement'], ecriture['Auto']['EC_Parite'],
                                 ecriture['Auto']['EC_Quantite'], ecriture['Auto']['N_Devise'],
                                 ecriture['Auto']['EC_Lettre'], ecriture['Auto']['EC_Lettrage'],
                                 ecriture['Auto']['EC_Point'],
                                 ecriture['Auto']['EC_Pointage'], ecriture['Auto']['EC_Impression'],
                                 ecriture['Auto']['EC_Cloture'], ecriture['Auto']['EC_CType'],
                                 ecriture['Auto']['EC_Rappel'], ecriture['Auto']['CT_NumCont'],
                                 ecriture['Auto']['EC_LettreQ'], ecriture['Auto']['EC_LettrageQ'],
                                 ecriture['Auto']['EC_ANType'], ecriture['Auto']['EC_RType'],
                                 ecriture['Auto']['EC_Devise'], ecriture['Auto']['EC_Remise'],
                                 ecriture['Auto']['EC_ExportExpert'],
                                 ecriture['Auto']['EC_ExportRappro'], ecriture['Auto']['TA_Code'],
                                 ecriture['Auto']['EC_Norme'], ecriture['Auto']['TA_Provenance'],
                                 ecriture['Auto']['EC_PenalType'], convert_to_datetime(
                                     ecriture['Auto']['EC_DatePenal']),
                                 convert_to_datetime(ecriture['Auto']['EC_DateRelance']), convert_to_datetime(
                                     ecriture['Auto']['EC_DateRappro']),
                                 ecriture['Auto']['EC_Reference'], ecriture['Auto']['EC_StatusRegle'],
                                 ecriture['Auto']['EC_MontantRegle'], convert_to_datetime(
                                     ecriture['Auto']['EC_DateRegle']),
                                 ecriture['Auto']['EC_RIB'], ecriture['Auto']['EC_NoCloture'],
                                 convert_to_datetime(ecriture['Auto']['EC_DateOp']), convert_to_datetime(
                                     ecriture['Auto']['EC_DateCloture']),
                                 ecriture['Auto']['EC_PayNowUrl'], ecriture['Auto']['EC_ExtProvenance'],
                                 ecriture['Auto']['EC_ExtSequence'], ecriture['Auto']['cbCreationUser'],
                                 ecriture['Auto']['SAC_id']
                                 )
        #    conn_mssql.commit()
           # write_to_file(file_path='./logs/success.log.txt',content=f'{data}\n\n')
        except Exception as e:
            print(e)
            continue


def change_status(bills, journal):
    conn_mssql, cursor_mssql = dbo_mssql()
    conn_mysql, cursor_mysql = dbo_mysql()

    change_status_digital = f"""
        update ecritures
        set status = 3,jo_num='{journal}'
        where ec_refpiece in ({','.join(bills)})
    """

    change_status_sage = f"""
        update transit.dbo.f_ecriturec_temp
        set row_status = 3,jo_num='{journal}'
        where ec_refpiece in ({','.join(bills)})
    """
    cursor_mysql.execute(change_status_digital)
    cursor_mssql.execute(change_status_sage)


def main_process_facture_detail(jobId, year, month, journal, database):

    conn_mssql, cursor_mssql = dbo_mssql()
    conn_mysql, cursor_mysql = dbo_mysql()
    create_jmouv(year, month, journal, database)

    obligatoire = {}

    rowsByBill = getBills(year, month)
    rowsByEC = getData(year, month)

    if len(rowsByBill) == 0:
        return

    rowsByEC = getData(year, month)

    invalid_rows = []
    invalid_rows_ref = []
    temp_rows = []
    valid_rows_ref = []

    row_count = 0

    for row in rowsByBill:
        row_count = row_count + 1
        filteredRows = [x for x in rowsByEC if x[6] == row[0]]

        data = process_data(filteredRows, row[0])
        insert_data(data, database, journal)
        requests.post(
            "http://172.17.0.1:3000/api/digitale/ecritures/events/job-finished",
            json={
                "jobId": jobId,
                "status": "pending",
                "ec_total": len(rowsByBill),
                "ec_count": row_count
            }
        )

    change_status([f"'{x[0]}'" for x in rowsByBill], journal)
    conn_mssql.commit()
    conn_mysql.commit()


# main_process_facture_detail(1, 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')
