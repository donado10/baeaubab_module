from abc import ABC, abstractmethod

from shared.mssql_baeaubab.database import database_objects as dbo_mssql
from db import (
    get_agence_dg_by_company_id,
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


class BaseFactureBuilder(ABC):

    def __init__(self, year: int, month: int):
        self.year = year
        self.month = month

    @abstractmethod
    def get_agence(self):
        """Return the headquarter/agence_dg tuple for this facture type, or None."""
        raise NotImplementedError

    def get_latest_facture_id(self) -> int:
        return get_latest_facture_id()

    def get_transport(self, agent) -> float:
        return get_transport_value(agent[5])

    @abstractmethod
    def build(self, entetes: list) -> tuple:
        """
        Build the facture for the given entetes.
        Returns (True, latest_fact_id) on success, (False, None) if no agence found.
        Each subclass defines its own build process.
        """
        raise NotImplementedError


class FactureGeneraleBuilder(BaseFactureBuilder):
    """FC1 — Facture générale grouped by entreprise (DO_Entreprise_Sage)."""

    def __init__(self, company_id: str, year: int, month: int):
        super().__init__(year, month)
        self.company_id = company_id

    def get_agence(self):
        return get_agence_dg_by_company_id(self.company_id)

    def build(self, entetes: list) -> tuple:
        agence = self.get_agence()
        if not agence:
            return False, None

        latest_fact_id = self.get_latest_facture_id()
        DO_Transport = self.get_transport(agence)
        is_tva = agence[3] == 1

        DO_TotalHT, DO_TotalTVA, DO_TotalTTC = calculate_totals(
            entetes, is_tva, DO_Transport
        )

        current_date = get_current_date()
        last_day = get_last_day_of_month(self.year, self.month)

        facture_entete = [
            int(latest_fact_id) + 1,  # DO_No
            6,                         # DO_Type
            agence[0],                 # Client_ID
            agence[2],                 # CT_Num
            DO_TotalTTC,               # DO_TotalTTC
            DO_TotalHT,                # DO_TotalHT
            DO_TotalTVA,               # DO_TotalTVA
            last_day,                  # DO_Date
            0,                         # DO_Status
            current_date,              # created_at
            agence[5],                 # DO_Entreprise_Sage
            DO_Transport,              # DO_Transport
        ]
        handle_fact_entete(facture_entete)

        facture_lignes = []
        for entete in entetes:
            facture_ligne = [
                int(latest_fact_id) + 1,  # DO_No
                6,                         # DO_Type
                agence[0],                 # Client_ID
                agence[2],                 # CT_Num
                entete[0],                 # ART_Design
                entete[5],                 # DO_TotalHT
                last_day,                  # DO_Date
                0,                         # DO_Status
                current_date,              # created_at
                agence[5],                 # DO_Entreprise_Sage
            ]
            facture_lignes.append(facture_ligne)

        handle_fact_lignes(facture_lignes)
        set_bl_valide(entetes, latest_fact_id)

        conn_mssql, _ = dbo_mssql()
        conn_mssql.commit()

        return True, latest_fact_id


class FactureAgenceDocumentBuilder(BaseFactureBuilder):
    """FC2 — Facture par agence et document (DO_No)."""
    pass


class FactureBuilderFactory:
    _builders = {
        "FC1": FactureGeneraleBuilder,
        "FC2": FactureAgenceDocumentBuilder,  # Example of another facture type
    }

    @classmethod
    def create(cls, case_type: str, identifier, year: int, month: int) -> BaseFactureBuilder:
        builder_cls = cls._builders.get(case_type)
        if builder_cls is None:
            raise ValueError(f"Unknown facture case type: {case_type}")
        return builder_cls(identifier, year, month)
