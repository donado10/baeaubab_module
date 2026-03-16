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
        select art.id as id,code,art.name as name,prices.valeur,code_exo,code_non_exo from articles art inner join prices
        on art.id = prices.article_id 
        where art.id not in ({','.join(result)})
    """
    else:
        script_mysql = """
        select art.id as id,code,art.name as name,prices.valeur,code_exo,code_non_exo from articles art inner join prices
        on art.id = prices.article_id 
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


def get_bls(year, month):
    script_mssql = """
    SELECT  DO_No
  FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL
"""
    result = execute_select_all(script_mssql)
    result = [str(x[0]) for x in result]

    script_mysql = ""

    if len(result):
        script_mysql = f"select id from distribution_lines where year(created_at)={year} and month(created_at)={month} and id not in ({','.join(result)})"

    else:
        script_mysql = f"select id from distribution_lines where year(created_at)={year} and month(created_at)={month}"

    results = mysql_execute_select_all(script_mysql)
    return [x[0] for x in results]


def get_bl(bl: int):
    script = f"""SELECT dl.id,3 as do_type,client_id,cl.code_compta,qte,article_ids,date,dl.created_at,dl.status FROM distribution_lines dl inner join clients cl
    on dl.client_id = cl.id
    where dl.id = {bl}
    ORDER BY dl.id ASC """

    results = mysql_execute_select_all(script)
    return results[0]


def handle_bl_entete(bl: tuple) -> list:
    entete = []
    entete.append(bl[0])
    entete.append(bl[1])
    entete.append(bl[2])
    entete.append(bl[3])
    entete.append(bl[6])
    entete.append(bl[7])
    entete.append(bl[8])

    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        set dateformat ymd;
        INSERT INTO [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL]
           ([DO_No]
           ,[DO_Type]
           ,[Client_ID]
           ,[CT_Num]
           ,[DO_Date]
           ,[created_at]
           ,[DO_Status])
     VALUES
           (?,?,?,?,?,?,?)
"""
    cursor_mssql.execute(script, entete)

    return entete


def get_price(client_id, art: str):
    script_mssql = f"""
    select [ArtPrice_Value] from [TRANSIT].[dbo].[F_ARTPRIX_DIGITAL]
      where ct_no = '{client_id}' and art_no = '{art}' order by created_at desc
      """

    result = execute_select_one(script_mssql)

    if result:
        return result[0]
    else:
        script_mssql = f"""
    select [Art_price] from [TRANSIT].[dbo].[F_ARTICLE_DIGITAL]
      where  art_no = '{art}' 
      """
        result = execute_select_one(script_mssql)
        return result[0]


def handle_artqteprix(client_id: str, qte: str, art: str):

    qte_format = []
    art_format = []
    price_format = []

    if not qte == None:
        qte_format = qte.split(';')
        qte_format = [x for x in qte_format if x != '']
    if not art == None:
        art_format = art.split(';')
        art_format = [x for x in art_format if x != '']

    if len(qte_format) and len(art_format):
        for art in art_format:
            price_format.append(get_price(client_id, art))

    return qte_format, art_format, price_format


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


def insert_bl_ligne(ligne: list):

    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
                set dateformat ymd;
                INSERT INTO [TRANSIT].[dbo].[F_DOCLIGNE_DIGITAL]
                ([DO_No]
                ,[DO_Type]
                ,[Client_ID]
                ,[CT_Num]
                ,[DO_Date]
                ,[created_at]
                ,[DO_Status]
                ,[ART_No]
                ,[ART_Qte]
                ,[DO_TotalHT])
            VALUES
                (?,?,?,?,?,?,?,?,?,?)
        """
    cursor_mssql.execute(script, ligne)


def handle_bl_ligne(bl: tuple) -> list:
    ligne = []

    qte, articles, prices = handle_artqteprix(bl[2], bl[4], bl[5])

    if len(articles):
        for index, art in enumerate(articles):
            ligne = []
            ligne.append(bl[0])
            ligne.append(bl[1])
            ligne.append(bl[2])
            ligne.append(bl[3])
            ligne.append(bl[6])
            ligne.append(bl[7])
            ligne.append(bl[8])
            ligne.append(art)
            if index < len(qte) and is_number(qte[index]):
                ligne.append(qte[index])
            else:
                ligne.append(None)

            if index < len(prices) and index < len(qte) and is_number(qte[index]):
                ligne.append(int(prices[index]) * int(qte[index]))
            else:
                ligne.append(None)

            insert_bl_ligne(ligne)


def update_entete(bl):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = f"""
    select do_no, sum(DO_TotalHT) as total from TRANSIT.DBO.F_DOCLIGNE_DIGITAL where do_no in ({bl[0]}) group by do_no
"""
    result = execute_select_one(script)

    if result and result[1]:

        script = f"""
        update TRANSIT.DBO.F_DOCENTETE_DIGITAL
        set DO_TOTALHT = {result[1]}
        where do_no in ({bl[0]})
    """
        cursor_mssql.execute(script)


def handle_bl(bl: int):
    conn_mssql, _ = dbo_mssql()
    bl = get_bl(bl)

    handle_bl_entete(bl)
    handle_bl_ligne(bl)
    conn_mssql.commit()
    update_entete(bl)
    conn_mssql.commit()


def handle_bl_documents(year, month):
    results = get_bls(year, month)
    for bl in results:
        handle_bl(bl)


def main_process_facture_detail(jobId, year, month, journal, database):

    # process_facture_detail(jobId, year, month, journal, database)
    handle_new_articles()
    handle_clients()
    handle_bl_documents(year, month)


main_process_facture_detail('', 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')

# main_process_facture_detail(1, 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')
