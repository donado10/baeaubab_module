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
    SELECT MAX(DO_No) FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL where do_type in (6,7)
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
            ,[DO_Transport]
            ,[DO_Generale]
            ,[DO_FactureReference]
            ,[DO_Entreprise_Digital])
     VALUES
           (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
            ,[DO_Entreprise_Sage]
            ,[DO_Entreprise_Digital]
            ,[DO_FactureReference])
     VALUES
           (?,?,?,?,?,?,?,?,?,?,?,?)
"""
    for ligne in lignes:
        cursor_mssql.execute(script, ligne)


def set_bl_valide(entetes: list, facture_id):
    conn_mssql, cursor_mssql = dbo_mssql()
    for entete in entetes:
        script = f"""
        UPDATE [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL]
        SET do_valide = 1,do_facturereference = {facture_id}
        WHERE do_no = {entete[0]} and do_type = 3
        """
        cursor_mssql.execute(script)

        script = f"""
        UPDATE [TRANSIT].[dbo].[F_DOCLIGNE_DIGITAL]
        SET do_facturereference = {facture_id}
        WHERE do_no = {entete[0]} and do_type = 3
        """
        cursor_mssql.execute(script)


def get_entete_facture(do_no, year, month):
    query = f"""
    select  * from TRANSIT.dbo.F_DOCENTETE_DIGITAL where do_no={do_no} and year(do_date) = {year} and month(do_date) = {month} and do_type=6
"""
    result = execute_select_one(query)
    return result


def get_lignes_facture(do_no, year, month):
    query = f"""
    select  * from TRANSIT.dbo.F_DOCLIGNE_DIGITAL where do_no={do_no} and year(do_date) = {year} and month(do_date) = {month} and do_type=6
"""
    results = execute_select_all(query)
    return results


def get_bls(do_no, year, month):
    query = f"""
    select  * from TRANSIT.dbo.F_DOCLIGNE_DIGITAL where do_facturereference={do_no} and year(created_at) = {year} and month(created_at) = {month} and do_type=3
"""
    results = execute_select_all(query)
    return results


def get_client_info(ct_num):
    query = f"""
    select  en.*,ct.*  from TRANSIT.dbo.F_COMPTET_DIGITAL ct inner join TRANSIT.dbo.F_ENTREPRISE_DIGITAL en
        on ct.CT_Entreprise_Sage = en.EN_No_Sage
      where CT_Num='{ct_num}'
