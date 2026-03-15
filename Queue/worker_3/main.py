from datetime import datetime
import re
import requests
from mssql_baeaubab.database import database_objects as dbo_mssql, execute_select_all, execute_select_one
from mysql_digital.database import database_objects as dbo_mysql, execute_select_all as mysql_execute_select_all


def get_new_articles():
    script_mssql = """
    SELECT  [Art_No]
  FROM [TRANSIT].[dbo].[F_ARTICLE_DIGITAL]
"""
    result = execute_select_all(script_mssql)
    print(result)

    script_mysql = ""

    if len(result):
        script_mysql = f"""
        select id,code,name,prix_vente,code_exo,code_non_exo from articles where id not in {','.join(result)}
    """
    else:
        script_mysql = """
        select id,code,name,prix_vente,code_exo,code_non_exo from articles 
    """
    result = mysql_execute_select_all(script_mysql)
    print(result)


def get_bl_documents():
    pass


def main_process_facture_detail(jobId, year, month, journal, database):

    # process_facture_detail(jobId, year, month, journal, database)
    get_new_articles()
    get_bl_documents()


main_process_facture_detail('', 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')

# main_process_facture_detail(1, 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')
