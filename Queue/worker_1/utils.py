from configparser import ConfigParser
from datetime import datetime
import os
import re
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


def increase_souche_number(souche_number):
    number = int(souche_number)
    number += 1
    return str(number).zfill(6)


def split_souche(souche):
    match = re.match(r"([a-zA-Z]+)(\d+)", souche)
    if match:
        letters = match.group(1)
        numbers = match.group(2)
        return letters, numbers
    else:
        return None, None


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


""" process_ecritures({'jobId': '6989cbff001c72f2c576',
                  'year': '2025', 'month': '9', 'check': True}) """
