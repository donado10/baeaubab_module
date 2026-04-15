from configparser import ConfigParser
from datetime import datetime, timedelta
import os
import sys


def configure(app_config_location):
    if getattr(sys, 'frozen', False):
        return os.path.join(os.path.dirname(sys.argv[0]), app_config_location)

    else:
        return app_config_location


def ini_settings():
    app_config = configure(
        "./configuration/settings.ini")

    config = ConfigParser()
    config.read(app_config)
    return config


def write_to_file(file_path, content):
    with open(file_path, 'r') as file:
        old_content = file.read()
    with open(file_path, 'w') as file:
        file.write(f'{old_content}{content}\n')


def get_log_timestamp():
    return f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}]"


def get_current_date():
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def get_last_day_of_month(year, month):
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    last_day = next_month - timedelta(days=1)
    return last_day.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def calculate_totals(entetes: list, is_tva_applicable: bool, transport: int) -> tuple:
    DO_TotalHT = sum(int(entete[5]) for entete in entetes) + transport
    DO_TotalTVA = DO_TotalHT * 0.18 if is_tva_applicable else 0
    DO_TotalTTC = DO_TotalHT + DO_TotalTVA
    return DO_TotalHT, DO_TotalTVA, DO_TotalTTC


""" process_ecritures({'jobId': '6989cbff001c72f2c576',
                  'year': '2025', 'month': '9', 'check': True}) """
