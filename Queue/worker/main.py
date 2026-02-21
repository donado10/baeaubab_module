import hashlib
import re

import requests
from mssql_baeaubab.database import execute_select_all, execute_select_one
from utils import get_log_timestamp, ini_settings, write_to_file
from mssql_baeaubab.database import database_objects as dbo_mssql
from mysql_digital.database import database_objects as dbo_mysql


def getBills(year, month):
    conn_mysql, cursor_mysql = dbo_mysql()
    query = """
        Select distinct EC_RefPiece from ecritures
        where year(date_facture)=%s and month(date_facture)=%s and Status in (0,1)
        """

    data = (year, month)

    cursor_mysql.execute(query, data)

    return cursor_mysql.fetchall()


def getBillsByRef(year, month, bills):
    conn_mysql, cursor_mysql = dbo_mysql()
    query = f"""
        Select distinct EC_RefPiece from ecritures
        where year(date_facture)=%s and month(date_facture)=%s and Status in (0,1) and EC_RefPiece in ({','.join(bills)})
        """

    data = (year, month)

    cursor_mysql.execute(query, data)

    return cursor_mysql.fetchall()


def getData(year, month):
    conn_mysql, cursor_mysql = dbo_mysql()
    query = """
        Select JO_Num,EC_No,JM_Date,EC_Jour,EC_Date,EC_Piece,EC_RefPiece,CG_Num,CT_Num,EC_Intitule,
        EC_Echeance,EC_Sens,EC_Montant,facture_id,date_facture from ecritures
        where year(date_facture)=%s and month(date_facture)=%s and Status in (0,1) 
        """

    data = (year, month)

    cursor_mysql.execute(query, data)

    return cursor_mysql.fetchall()


def getDataByRef(year, month, bills):
    conn_mysql, cursor_mysql = dbo_mysql()
    query = f"""
        Select JO_Num,EC_No,JM_Date,EC_Jour,EC_Date,EC_Piece,EC_RefPiece,CG_Num,CT_Num,EC_Intitule,
        EC_Echeance,EC_Sens,EC_Montant,facture_id,date_facture from ecritures
        where year(date_facture)=%s and month(date_facture)=%s and Status in (0,1) and EC_RefPiece in ({','.join(bills)})
        """

    data = (year, month)

    cursor_mysql.execute(query, data)

    return cursor_mysql.fetchall()


def is_balanced(values: list):
    debit = [x for x in values if x[11] == 0]
    credit = [x for x in values if x[11] == 1]

    debit_amount = debit[0][12]
    credit_amount = 0

    for amount in credit:
        credit_amount = credit_amount + amount[12]

    return debit_amount == credit_amount


def JO_Num_check(values: list):

    for value in values:
        if type(value[0]).__name__ != 'str':
            return False

        if len(value[0]) > 7:
            return False
        continue
    return True


def EC_Jour_check(values: list):
    for value in values:
        if type(value[3]).__name__ != 'int':
            return False

        if value[3] <= 0 or value[3] > 31:
            return False
        continue
    return True


def EC_RefPiece_check(values: list):
    for value in values:
        if type(value[6]).__name__ != 'str':
            return False

        if len(value[6]) > 17:
            return False
        continue
    return True


def CG_Num_check(values: list):

    debit = [x for x in values if x[11] == 0]
    credit = [x for x in values if x[11] == 1]

    for ec_deb in debit:
        sql = f"""
            Select 1 from gbaeaubab23.dbo.f_compteG where cg_num='{ec_deb[7]}'
            """
        result = execute_select_one(sql)
        if not result:
            return False

    for ec_cred in credit:
        sql = f"""
            Select 1 from gbaeaubab23.dbo.f_compteG where cg_num='{ec_cred[7]}'
            """
        result = execute_select_one(sql)

        if not result:
            return False

    return True


def CT_Num_check(values: list):
    debit = [x for x in values if x[11] == 0]

    for ec_deb in debit:
        sql = f"""
            Select 1 from gbaeaubab23.dbo.f_comptet where ct_num='{ec_deb[8]}'
            """

        result = execute_select_one(sql)
        if not result:
            return False
    return True


