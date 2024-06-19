from functools import wraps
from flask import redirect, render_template, session

import numpy as np
import mysql.connector, mysql.connector.pooling
import sys, json

from dotenv import load_dotenv
import os

# Configure DB for connection pooling
def mysql_connpool():
    # load from dotenv
    load_dotenv('./.env')

    dbusername: str = os.getenv('DBUSERNAME')
    dbpassword: str = os.getenv('DB__PASSWORD')
    dbhost: str = os.getenv('DBHOST')
    dbdatabase: str = os.getenv('DBDATABASE')

    try:
        conn_pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="mypool",
            user=dbusername,
            password=dbpassword,
            host=dbhost,
            port=3306,
            database=dbdatabase,
#            connect_timeout=10,
            autocommit=True,
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
def returncash(argdb, pid):

#    with argdb:
#        with argdb.cursor() as cursor:
#            cursor.execute("SELECT cash FROM fin_users WHERE id = %s", (session['user_id'],))

    argdb.execute("SELECT cash FROM fin_users WHERE id = %s", (pid,))
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


""" deletes all holdings for user """
def deleteAccountHoldings(param_id, argdb):
    executionStr = "DELETE FROM fin_holdings WHERE user_id = %s"
    argdb.execute(executionStr, (param_id,))
    


""" deletes userid in fin_users """
def deleteAccountUsers(param_id, argdb):
    executionStr = "DELETE FROM fin_users WHERE id = %s"
    argdb.execute(executionStr, (param_id,))


""" enconding for json """
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        dtypes = (np.datetime64, np.complexfloating, np.timestamp)
        if isinstance(obj, dtypes):
            return str(obj)
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            if any([np.issubdtype(obj.dtype, i) for i in dtypes]):
                return obj.astype(str).tolist()
            return obj.tolist()
        return super(NpEncoder, self).default(obj)
    

# connection class
class CC:
    def __init__(this):
        # initialise pool
        this.conn_pool = mysql_connpool()
        this.connection = this.conn_pool.get_connection()

    def getConn(this):
        #returns a new connection, if connection is closed reconnects
        try:
            if not this.connection.is_connected():
                print('not connected, connecting...')
                this.reconnect()
            return this.connection
        except:
            try:
                print('reconnecting...')
                this.reconnect()
                return this.connection
            except:
                print('reinitialising pool...')
                this.conn_pool = mysql_connpool()
                this.reconnect()
                return this.connection


    def reconnect(this):
        #re-get connections
        this.connection = this.conn_pool.get_connection()
