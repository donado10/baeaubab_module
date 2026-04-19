from abc import ABC, abstractmethod
from main import (
    generate_ecritures_from_all_factures,
    generate_ecritures_from_facture,
    generate_ecritures_from_selected_factures,
    generate_factures,
    generate_factures_by_entreprise,
    generate_factures_for_entreprise,
    generate_factures_from_bl,
)


class BaseFactureHandler(ABC):
    @abstractmethod
    def handle(self, data: dict):
        raise NotImplementedError


class AllFacturesHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_factures(data["jobId"], data["year"], data["month"])


class ByEntrepriseHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_factures_by_entreprise(
            data["jobId"], data["en_list"], data["year"], data["month"]
        )


class FromBonLivraisonHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_factures_from_bl(
            data["jobId"], data["year"], data["month"], data["en_no"], data["bl_list"]
        )


class ForEntrepriseHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_factures_for_entreprise(
            data["jobId"], data["en_no"], data["year"], data["month"]
        )


class EcrituresFromFactureHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_ecritures_from_facture(
            data["jobId"], data["year"], data["month"], data["do_no"]
        )


class EcrituresFromAllFacturesHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_ecritures_from_all_factures(
            data["jobId"], data["year"], data["month"]
        )


class EcrituresFromSelectedFacturesHandler(BaseFactureHandler):
    def handle(self, data: dict):
        generate_ecritures_from_selected_factures(
            data["jobId"], data["year"], data["month"], data["do_nos"]
        )


class FactureHandlerFactory:
    _handlers = {
        "all": AllFacturesHandler,
        "byEntreprise": ByEntrepriseHandler,
        "fromBonLivraison": FromBonLivraisonHandler,
        "forEntreprise": ForEntrepriseHandler,
        "ecrituresFromFacture": EcrituresFromFactureHandler,
        "ecrituresFromAllFactures": EcrituresFromAllFacturesHandler,
        "ecrituresFromSelectedFactures": EcrituresFromSelectedFacturesHandler,
    }

    @classmethod
    def create(cls, job_type: str) -> BaseFactureHandler:
        handler_cls = cls._handlers.get(job_type)
        if handler_cls is None:
            raise ValueError(f"Unknown job type: {job_type}")
        return handler_cls()

    @classmethod
    def build_handler_map(cls) -> dict:
        return {
            job_type: lambda data, h=handler_cls(): h.handle(data)
            for job_type, handler_cls in cls._handlers.items()
        }