def EC_Intitule_check(values: list):
    for value in values:
        if type(value[9]).__name__ != 'str':
            return False

        if len(value[9]) > 69:
            return False
    return True


def EC_Montant_check(values: list):
    for value in values:
        if type(int(value[12])).__name__ != 'int' or type(float(value[12])).__name__ != 'float':
            return False
    return True


def EC_Sens_check(values: list):
    debit = [x for x in values if x[11] == 0]

    for ec_deb in debit:
        pattern = r"411"
        if not re.search(pattern, ec_deb[7]):
            return False

    for value in values:
        if type(int(value[7])).__name__ != 'int':
            return False

        if int(value[11]) < 0 or int(value[11]) > 1:
            return False

    return True


def process_data(value: list, row: str):

    checked_data = {
        "refpiece": row,
        "balanced": False,
        "JO_Num": False,
        "EC_Jour": False,
        "EC_RefPiece": False,
        "CG_Num": False,
        "CT_Num": False,
        "EC_Sens": False,
        "EC_Montant": False,
        "EC_No": True,
        "JM_Date": True,
        "EC_Date": True,
        "EC_Piece": True,
        "Status": 0
    }
    checked_data['balanced'] = is_balanced(value)
    checked_data['JO_Num'] = JO_Num_check(value)
    checked_data['EC_Jour'] = EC_Jour_check(value)
    checked_data['EC_RefPiece'] = EC_RefPiece_check(value)
    checked_data['CG_Num'] = CG_Num_check(value)
    checked_data['CT_Num'] = CT_Num_check(value)
    checked_data['EC_Intitule'] = EC_Intitule_check(value)
    checked_data['EC_Montant'] = EC_Montant_check(value)
    checked_data['EC_Sens'] = EC_Sens_check(value)

    if checked_data['balanced'] and checked_data['JO_Num'] and checked_data['EC_Jour'] and checked_data['EC_RefPiece'] and checked_data['CG_Num'] and checked_data['CT_Num'] and checked_data['EC_Intitule'] and checked_data['EC_Montant'] and checked_data['EC_Sens']:
        checked_data['Status'] = 1
    else:
        checked_data['Status'] = 0
    return checked_data


def set_in_invalid_table_sage(invalid_rows):
    if not len(invalid_rows):
        return
    invalid_rows_query_sage = f"""
        insert into transit.dbo.f_ecriturec_invalid(
            [Balanced]
           ,[JO_Num]
           ,[EC_No]
           ,[JM_Date]
           ,[EC_Jour]
           ,[EC_Date]
           ,[EC_Piece]
           ,[EC_RefPiece]
           ,[CG_Num]
           ,[CT_Num]
           ,[EC_Intitule]
           ,[EC_Sens]
           ,[EC_Montant])
        Values
          (?,?,?,?,?,?,?,?,?,?,?,?,?)
    """
    conn_mssql, cursor_mssql = dbo_mssql()

    cursor_mssql.executemany(invalid_rows_query_sage, invalid_rows)


def set_in_invalid_table_digital(invalid_rows_ref):
    if not len(invalid_rows_ref):
        return
    invalid_rows_query = f"""
        update ecritures
        set status = 1
        where ec_refpiece in ({','.join(invalid_rows_ref)})
    """
    conn_mysql, cursor_mysql = dbo_mysql()

    cursor_mysql.execute(invalid_rows_query)


def set_in_temp_table_sage(valid_rows):
    if not len(valid_rows):
        return

    valid_rows_query_sage = f"""
        insert into transit.dbo.f_ecriturec_temp(
        [JO_Num]
      ,[EC_No]
      ,[JM_Date]
      ,[EC_Jour]
      ,[EC_Date]
      ,[EC_Piece]
      ,[EC_RefPiece]
      ,[CG_Num]
      ,[CT_Num]
      ,[EC_Intitule]
      ,[EC_Sens]
      ,[EC_Montant]
      ,[facture_id]
      ,[date_facture]
      ,[row_status]
      ,[hash_row])
      Values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """
    conn_mssql, cursor_mssql = dbo_mssql()

    cursor_mssql.executemany(valid_rows_query_sage, valid_rows)


