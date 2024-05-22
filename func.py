from functools import wraps
from flask import redirect, render_template, session

import mysql.connector

""" initialise db connection """
def mysql_conn():
    # Configure DB
    try:
        conn = mysql.connector.connect(
            user="d3xj7d753lhx14ad",
            password="qyjau9ud4manbl1w",
            host="z12itfj4c1vgopf8.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
            port=3306,
            database="nodabg0vdbkgxoop"
        )
    except mysql.connector.Error as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

    return conn


""" return username """
def returnUserName(argid, argdb):
    argdb.execute("SELECT * FROM fin_users WHERE id = %s", (argid,))
    rows = argdb.fetchall()

    return rows[0]['username']


""" returns cash of current user """
def returncash(argdb):

    argdb.execute("SELECT cash FROM fin_users WHERE id = %s", (session['user_id'],))
    row = argdb.fetchall()

    return row[0]['cash']


""" returns quantity of holdings of symbol by current user """
def returnquantity(argsymb, argdb):

    executionstr = "SELECT fin_holdings.quantity FROM (fin_holdings INNER JOIN fin_symbs ON fin_holdings.symb_id = fin_symbs.id) WHERE fin_symbs.symb = %s AND fin_holdings.user_id = %s"
    argdb.execute(executionstr, (argsymb, (session['user_id']),))
    row = argdb.fetchall()
    if len(row) == 0:
        return 0    
    else:
        return row[0]['quantity']