"""
    result = execute_select_one(query)
    return result


def get_article_cg_num(art_no, is_tva_applicable=False):
    if is_tva_applicable:
        query = f"""
        select  CG_Num_non_exo from TRANSIT.dbo.F_ARTICLE_DIGITAL where ART_No='{art_no}' 
    """
        result = execute_select_one(query)
        return result[0] if result else None

    query = f"""
        select  CG_Num_Exo from TRANSIT.dbo.F_ARTICLE_DIGITAL where ART_No='{art_no}' 
    """
    result = execute_select_one(query)
    return result[0] if result else None


"""
here's the table structure for the ecritures that we want to insert into the database:
CREATE TABLE [dbo].[F_ECRITUREC_TEMP](
	[Marq] [int] IDENTITY(1,1) NOT NULL,
	[JO_Num] [varchar](7) NOT NULL,
	[EC_No] [int] NOT NULL,
	[JM_Date] [varchar](200) NOT NULL,
	[EC_Jour] [smallint] NULL,
	[EC_Date] [datetime] NULL,
	[EC_Echeance] [datetime] NULL,
	[EC_Piece] [varchar](13) NULL,
	[EC_RefPiece] [varchar](17) NULL,
	[CG_Num] [varchar](13) NOT NULL,
	[CT_Num] [varchar](17) NULL,
	[EC_Intitule] [varchar](69) NULL,
	[EC_Sens] [smallint] NULL,
	[EC_Montant] [numeric](24, 6) NULL,
	[CreatedDate] [datetime] NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[F_ECRITUREC_TEMP] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO

"""


def insert_ecriture(ecriture: dict):
    conn_mssql, cursor_mssql = dbo_mssql()
    script = """
        set dateformat ymd;
        INSERT INTO [TRANSIT].[dbo].[F_ECRITUREC_TEMP]
           ([JO_Num]
            ,[EC_No]
            ,[JM_Date]
            ,[EC_Jour]
            ,[EC_Date]
            ,[EC_Echeance]
            ,[EC_Piece]
            ,[EC_RefPiece]
            ,[CG_Num]
            ,[CT_Num]
            ,[EC_Intitule]
            ,[EC_Sens]
            ,[EC_Montant]
            ,[EC_Valide])
     VALUES
           (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
"""
    cursor_mssql.execute(script, (
        ecriture["JO_Num"],
        ecriture["EC_No"],
        ecriture["JM_Date"],
        ecriture["EC_Jour"],
        ecriture["EC_Date"],
        None,  # Echeance is not provided in the current context,
        ecriture["EC_Piece"],
        ecriture["EC_RefPiece"],
        ecriture["CG_Num"],
        ecriture["CT_Num"],
        ecriture["EC_Intitule"],
        ecriture["EC_Sens"],
        ecriture["EC_Montant"],
        ecriture["EC_Valide"],
    ))


def update_facture_status(do_no):
    # This function will update the status of the facture to "comptabilised" in the database
    conn_mssql, cursor_mssql = dbo_mssql()
    script_entete = f"""
        UPDATE [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL]
        SET DO_Valide = 1,do_type=7
        WHERE do_no = {do_no} and do_type = 6
        """

    script_ligne = f"""
        UPDATE [TRANSIT].[dbo].[F_DOCLIGNE_DIGITAL]
        SET do_type=7
        WHERE do_no = {do_no} and do_type = 6
        """
    cursor_mssql.execute(script_entete)
    cursor_mssql.execute(script_ligne)


def insert_ecritures(do_no, ecritures):
    # This function would contain the logic to insert the ecritures into the database
    # For demonstration, we will just print the ecritures
    conn_mssql, cursor_mssql = dbo_mssql()

    ttc, tva, ht, transport = ecritures["ttc"], ecritures["tva"], ecritures["ht"], ecritures["transport"]
    print("Inserting TTC Ecriture:", ttc)

    insert_ecriture(ttc)

    if tva:
        print("Inserting TVA Ecriture:", tva)
        tva["CT_Num"] = None  # Ensure CT_Num is None for TVA ecriture
        insert_ecriture(tva)

    if transport:
        print("Inserting Transport Ecriture:", transport)
        # Ensure CT_Num is None for Transport ecriture
        transport["CT_Num"] = None
        insert_ecriture(transport)

    for ligne in ht["lignes"]:
        ligne = {
            "JO_Num": ht["JO_Num"],
            "EC_No": ht["EC_No"],
            "JM_Date": ht["JM_Date"],
            "EC_Jour": ht["EC_Jour"],
            "EC_Date": ht["EC_Date"],
            "EC_Echeance": None,
            "EC_Piece": ht["EC_Piece"],
            "EC_RefPiece": ht["EC_RefPiece"],
            "CG_Num": ligne["CG_Num"],
            "CT_Num": None,
            "EC_Intitule": ligne["EC_Intitule"],
            "EC_Sens": ligne["EC_Sens"],
            "EC_Montant": ligne["EC_Montant"],
            "EC_Valide": ht["EC_Valide"],
        }
        print("Inserting HT Ecriture:", ligne)
        insert_ecriture(ligne)

    update_facture_status(do_no)

    conn_mssql.commit()


def fact_comptabilise(do_no):
    query = f"""
    select  count(*) from TRANSIT.dbo.F_ECRITUREC_TEMP where EC_RefPiece='FACT-{do_no}'
"""
    result = execute_select_one(query)
    return result[0] > 0 if result else False


def is_tva_applicable(ct_num):
    query = f"""
    select  EN_TVA from TRANSIT.dbo.F_COMPTET_DIGITAL ct inner join TRANSIT.dbo.f_entreprise_digital en
    on ct.CT_Entreprise_Sage = en.EN_No_Sage 
    where CT_Num='{ct_num}' 
"""
    result = execute_select_one(query)
    return False if result[0] == 2 else True


def get_facture_ids(year, month, onlyGenerale=True):
    query = f"""
    select  DO_No from TRANSIT.dbo.F_DOCENTETE_DIGITAL where year(do_date) = {year} and month(do_date) = {month} and do_type=6 and DO_Valide != 2
"""
    if onlyGenerale:
        query += " and DO_Generale = 1"
    results = execute_select_all(query)
    return [x[0] for x in results]


def get_facturation_type(company_id):
    query = f"""
        select FA_CODE from [TRANSIT].[dbo].[F_FACTCOMPTET_DIGITAL] fct 
        inner join [TRANSIT].[dbo].F_FACTURATION_DIGITAL ft on fct.FA_No = ft.FA_No
        where fct.EN_NO_Sage = '{company_id}'"""
    result = execute_select_all(query)
    return [x[0] for x in result] if result else None


def get_agences_by_year_month_company_id(year, month, company_id):
    query = f"""
        with lev1 as (select  distinct client_id from TRANSIT.dbo.F_DOCENTETE_DIGITAL where do_type=3 and DO_entreprise_Sage='{company_id}' and year(created_at)={year} and month(created_at)={month})
        select * from TRANSIT.dbo.F_COMPTET_DIGITAL where CT_No in (select client_id from lev1)
    """
    result = execute_select_all(query)
    return result if result else None


def get_document_by_agence_year_month(agence, year, month):
    query = f"""
        select  * from TRANSIT.dbo.F_DOCENTETE_DIGITAL where year(created_at) = {year} and month(created_at) = {month} and do_type=3 and DO_Status != 2 and client_id='{agence[0]}' and DO_TotalHT is not null and do_valide != 1
    """
    results = execute_select_all(query)
    return results if results else None
