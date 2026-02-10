import re
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


def getData(year, month):
    conn_mysql, cursor_mysql = dbo_mysql()
    query = """
        Select JO_Num,EC_No,JM_Date,EC_Jour,EC_Date,EC_Piece,EC_RefPiece,CG_Num,CT_Num,EC_Intitule,
        EC_Echeance,EC_Sens,EC_Montant from ecritures
        where year(date_facture)=%s and month(date_facture)=%s and Status in (0,1) 
        """

    data = (year, month)

    cursor_mysql.execute(query, data)

    return cursor_mysql.fetchall()

    """ return {"JO_Num": rows[0], "EC_No": rows[1], "JM_Date": f'{rows[2]}',
            "EC_Jour": rows[3], "EC_Date": f'{rows[4]}', "EC_Piece": rows[5], "EC_RefPiece": rows[6],
            "CG_Num": rows[7], "CT_Num": rows[8], "EC_Intitule": rows[9], "EC_Echeance": f'{rows[10]}',
            "EC_Sens": rows[11], "EC_Montant": f'{rows[12]}'} """


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
            Select 1 from gbaeaubab23.dbo.f_compteG where cg_num={ec_deb[7]}
            """
        result = execute_select_one(sql)
        if not result:
            return False

    for ec_cred in credit:
        sql = f"""
            Select 1 from gbaeaubab23.dbo.f_compteG where cg_num={ec_cred[7]}
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
        if type(value[12]).__name__ != 'int' and type(value[12]).__name__ != 'float':
            return False
    return True


def EC_Sens_check(values: list):
    debit = [x for x in values if x[11] == 0]

    for ec_deb in debit:
        pattern = r"411"
        if not re.search(pattern, ec_deb[7]):
            return False

    for value in values:
        if type(value[7]).__name__ != 'int':
            return False

        if value[7] < 0 or value[7] > 1:
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

    return checked_data


def main_process():

    rowsByBill = getBills('2025', '09')

    rowsByEC = getData('2025', '09')

    for row in rowsByBill:
        filteredRows = [x for x in rowsByEC if x[6] == row[0]]

        checked_data = process_data(filteredRows, row[0])


main_process()
""" for row in rows:
    value = {"JO_Num": row[0], "EC_No": row[1], "JM_Date": f'{row[2]}',
             "EC_Jour": row[3], "EC_Date": f'{row[4]}', "EC_Piece": row[5], "EC_RefPiece": row[6],
             "CG_Num": row[7], "CT_Num": row[8], "EC_Intitule": row[9], "EC_Echeance": f'{row[10]}',
             "EC_Sens": row[11], "EC_Montant": f'{row[12]}'}
    process_data(value) """
