from flask import session
import datetime, time
import func, buysell
import pandas as pd

import yfinance as yf
""" https://aroussi.com/post/python-yahoo-finance """

def retrievedata(argsymb):
    
    """ connects with API to retrieve stock data 
        returns a list of dict with bookmarks,  [0] = {'status':status}
                                                [1] = {'currentPrice':currentprice}
                                                [2] = {'Close':yesterday close}
                                                [3] = {'bm':'DAY'}
                                                [i] = {'Open':open, 'Close':close, 'High':high ....}
                                                ......
                                                [n] = {'bm':'WEEK'}
                                                ......
                                                [o] = {'bm':'MONTH'}
                                                ......
                                                [p] = {'bm':'THREEM'}
                                                ......
                                                [q] = {'bm':'YEAR'}
                                                ......
    
    """

    status = []
    status.append({'status':10})
   
    try:
        enddate = datetime.datetime.now()

        symb = yf.Ticker(argsymb)

        dailydict = []
        weeklydict = []
        monthlydict = []
        threemlydict = []
        yearlydict = []

        dailydf = (symb.history(period="1d", interval="5m"))[list({'Close'})]
        dailydict.append(dailydf.to_dict('records'))
        weeklydf = (symb.history(start=returndatef(returnstartdate(enddate, 7)), end=returndatef(enddate), interval="60m"))[list({'Close'})]
        weeklydict.append(weeklydf.to_dict('records'))
        monthlydf = (symb.history(start=returndatef(returnstartdate(enddate, 30)), end=returndatef(enddate), interval="1d"))[list({'Close'})]
        monthlydict.append(monthlydf.to_dict('records'))
        threemlydf = (symb.history(start=returndatef(returnstartdate(enddate, 90)), end=returndatef(enddate), interval="1d"))[list({'Close'})]
        threemlydict.append(threemlydf.to_dict('records'))
        yearlydf = (symb.history(start=returndatef(returnstartdate(enddate, 365)), end=returndatef(enddate), interval="1wk"))[list({'Close'})]
        yearlydict.append(yearlydf.to_dict('records'))

        # get closing info
        prevdayclose = returnprevclose(symb, '1d')
        prevweekclose = returnprevclose(symb, '1w')
        prevmonthclose = returnprevclose(symb, '1m')
        prevthreemclose = returnprevclose(symb, '3m')
        prevyearclose = returnprevclose(symb, '1y')

        # get current price
        currentprice = [{'currentPrice': symb.info['currentPrice']}]

    except: # if error reading symb
        return status

    # setting up bookmarks for easy navigation
    status[0]['status'] = 0
    daybm = []
    daybm.append({'bm':'DAY'})
    weekbm = []
    weekbm.append({'bm':'WEEK'})
    monthbm = []
    monthbm.append({'bm':'MONTH'})
    threembm = []
    threembm.append({'bm':'THREEM'})
    yearbm = []
    yearbm.append({'bm':'YEAR'})

    finaldata = status + currentprice + prevdayclose + prevweekclose + prevmonthclose + prevthreemclose + prevyearclose + daybm + dailydict + weekbm + weeklydict + monthbm + monthlydict + threembm + threemlydict + yearbm + yearlydict
    
    return finaldata


def returnstartdate(argendate, delta):
    """ returns startdate given enddate datetime and delta """
    return argendate - datetime.timedelta(days=delta)


def returndatef(argdate):
    """ returns date in YYYY-MM-DD format given datetime """
    return argdate.strftime("%Y-%m-%d")

def returndatef2(argdate):
    """ returns date in MONTH DD format given datetime """
    return argdate.strftime("%B %d")


