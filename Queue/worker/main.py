from mssql_baeaubab.database import execute_select_all
from utils import get_log_timestamp, ini_settings, write_to_file
from mssql_baeaubab.database import database_objects as dbo_mssql
from mysql_digital.database import database_objects as dbo_mysql

conn_mssql, cursor_mssql = dbo_mssql()
conn_mysql, cursor_mysql = dbo_mysql()


def getBills(year, month):
    query = """
        Select distinct EC_RefPiece from ecritures
        where year(date_facture)=%s and month(date_facture)=%s and Status in (0,1)
        """

    data = (year, month)

    cursor_mysql.execute(query, data)

    return cursor_mysql.fetchall()


def getData(year, month):
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


def process_data(value: list, row: str):

    checked_data = {
        "refpiece": row,
        "balanced": False,
        "JO_Num": False
    }
    checked_data['balanced'] = is_balanced(value)
    checked_data['JO_Num'] = JO_Num_check(value)

    return checked_data


rowsByBill = getBills('2025', '09')

rowsByEC = getData('2025', '09')


for row in rowsByBill:
    filteredRows = [x for x in rowsByEC if x[6] == row[0]]

    checked_data = process_data(filteredRows, row[0])

    print(checked_data)


""" for row in rows:
    value = {"JO_Num": row[0], "EC_No": row[1], "JM_Date": f'{row[2]}',
             "EC_Jour": row[3], "EC_Date": f'{row[4]}', "EC_Piece": row[5], "EC_RefPiece": row[6],
             "CG_Num": row[7], "CT_Num": row[8], "EC_Intitule": row[9], "EC_Echeance": f'{row[10]}',
             "EC_Sens": row[11], "EC_Montant": f'{row[12]}'}
    process_data(value) """