def set_in_valid_table_digital(valid_rows_ref):
    if not len(valid_rows_ref):
        return
    valid_rows_query_digital = f"""
        update ecritures
        set status = 2
        where ec_refpiece in ({','.join(valid_rows_ref)})
    """
    conn_mysql, cursor_mysql = dbo_mysql()

    cursor_mysql.execute(valid_rows_query_digital)


def handle_invalid_rows_in_sage(invalid_rows_ref):
    if not len(invalid_rows_ref):
        return
    invalid_rows_temp = f"""
        delete from transit.dbo.f_ecriturec_temp
        where ec_refpiece in ({','.join(invalid_rows_ref)})
    """
    invalid_rows_in_invalid_table = f"""
        delete from transit.dbo.f_ecriturec_invalid
        where ec_refpiece in ({','.join(invalid_rows_ref)})
    """
    conn_mssql, cursor_mssql = dbo_mssql()

    cursor_mssql.execute(invalid_rows_temp)
    cursor_mssql.execute(invalid_rows_in_invalid_table)


def hash256_string(text: str) -> str:
    # Convert string to bytes
    data = text.encode('utf-8')

    # First SHA256
    first_hash = hashlib.sha256(data).digest()

    # Second SHA256
    second_hash = hashlib.sha256(first_hash).hexdigest()

    return str(second_hash)


def main_process_all(jobId, year, month):

    conn_mssql, _ = dbo_mssql()
    conn_mysql, _ = dbo_mysql()

    rowsByBill = getBills(year, month)

    if len(rowsByBill) == 0:
        return

    rowsByEC = getData(year, month)

    invalid_rows = []
    invalid_rows_ref = []
    temp_rows = []
    valid_rows_ref = []

    row_count = 0

    for row in rowsByBill:
        filteredRows = [x for x in rowsByEC if x[6] == row[0]]

        checked_data = process_data(filteredRows, row[0])
        if checked_data["Status"] == 0:
            for fr in filteredRows:
                hash = hash256_string(
                    f"{fr[0]},{fr[1]},{fr[2]},{fr[3]},{fr[4]},{fr[5]},{fr[6]},{fr[7]},{fr[8]},{fr[9]},{fr[11]},{fr[12]},{fr[13]},{fr[14]}")
                temp_rows.append(
                    (fr[0], fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], str(fr[7]), fr[8], fr[9],  fr[11], fr[12], fr[13], fr[14], 1, f'0x{hash}'))

            invalid_rows.append((1 if checked_data["balanced"] else 0, 1 if checked_data["JO_Num"] else 0, 1 if checked_data["EC_No"] else 0, 1 if checked_data["JM_Date"] else 0, 1 if checked_data["EC_Jour"] else 0, 1 if checked_data["EC_Date"] else 0,
                                1 if checked_data["EC_Piece"] else 0, checked_data["refpiece"], 1 if checked_data["CG_Num"] else 0, 1 if checked_data["CT_Num"] else 0, 1 if checked_data["EC_Intitule"] else 0, 1 if checked_data["EC_Sens"] else 0, 1 if checked_data["EC_Montant"] else 0))
            invalid_rows_ref.append(f"'{row[0]}'")
        if checked_data["Status"] == 1:
            for fr in filteredRows:
                hash = hash256_string(
                    f"{fr[0]},{fr[1]},{fr[2]},{fr[3]},{fr[4]},{fr[5]},{fr[6]},{fr[7]},{fr[8]},{fr[9]},{fr[11]},{fr[12]},{fr[13]},{fr[14]}")
                temp_rows.append(
                    (fr[0], fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], str(fr[7]), fr[8], fr[9],  fr[11], fr[12], fr[13], fr[14], 2, f'0x{hash}'))
            valid_rows_ref.append(f"'{row[0]}'")
        row_count = row_count + 1
        requests.post(
            "http://172.17.0.1:3000/api/digitale/ecritures/events/job-finished",
            json={
                "jobId": jobId,
                "status": "pending",
                "ec_total": len(rowsByBill),
                "ec_count": row_count
            }
        )

    handle_invalid_rows_in_sage(invalid_rows_ref)

    set_in_invalid_table_sage(invalid_rows)

    set_in_invalid_table_digital(invalid_rows_ref)

    set_in_temp_table_sage(temp_rows)

    set_in_valid_table_digital(valid_rows_ref)
    conn_mssql.commit()
    conn_mysql.commit()