def returnprevclose(argsymb, argrange):
    """ returns a list of dict of the prevrange closing and price in the format
        'prevdayclose':pc or 'prevweekclose':pw or 'prevmonthclose':pm or 'prevthreemclose':pt or 'prevyearclose':py
        takes in argrange of '1d', '1w', '1m', '3m', '1y'
    """    
    
    enddate = datetime.datetime.now()
    
    match argrange:
        case '1d':
            startdate = returnstartdate(enddate, 2)
            varname = 'prevdayclose'
            range = '2d'
        case '1w':
            startdate = returnstartdate(enddate, 8)
            varname = 'prevweekclose'
            range = '8d'
        case '1m':
            startdate = returnstartdate(enddate, 31)
            varname = 'prevmonthclose'
            range = '31d'
        case '3m':
            startdate = returnstartdate(enddate, 91)
            varname = 'prevthreemclose'
            range = '91d'
        case '1y':
            startdate = returnstartdate(enddate, 366)
            varname = 'prevyearclose'
            range = '366d'

#    print(f"endate : {returndatef(enddate)} startdate: {returndatef(startdate)}")

    if (argrange == '1d'):
        prevclosedf = argsymb.history(period=range)
        
    else: 
        prevclosedf = argsymb.history(start=returndatef(startdate), end=returndatef(enddate))
    
    prevclose = []

    prevclose.append({varname:prevclosedf.iloc[0]['Close'], 'prevclosedate':returndatef2(returnstartdate(startdate, -1))})

    return prevclose


""" return stock quantity, avgcost, cash, symb data from db given userid and db """
def dbReturnUserHoldingsData(argid, argsymb, argdb):
    
    argdb.execute("SELECT cash FROM fin_users WHERE fin_users.id = %s", (argid,))
    rows = argdb.fetchall()
    cash = str(rows[0]['cash'])


    symbid = buysell.lookupSymbol(argsymb, argdb)
    data = []

    # execute seperately incase the row doesnt exist, if new transaction
    argdb.execute("SELECT quantity, avgcost FROM fin_holdings WHERE user_id = %s AND symb_id = %s", (argid, symbid,))
    rows = argdb.fetchall()
    
    # handles null cases
    if len(rows) == 0:
        data.append({'avgcost':0, 'quantity':0, 'symb':argsymb, 'cash':cash, 'status':9})
    else:
        data.append({'avgcost':rows[0]['avgcost'], 'quantity':rows[0]['quantity'], 'symb':argsymb, 'cash':cash, 'status':0})
    
    return data


""" return stock quantity, avgcost, symb data for all holdings from db, given userid and db """
def dbReturnUserHoldingsDataALL(argid, argdb):
    
    # execute seperately incase the row doesnt exist, if new transaction
#    print("1")
    executionstr = "SELECT fin_holdings.quantity, fin_holdings.avgcost, fin_symbs.symb FROM (fin_holdings INNER JOIN fin_symbs ON fin_symbs.id = fin_holdings.symb_id) WHERE fin_holdings.user_id = %s ORDER BY fin_symbs.symb ASC"
    argdb.execute(executionstr, (argid,))
    rows = argdb.fetchall()
#    print("2")
#    print("3")
    
    return rows


""" return currprice and prev close given holdings data from dbReturnUserHoldingsDataALL"""
def returnCPPC(argholdingsdata):

    if len(argholdingsdata) == 0:
        return argholdingsdata

    # create a string of symb names
    symbstr = ''
    for item in argholdingsdata:
        symbstr += item['symb'] + ' '

    # initialise API
    data = yf.download(symbstr, period='2d')

    # initialise list of dict
    returndata = [{} for _ in range(len(argholdingsdata))]

    for i in range(len(argholdingsdata)):
        symb = argholdingsdata[i]['symb']
        # if only 1 entry, use a different cmd
        if len(argholdingsdata) == 1:
            closeinfo = data['Close']
        else:
            closeinfo = data['Close'][symb]
        returndata[i]['currprice'] = closeinfo.iloc[1]
        returndata[i]['prevclose'] = closeinfo.iloc[0]

    return returndata

""" returns currprice of symbol """
def returncurrprice(argsymb):

    symb = yf.Ticker(argsymb)
    currentprice = symb.info['currentPrice']

    return (currentprice)
 
