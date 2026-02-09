from datetime import datetime

from utils.database import database_objects
import re


def JO_Num_check(value):
    if type(value).__name__ != 'str':
        return False

    if len(value) > 7:
        return False
    return True


def EC_No_check(value):
    if type(value).__name__ != 'int':
        return False

    if value > 0:
        return False
    return True


def EC_Jour_check(value):
    if type(value).__name__ != 'int':
        return False

    if value <= 0 or value > 31:
        return False
    return True


def EC_RefPiece_check(value):
    if type(value).__name__ != 'str':
        return False

    if len(value) > 17:
        return False
    return True


def CG_Num_check(value):

    if type(value).__name__ == 'int':
        value = str(value)

    if type(value).__name__ != 'str':
        return False

    if len(value) > 13:
        return False
    return True


def CT_Num_check(value):
    if value == None:
        return True

    if type(value).__name__ != 'str':
        return False

    if len(value) > 17:
        return False

    select_query = 'select count(CT_Num) from dbo.F_COMPTET where CT_Num = ?'

    _, cursor = database_objects()
    results = cursor.execute(select_query, value)
    rows = results.fetchall()

    if not rows[0][0] == 1:
        print("Le compte tiers n'existe pas !!!")
        return False

    return True


def EC_Intitule_check(value):
    if type(value).__name__ != 'str':
        return False

    if len(value) > 69:
        return False
    return True


def EC_Sens_check(value):
    if type(value).__name__ != 'int':
        return False

    if value < 0 or value > 1:
        return False

    return True


def EC_Montant_check(value):
    if type(value).__name__ != 'int' and type(value).__name__ != 'float':
        return False

    return True


def date_check(value):
    try:

        if int(value) == -6847804800000:
            return True
        date = datetime.utcfromtimestamp(int(value) / 1000.0)

        return True
    except ValueError:
        return False


def EC_Piece(value, jm_date):
    if int(value) != int(get_month_from_milliseconds(jm_date)):
        return False

    return True


def get_month_from_milliseconds(milliseconds):
    date = datetime.utcfromtimestamp(milliseconds / 1000)

    # Get the month
    month = date.month

    return month


def is_cg_num_client(cg_num, ct_num):
    pattern = r"411"
    if re.search(pattern, cg_num):
        return ct_num
    return None


def is_date_correct(date_ms):
    if not date_ms:
        return -6847804800000
    return date_ms


def is_debit_equals_credit(list_data):
    actual_bill = ""
    bill_to_check = ""
    wrong_bill = []
    credit = 0
    debit = 0
    bill = []
    total_credit = 0
    total_debit = 0
    for index, data in enumerate(list_data):
        actual_bill = data["EC_RefPiece"]
        if not index:
            bill_to_check = data["EC_RefPiece"]

        if actual_bill == bill_to_check:
            bill.append(data)
        else:

            for line in bill:
                if line["EC_Sens"] == 0:
                    debit = debit + line["EC_Montant"]
                    total_debit = total_debit + line["EC_Montant"]
                if line["EC_Sens"] == 1:
                    credit = credit + line["EC_Montant"]
                    total_credit = total_credit + line["EC_Montant"]
            if debit != credit:
                wrong_bill.append(bill_to_check)
                bill_to_check = data["EC_RefPiece"]
                credit = 0
                debit = 0
                bill.clear()
            else:
                bill_to_check = data["EC_RefPiece"]
                credit = 0
                debit = 0
                bill.clear()
            bill.append(data)

    print(f'debit: {total_debit}', end='\n')
    print(f'credit: {total_credit}', end='\n')

    if total_credit != total_debit:
        print('LE DEBIT EST DIFFERENT DU CREDIT !!!')
    return wrong_bill


def write_to_file(file_path, content):
    with open(file_path, 'r') as file:
        old_content = file.read()
    with open(file_path, 'w') as file:

        file.write(f'{old_content}\n\n{content}')
    print(f"Content successfully written to {file_path}")


def check_data(data: dict):

    data['EC_Piece'] = get_month_from_milliseconds(data['JM_Date'])
    data["CT_Num"] = is_cg_num_client(data["CG_Num"], data["CT_Num"])
    data["EC_Echeance"] = is_date_correct(data["EC_Echeance"])
    data["CG_Num"] = data["CG_Num"]
    log_errors = ""
    if not JO_Num_check(data['JO_Num']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: JO_Num({data["JO_Num"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not EC_No_check(data['EC_No']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_No({data["EC_No"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not date_check(data['JM_Date']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: JM_Date({data["EC_RefPiece"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)

        return {}

    if not EC_Jour_check(data['EC_Jour']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Jour({data["EC_Jour"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)

        return {}

    if not date_check(data['EC_Date']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Date({data["EC_Date"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)

        return {}

    if not EC_Piece(data['EC_Piece'], data['JM_Date']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Piece({data["EC_Piece"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not EC_RefPiece_check(data['EC_RefPiece']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_RefPiece({data["EC_RefPiece"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not CG_Num_check(data['CG_Num']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: CG_Num({data["CG_Num"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not CT_Num_check(data['CT_Num']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: CT_Num({data["CT_Num"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not EC_Intitule_check(data['EC_Intitule']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Intitule({data["EC_Intitule"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not date_check(data['EC_Echeance']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Echeance({data["EC_Echeance"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not EC_Sens_check(data['EC_Sens']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Sens({data["EC_Sens"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    if not EC_Montant_check(data['EC_Montant']):
        log_errors = log_errors + f'Facture: {data["EC_RefPiece"]}\n'
        log_errors = log_errors + \
            f'Problème de valeur: EC_Montant({data["EC_Montant"]}) !!\n\n'

        write_to_file("./logs/error.log.txt", log_errors)
        return {}

    return data
