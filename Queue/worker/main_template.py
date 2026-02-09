from mssql_baeaubab.database import execute_select_all
from utils import get_log_timestamp, ini_settings, write_to_file
from mssql_baeaubab.database import database_objects as dbo_mssql
from mysql_digital.database import database_objects as dbo_mysql

conn_mssql, cursor_mssql = dbo_mssql()
conn_mysql, cursor_mysql = dbo_mysql()


def change_client_status(value):

    sql = """
    UPDATE transit.dbo.f_comptet
    SET status = ?
    WHERE ct_num = ?
    """

    cursor_mssql.execute(sql, (1, value))


def load_to_digital(values):
    query = """
        INSERT INTO customers(nom_client,adresse,mobile,email,code_compta)
        values (%s,%s,%s,%s,%s)
        """

    data = (values[1], values[3], values[4], values[5], values[0])

    cursor_mysql.execute(query, data)


try:
    values = execute_select_all(
        "select ct_num,ct_intitule,ct_contact,ct_adresse,ct_telephone,ct_email,"
        "ct_ville,ct_coderegion,ct_numpayeur from transit.dbo.f_comptet where status=0")

    for value in values:
        load_to_digital(value)
        change_client_status(value[0])
        conn_mysql.commit()
        conn_mssql.commit()

    success_log_location = ini_settings()['Config']['success_log']
    if len(values) > 0:
        write_to_file(
            success_log_location, f'{get_log_timestamp()} [SUCCESS] Nouveau client ({', '.join(map(str, values))}) !')
        print(
            f'{get_log_timestamp()} [SUCCESS] Nouveau client ({', '.join(map(str, values))}) !')
    else:
        write_to_file(
            success_log_location, f'{get_log_timestamp()} [SUCCESS] Aucun client !')
        print(
            f'{get_log_timestamp()} [SUCCESS] Aucun client !')


except Exception as e:
    conn_mysql.rollback()
    conn_mssql.rollback()
    error_log_location = ini_settings()['Config']['error_log']
    write_to_file(
        error_log_location, f'{get_log_timestamp()} [ERROR] {str(e)}')
    print(f'{get_log_timestamp()} [ERROR] {str(e)}')
