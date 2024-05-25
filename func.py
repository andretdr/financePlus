from functools import wraps
from flask import redirect, render_template, session

import mysql.connector, mysql.connector.pooling
import sys


""" initialise db connection """
def mysql_conn():
    # Configure DB
    try:
        conn = mysql.connector.connect(
            user="p7bd0h8ge1mlykim",
            password="z2jsf0lcs1vwrt70",
            host="ol5tz0yvwp930510.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
            port=3306,
            database="rl3utnqw5gapzw4n",
        )
    except mysql.connector.Error as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

    return conn

# Configure DB for connection pooling
def mysql_connpool():
    try:
        conn_pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="mypool",
            user="p7bd0h8ge1mlykim",
            password="z2jsf0lcs1vwrt70",
            host="ol5tz0yvwp930510.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
            port=3306,
            database="rl3utnqw5gapzw4n",
        )
    except mysql.connector.Error as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

    return conn_pool


""" return username """
def returnUserName(argid, argdb):
    argdb.execute("SELECT * FROM fin_users WHERE id = %s", (argid,))
    rows = argdb.fetchall()

    return rows[0]['username']


""" returns cash of current user """
def returncash(argdb):

#    with argdb:
#        with argdb.cursor() as cursor:
#            cursor.execute("SELECT cash FROM fin_users WHERE id = %s", (session['user_id'],))

    argdb.execute("SELECT cash FROM fin_users WHERE id = %s", (session['user_id'],))
    row = argdb.fetchall()
#    row = cursor.fetchall()

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
