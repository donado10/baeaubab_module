import json
from pyodbc import connect

from utils import ini_settings


database_object = []


def read_to_json(file):
    with open(file, "r") as json_file:
        data = json.load(json_file)
        return data


def set_connexion():
    config = ini_settings()
    connect_config = f"Driver={config['MSSQL']['driver']};Server={config['MSSQL']['server']};UID={config['MSSQL']['uid']};PWD={config['MSSQL']['pwd']};Encrypt=no;"
    return connect(connect_config)


def add_database_object(cursor):
    database_object.append(cursor)


def database_objects():

    if len(database_object):
        return database_object[0]

    conn = set_connexion()
    cursor = conn.cursor()
    add_database_object([conn, cursor])
    return [conn, cursor]


def execute_select_one(script):
    conn, cursor = database_objects()
    select_query = script
    results = cursor.execute(select_query)
    return results.fetchone()


def execute_select_all(script):
    conn, cursor = database_objects()
    select_query = script
    results = cursor.execute(select_query)
    return results.fetchall()
