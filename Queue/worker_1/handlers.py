from abc import ABC, abstractmethod
from main import main_process_bl_detail, main_process_bl_one


class BaseBLHandler(ABC):
    @abstractmethod
    def handle(self, data: dict):
        raise NotImplementedError


class AllBLHandler(BaseBLHandler):
    def handle(self, data: dict):
        main_process_bl_detail(data["jobId"], data["year"], data["month"])


class SomeBLHandler(BaseBLHandler):
    def handle(self, data: dict):
        main_process_bl_one(data["jobId"], data["year"],
                            data["month"], data["en_list"])


class BLHandlerFactory:
    _handlers = {
        "all": AllBLHandler,
        "bl_some": SomeBLHandler,
    }

    @classmethod
    def create(cls, job_type: str) -> BaseBLHandler:
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
