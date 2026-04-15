from shared.mssql_baeaubab.database import database_objects as dbo_mssql, execute_select_all, execute_select_one


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
    query = """
    SELECT MAX(DO_No) FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL where do_type=6
"""
    result = execute_select_all(query)
    return result[0][0] if result and result[0][0] else 127311


def get_transport_value(en_sage):
    query = f"""
    SELECT trans_montant FROM transit.dbo.f_transport_digital WHERE trans_en_sage = '{en_sage}' order by trans_no desc
    """
    results = execute_select_one(query)
    return results[0] if results else 0


def handle_fact_entete(entete: list):
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
            ,[DO_Entreprise_Sage]
            ,[DO_Transport])
     VALUES
           (?,?,?,?,?,?,?,?,?,?,?,?)
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
