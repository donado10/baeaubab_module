from datetime import datetime
import re
import requests
from mssql_baeaubab.database import database_objects as dbo_mssql, execute_select_all, execute_select_one
from mysql_digital.database import database_objects as dbo_mysql, execute_select_all as mysql_execute_select_all


def insert_new_articles(articles: list):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        INSERT INTO [TRANSIT].[dbo].[F_ARTICLE_DIGITAL]
           ([Art_No]
           ,[Art_Code]
           ,[Art_Design]
           ,[Art_Price]
           ,[CG_Num_exo]
           ,[CG_Num_non_exo])
     VALUES
           (?,?,?,?,?,?)
"""
    cursor_mssql.executemany(script, articles)
    conn_mssql.commit()


def insert_new_enterprises(enterprises: list):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        INSERT INTO [TRANSIT].[dbo].[F_ENTREPRISE_DIGITAL]
           ([EN_No]
           ,[EN_Intitule]
           ,[creation_at])
     VALUES
           (?,?,?)
"""
    cursor_mssql.executemany(script, enterprises)
    conn_mssql.commit()


def insert_new_clients(clients: list):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        INSERT INTO [TRANSIT].[dbo].[F_COMPTET_DIGITAL]
           ([CT_No]
           ,[CT_Intitule]
           ,[CT_Num]
           ,[CT_TVA]
           ,[CT_DG]
           ,[CT_Entreprise]
           ,[created_at])
     VALUES
           (?,?,?,?,?,?,?)
"""
    cursor_mssql.executemany(script, clients)
    conn_mssql.commit()


def insert_new_client_prices(ArtPrix: list):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        INSERT INTO [TRANSIT].[dbo].[F_ARTPRIX_DIGITAL]
           ([ArtPrice_No]
           ,[ART_No]
           ,[CT_No]
           ,[ArtPrice_Value]
           ,[ArtPrice_StartDate]
           ,[ArtPrice_EndDate]
           ,[created_at])
     VALUES
           (?,?,?,?,?,?,?)
"""
    cursor_mssql.executemany(script, ArtPrix)
    conn_mssql.commit()


def handle_new_articles():
    script_mssql = """
    SELECT  [Art_No]
  FROM [TRANSIT].[dbo].[F_ARTICLE_DIGITAL]
"""
    result = execute_select_all(script_mssql)
    result = [str(x[0]) for x in result]

    script_mysql = ""

    if len(result):
        script_mysql = f"""
        select id,code,name,prix_vente,code_exo,code_non_exo from articles where id not in ({','.join(result)})
    """
    else:
        script_mysql = """
        select id,code,name,prix_vente,code_exo,code_non_exo from articles 
    """

    result = mysql_execute_select_all(script_mysql)
    if not len(result):
        return
    insert_new_articles(result)


def handle_entreprise():
    script_mssql = """
    SELECT  EN_No
  FROM TRANSIT.dbo.F_ENTREPRISE_DIGITAL
"""
    result = execute_select_all(script_mssql)
    result = [str(x[0]) for x in result]

    script_mysql = ""

    if len(result):
        script_mysql = f"""
        SELECT id,name,created_at FROM entreprises where id not in ({','.join(result)})
    """
    else:
        script_mysql = """
        SELECT id,name,created_at FROM entreprises 
    """

    result = mysql_execute_select_all(script_mysql)
    if not len(result):
        return
    insert_new_enterprises(result)


def handle_new_client():
    script_mssql = """
    SELECT  CT_No
  FROM TRANSIT.dbo.F_COMPTET_DIGITAL
"""
    result = execute_select_all(script_mssql)
    result = [str(x[0]) for x in result]

    script_mysql = ""

    if len(result):
        script_mysql = f"""
        select id,prenom,code_compta,tva_id,is_entreprise,entreprise_id ,created_at from clients where id not in ({','.join(result)})
    """
    else:
        script_mysql = """
        select id,prenom,code_compta,tva_id,is_entreprise,entreprise_id ,created_at from clients 
    """

    result = mysql_execute_select_all(script_mysql)
    if not len(result):
        return
    insert_new_clients(result)


def handle_client_price():
    script_mssql = """
    SELECT  ArtPrice_No
  FROM TRANSIT.dbo.F_ARTPRIX_DIGITAL
"""
    result = execute_select_all(script_mssql)
    result = [str(x[0]) for x in result]

    script_mysql = ""

    if len(result):
        script_mysql = f"""
        SELECT  id,article_id,client_id,valeur,start_date,end_date,created_at FROM client_prices  where id not in ({','.join(result)}) order by client_id
    """
    else:
        script_mysql = """
        SELECT  id,article_id,client_id,valeur,start_date,end_date,created_at FROM client_prices order by client_id 
    """

    result = mysql_execute_select_all(script_mysql)
    if not len(result):
        return
    insert_new_client_prices(result)


def update_entreprise_tva():
    conn_mssql, cursor_mssql = dbo_mssql()
    script_mssql = """
        update en
  set en.EN_TVA = ct.CT_TVA
  from transit.dbo.f_entreprise_digital en inner join transit.dbo.f_comptet_digital ct on en.EN_No = ct.CT_Entreprise where ct_dg = 1 
"""

    cursor_mssql.execute(script_mssql)
    conn_mssql.commit()


def handle_clients():
    handle_entreprise()
    handle_new_client()
    update_entreprise_tva()
    handle_client_price()


def handle_bl_documents():
    pass


def main_process_facture_detail(jobId, year, month, journal, database):

    # process_facture_detail(jobId, year, month, journal, database)
    handle_new_articles()
    handle_clients()
    handle_bl_documents()


main_process_facture_detail('', 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')

# main_process_facture_detail(1, 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')
