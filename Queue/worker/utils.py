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
        "/home/igf/baeaubab_module/Queue/worker/configuration/settings.ini")

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


def process_ecritures(data):
    print(data)
    pass


""" process_ecritures({'jobId': '6989cbff001c72f2c576',
                  'year': '2025', 'month': '9', 'check': True}) """
