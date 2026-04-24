from abc import ABC, abstractmethod

from shared.mssql_baeaubab.database import database_objects as dbo_mssql
from db import (
    get_agence_dg_by_company_id,
    get_agences_by_year_month_company_id,
    get_document_by_agence_year_month,
    get_facture_entete_detail_by_company_id,
    get_facture_entete_detail_by_company_id_and_bl,
    get_latest_facture_id,
    get_transport_value,
    handle_fact_entete,
    handle_fact_lignes,
    set_bl_valide,
)
from utils import (
    calculate_totals,
    get_current_date,
    get_last_day_of_month,
)


def generate_facture(agence, entetes: list, year: int, month: int, facture_id, isGeneral=False) -> tuple:
    do_transport = get_transport_value(agence[5])
    is_tva = agence[3] == 1

    do_total_ht, do_total_tva, do_total_ttc = calculate_totals(
        entetes, is_tva, do_transport
    )

    current_date = get_current_date()
    last_day = get_last_day_of_month(year, month)

    facture_entete = [
        facture_id,   # DO_No
        6,            # DO_Type
        agence[0],    # Client_ID
        agence[2],    # CT_Num
        do_total_ttc,  # DO_TotalTTC
        do_total_ht,  # DO_TotalHT
        do_total_tva,  # DO_TotalTVA
        last_day,     # DO_Date
        0,            # DO_Status
        current_date,  # created_at
        agence[5],    # DO_Entreprise_Sage
        do_transport,  # DO_Transport
        1 if isGeneral else 0,  # DO_FactureGenerale
    ]
    handle_fact_entete(facture_entete)

    facture_lignes = []
    for entete in entetes:
        facture_lignes.append([
            facture_id,   # DO_No
            6,            # DO_Type
            agence[0],    # Client_ID
            agence[2],    # CT_Num
            entete[0],    # ART_Design
            entete[5],    # DO_TotalHT
            last_day,     # DO_Date
            0,            # DO_Status
            current_date,  # created_at
            agence[5],    # DO_Entreprise_Sage
        ])

    handle_fact_lignes(facture_lignes)

    return True, facture_id


class BaseFactureBuilder(ABC):

    def __init__(self, year: int, month: int):
        self.year = year
        self.month = month

    @abstractmethod
    def get_agence(self):
        """Return the headquarter/agence_dg tuple for this facture type, or None."""
        raise NotImplementedError

    @abstractmethod
    def get_entetes(self) -> list:
        """Return the entetes used to generate the facture."""
        raise NotImplementedError

    def before_build(self) -> None:
        """Hook for class-specific work before generating the facture."""
        return None

    def get_latest_facture_id(self) -> int:
        return get_latest_facture_id()

    def get_transport(self, agent) -> float:
        return get_transport_value(agent[5])

    def execute(self) -> tuple:
        success, facture_id = self.build(self.get_latest_facture_id())
        set_bl_valide(self.get_entetes(), facture_id)
        conn_mssql, _ = dbo_mssql()
        conn_mssql.commit()
        return success, facture_id

    def build(self, facture_id, isGeneral=False) -> tuple:
        """
        Build the facture for the builder context.
        Returns (True, facture_id) on success, (False, None) if no entetes or agence are found.
        """
        entetes = self.get_entetes()
        if not entetes:
            return False, None

        agence = self.get_agence()
        if not agence:
            return False, None

        success, facture_id = generate_facture(
            agence, entetes, self.year, self.month, facture_id, isGeneral)

        return success, facture_id


class FactureGeneraleBuilder(BaseFactureBuilder):
    """FC1 — Facture générale grouped by entreprise (DO_Entreprise_Sage)."""

    def __init__(self, company_id: str, year: int, month: int):
        super().__init__(year, month)
        self.company_id = company_id

    def get_agence(self):
        return get_agence_dg_by_company_id(self.company_id)

    def get_entetes(self) -> list:
        return get_facture_entete_detail_by_company_id(
            self.company_id, self.year, self.month)

    def before_build(self) -> None:
        agences = get_agences_by_year_month_company_id(
            self.year, self.month, self.company_id)
        lastest_facture = get_latest_facture_id()
        if not agences:
            return
        for agence in agences:
            entetes = get_document_by_agence_year_month(
                agence, self.year, self.month)
            if not entetes:
                continue
            success, facture_id = generate_facture(
                agence, entetes, self.year, self.month, lastest_facture + 1)
            lastest_facture = facture_id if success else lastest_facture
        return lastest_facture

    def execute(self) -> tuple:
        lastest_facture = self.before_build()
        success, facture_id = self.build(lastest_facture + 1, True)
        set_bl_valide(self.get_entetes(), facture_id)
        conn_mssql, _ = dbo_mssql()
        conn_mssql.commit()
        return success, facture_id


class FactureAgenceDocumentBuilder(BaseFactureBuilder):
    """FC2 — Facture par agence et document (DO_No)."""

    def __init__(self, company_id: str, year: int, month: int):
        super().__init__(year, month)
        self.company_id = company_id

    def get_agence(self):
        return get_agence_dg_by_company_id(self.company_id)

    def get_entetes(self) -> list:
        return get_facture_entete_detail_by_company_id(
            self.company_id, self.year, self.month
        )

    def build(self, facture_id) -> tuple:
        # Similar to FactureGeneraleBuilder but grouped by DO_No instead of entreprise
        # Implementation would be similar but with different grouping logic
        # Placeholder for actual implementation
        return True, self.get_latest_facture_id()


class FactureBySelectedBL(BaseFactureBuilder):
    """FC3 — Facture à partir de BL sélectionnés."""

    def __init__(self, company_id: str, bl_list: list, year: int, month: int):
        super().__init__(year, month)
        self.company_id = company_id
        self.bl_list = bl_list

    def get_agence(self):
        # This case might not be grouped by agence, so we can return None or implement logic to determine agence from BLs
        return get_agence_dg_by_company_id(self.company_id)

    def get_entetes(self) -> list:
        return get_facture_entete_detail_by_company_id_and_bl(
            self.company_id, self.bl_list, self.year, self.month
        )


class FactureBuilderFactory:
    _builders = {
        "FC1": lambda company_id, year, month: FactureGeneraleBuilder(company_id, year, month),
        "FC2": lambda company_id, year, month: FactureAgenceDocumentBuilder(company_id, year, month),
        "FC3": lambda company_id, bl_list, year, month: FactureBySelectedBL(company_id, bl_list, year, month),
    }

    @classmethod
    def create(cls, case_type: str, *args) -> BaseFactureBuilder:
        builder_factory = cls._builders.get(case_type)
        if builder_factory is None:
            raise ValueError(f"Unknown facture case type: {case_type}")
        return builder_factory(*args)
