import mysql.connector

from utils import ini_settings


config = ini_settings()

database_object = []


def add_database_object(cursor):
    database_object.append(cursor)


def set_connexion():
    config = ini_settings()
    print(config['MYSQL'])
    conn = mysql.connector.connect(
        host=config['MYSQL']['server'],
        user=config['MYSQL']['uid'],
        password=config['MYSQL']['pwd'],
        database=config['MYSQL']['database'],
        port=config['MYSQL']['port']
    )

    cursor = conn.cursor()
    return conn, cursor


def database_objects():

    if len(database_object):
        print(database_object[0])
        return database_object[0]

    conn, cursor = set_connexion()
    add_database_object([conn, cursor])
    return [conn, cursor]
