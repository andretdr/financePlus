from functools import wraps
from flask import redirect, render_template, session
import re
from werkzeug.security import check_password_hash, generate_password_hash

def loginRequired(f):
    """ Decorate routes to check for login, If not login, redirect to '/landing' """
    @wraps(f)
    def innerFunction(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect('/landing')
        return f(*args, **kwargs)
    return innerFunction

def validatename(argname):
    """ validate name to be alpha numeric ONLY, given the string argname """
    if not (re.match('^[0-9a-zA-Z]+$', argname)):
        return returnstatus(1, 'name')
    return returnstatus(0, 'name')

def ifexistsname(argname, argdb):
    """ checks if username exists in db """
    argdb.execute("SELECT * FROM fin_users WHERE username = %s", (argname.upper(),))
    rows = argdb.fetchall()

    if len(rows) != 0:
        return returnstatus(4, 'name')
    return returnstatus(0, 'name')

def finduserpassword(argname, argpassword, argdb):
    """ checks if user does indeed exist with the correct password """
    argdb.execute("SELECT * FROM fin_users WHERE username = %s", (argname.upper(),))
    records = argdb.fetchall()

    #if cannot find a match on user
    if len(records) == 0:
        return returnstatus(5, 'password')

    # if the passwords dont match
    if not check_password_hash(records[0]['hash'], argpassword):
        return returnstatus(5, 'password')
    
    # if all ok
    return returnstatus(0, 'password') 

def validatepassword(argpassword):
    """ validate password to have atleast 8 characters, given the string argpassword """
    if len(argpassword) < 8:
        return returnstatus(2, 'password')
    return returnstatus(0, 'password')

def validateconfirmation(argpassword, argconfirmation):
    """ validate password and confirmation to be the same, given the string password n argconfirmation"""
    if argpassword != argconfirmation:
        return returnstatus(3, 'confirmation')
    return returnstatus(0, 'confirmation')

def returnstatus(argn, arginput):
    """ return status from CONST validationstatus, given the status number argn and what input, name or pw etc """
    return {'status':argn, 'input':arginput}

def isvalid(argstatusarr):
    """ returns True if no status error, False if yes"""
    noerror = True
    for thisstatus in argstatusarr:
        if thisstatus['status'] != 0:
            noerror = False
            return noerror
    return noerror

def signinuser(argusername, argdb):
    """ Selects the userid from the DB and records in session """

    str = "SELECT * FROM fin_users WHERE username = %s"
    argdb.execute(str, (argusername.upper(),))
    rows = argdb.fetchall()

    session['user_id'] = rows[0]['id']


