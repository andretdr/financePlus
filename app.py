import os, json, re ,sys

from flask import Flask, render_template, jsonify, request, session, redirect
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

import buysell, func, landf, viewf, mysql.connector
import yfinance as yf

# Configure application
app = Flask(__name__)

# Configure Session
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


conn = func.mysql_conn()
# conn = conn_pool.get_connection()
db = conn.cursor(dictionary = True)

@app.route('/', methods=['GET', 'POST'])
@landf.loginRequired
def index():
    """ Main page """

    if request.method == 'GET':

        cash = func.returncash(db)
        cashdict = [{} for _ in range(1)]
        cashdict[0]['cash'] = str(cash)

        data = viewf.dbReturnUserHoldingsDataALL(session['user_id'], db)

        apidata = viewf.returnCPPC(data)

        for i in range(len(data)):
            data[i]['currprice'] = apidata[i]['currprice']
            data[i]['prevclose'] = apidata[i]['prevclose']

        returndata = json.dumps(cashdict + data)

        return render_template("index.html", data = returndata)
    

    if request.method == 'POST':
        clientrequest = request.get_json()
        clienttype = clientrequest['type']

        cashdict = []
        cashdict.append({"cash":0})

        if clienttype == 'full' or clienttype == 'cash':
            cash = func.returncash(db)
            cashdict[0]['cash'] = cash

        data = []

        if clienttype == 'full' or clienttype == 'holdings':
            data = viewf.dbReturnUserHoldingsDataALL(session['user_id'], db)

            # return currprice and prev close for all symbols
            apidata = viewf.returnCPPC(data)

            for i in range(len(data)):
                data[i]['currprice'] = apidata[i]['currprice']
                data[i]['prevclose'] = apidata[i]['prevclose']
    
        returndata = cashdict + data

        return jsonify(returndata)
    

@app.route('/landing')
def landing():
    """ Login and Registration page """
    print(yf.__version__)
    return render_template("landing.html")

@app.route('/login', methods=['POST'])
def login():
    """ Do username n password checks and login """

    clientdata = request.get_json()

    # assigning for readability
    cdusername = clientdata['username']
    cdpassword = clientdata['password']

    # validation checks
    statusarr = []
    statusarr.append(landf.validatename(cdusername))
    statusarr.append(landf.validatepassword(cdpassword))
    statusarr.append(landf.finduserpassword(cdusername, cdpassword, db))


    # if checks fail, return status
    if not landf.isvalid(statusarr):
        return jsonify(statusarr)

    # if all good, sign user in
    landf.signinuser(cdusername, db)

    return jsonify(statusarr)


@app.route('/logout')
def logout():
    """ logout functionality """

    # Forget userid
    session.clear()

    return redirect("/")


@app.route('/register', methods=['POST'])
def register():
    """ Do registration checks and log in if successful """

    clientdata = request.get_json()

    # assigning for readability
    cdusername = clientdata['username']
    cdpassword = clientdata['password']
    cdconfirmation = clientdata['confirmation']
    cdhash = generate_password_hash(cdpassword, method='scrypt', salt_length=16)

    # validation checks
    statusarr = []
    statusarr.append(landf.validatename(cdusername)) # NEED TO CHECK THAT USER DOES NOT EXIST
    statusarr.append(landf.ifexistsname(cdusername, db))
    statusarr.append(landf.validatepassword(cdpassword))
    statusarr.append(landf.validateconfirmation(cdpassword, cdconfirmation))

    # if checks fail, return status
    if not landf.isvalid(statusarr):
        return jsonify(statusarr)

    # if all is good, create account
    db.execute("INSERT INTO fin_users (username, hash) VALUES (%s, %s)", (cdusername.upper(), cdhash,))
    conn.commit()

    # sign in the user
    landf.signinuser(cdusername, db)

    return jsonify(statusarr)


@app.route('/viewstock', methods = ['GET', 'POST'])
@landf.loginRequired
def viewstock():

    if request.method == "GET" :
        symbol = request.args.get('q')
        data_a = viewf.retrievedata(symbol)
        data_b = viewf.dbReturnUserHoldingsData(session['user_id'], symbol, db)

        returndata = json.dumps(data_b + data_a, cls=func.NpEncoder)

        if data_a[0]["status"] == 10:
            return render_template("error.html", data = "Symbol not found")

        return render_template("viewstock.html", data = returndata)
    
    else:
        clientdata = request.get_json()
        typedata = clientdata['type']
        if typedata == 'stock':
            data = viewf.retrievedata(clientdata['symbol'])
        if typedata == 'holdings':
            data = viewf.dbReturnUserHoldingsData(session['user_id'], clientdata['symbol'], db)

        if data[0]["status"] == 10:
            return render_template("error.html", data = "Symbol not found")

        return jsonify(data)


@app.route('/buy', methods = ['POST'])
@landf.loginRequired
def buy():
    clientdata = request.get_json()
    clientsymb = clientdata['symbol']
    clientbuyamt = clientdata['buyamt']

    record = buysell.buyshares(session['user_id'], clientsymb, clientbuyamt, db, conn)

    print(record)
    return jsonify(record)


@app.route('/sell', methods = ['POST'])
@landf.loginRequired
def sell():
    clientdata = request.get_json()
    clientsymb = clientdata['symbol']
    clientsellamt = clientdata['sellamt']
    clientclose = clientdata['close']

    record = buysell.sellshares(session['user_id'], clientsymb, clientsellamt, clientclose, db, conn)

    return jsonify(record)

def create_app():
    return app






    