from functools import wraps
from flask import redirect, render_template, session


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