def main_process_some(jobId, year, month, bills):

    conn_mssql, _ = dbo_mssql()
    conn_mysql, _ = dbo_mysql()

    bills = [f"'{bill}'" for bill in bills]

    if not len(bills):

        return

    rowsByBill = getBillsByRef(year, month, bills)

    rowsByEC = getDataByRef(year, month, bills)

    invalid_rows = []
    invalid_rows_ref = []
    temp_rows = []
    valid_rows_ref = []

    row_count = 0

    for row in rowsByBill:
        filteredRows = [x for x in rowsByEC if x[6] == row[0]]

        checked_data = process_data(filteredRows, row[0])
        if checked_data["Status"] == 0:
            for fr in filteredRows:
                hash = hash256_string(
                    f"{fr[0]},{fr[1]},{fr[2]},{fr[3]},{fr[4]},{fr[5]},{fr[6]},{fr[7]},{fr[8]},{fr[9]},{fr[11]},{fr[12]},{fr[13]},{fr[14]}")
                temp_rows.append(
                    (fr[0], fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], str(fr[7]), fr[8], fr[9],  fr[11], fr[12], fr[13], fr[14], 1, f'0x{hash}'))

            invalid_rows.append((1 if checked_data["balanced"] else 0, 1 if checked_data["JO_Num"] else 0, 1 if checked_data["EC_No"] else 0, 1 if checked_data["JM_Date"] else 0, 1 if checked_data["EC_Jour"] else 0, 1 if checked_data["EC_Date"] else 0,
                                1 if checked_data["EC_Piece"] else 0, checked_data["refpiece"], 1 if checked_data["CG_Num"] else 0, 1 if checked_data["CT_Num"] else 0, 1 if checked_data["EC_Intitule"] else 0, 1 if checked_data["EC_Sens"] else 0, 1 if checked_data["EC_Montant"] else 0))
            invalid_rows_ref.append(f"'{row[0]}'")
        if checked_data["Status"] == 1:
            for fr in filteredRows:
                hash = hash256_string(
                    f"{fr[0]},{fr[1]},{fr[2]},{fr[3]},{fr[4]},{fr[5]},{fr[6]},{fr[7]},{fr[8]},{fr[9]},{fr[11]},{fr[12]},{fr[13]},{fr[14]}")
                temp_rows.append(
                    (fr[0], fr[1], fr[2], fr[3], fr[4], fr[5], fr[6], str(fr[7]), fr[8], fr[9],  fr[11], fr[12], fr[13], fr[14], 2, f'0x{hash}'))
            valid_rows_ref.append(f"'{row[0]}'")
        row_count = row_count + 1
        requests.post(
            "http://172.17.0.1:3000/api/digitale/ecritures/events/job-finished",
            json={
                "jobId": jobId,
                "status": "pending",
                "ec_total": len(rowsByBill),
                "ec_count": row_count
            }
        )

    handle_invalid_rows_in_sage(invalid_rows_ref)

    set_in_invalid_table_sage(invalid_rows)

    set_in_invalid_table_digital(invalid_rows_ref)

    set_in_temp_table_sage(temp_rows)

    set_in_valid_table_digital(valid_rows_ref)
    conn_mssql.commit()
    conn_mysql.commit()
