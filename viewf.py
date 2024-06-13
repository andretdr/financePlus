from flask import session
import datetime, time, math
import func, buysell
import pandas as pd
import threading

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
    status.append({'status':0})

    enddate = datetime.datetime.now()

    symb = yf.Ticker(argsymb)

    dailydict = []
    weeklydict = []
    monthlydict = []
    threemlydict = []
    yearlydict = []

    prevdayclose = []
    prevweekclose = []
    prevmonthclose = []
    prevthreemclose = []
    prevyearclose = [] 

    currentprice = []

    def block_a(p_daily, p_weekly, pstatus):
        try:
            dailydf = (symb.history(period="1d", interval="5m")).reset_index()
            # convert column datetime into string time
            dailydf['Range'] = dailydf['Datetime'].dt.strftime("%H:%M")
            p_daily.append(dailydf[list({'Range', 'Close'})].to_dict('records'))

            weeklydf = (symb.history(start=returndatef(returnstartdate(enddate, 7)), end=returndatef(enddate), interval="60m")).reset_index()
            # convert column datetime into string time
            weeklydf['Range'] = weeklydf['Datetime'].dt.strftime("%a")
            p_weekly.append(weeklydf[list({'Range', 'Close'})].to_dict('records'))
        except:
            pstatus[0]['status'] = 10


    def block_b(p_monthly, p_threem, pstatus):
        try:
            monthlydf = (symb.history(start=returndatef(returnstartdate(enddate, 30)), end=returndatef(enddate), interval="1d")).reset_index()
            # convert column datetime into string date
            monthlydf['Range'] = monthlydf['Date'].dt.strftime("%d %b")
            p_monthly.append(monthlydf[list({'Range', 'Close'})].to_dict('records'))

            threemlydf = (symb.history(start=returndatef(returnstartdate(enddate, 90)), end=returndatef(enddate), interval="1d")).reset_index()
            # convert column datetime into string date
            threemlydf['Range'] = threemlydf['Date'].dt.strftime("%d %b")
            p_threem.append(threemlydf[list({'Range', 'Close'})].to_dict('records'))
        except:
            pstatus[0]['status'] = 10


    def block_c(p_yearly, pstatus):
        try:
            yearlydf = (symb.history(start=returndatef(returnstartdate(enddate, 365)), end=returndatef(enddate), interval="1wk")).reset_index()
            # convert column datetime into string date
            yearlydf['Range'] = yearlydf['Date'].dt.strftime("%d %b")
            p_yearly.append(yearlydf[list({'Range', 'Close'})].to_dict('records'))
        except:
            pstatus[0]['status'] = 10


    def block_d(p_day, p_week, p_month, pstatus):
        # get prev info
        try:
            p_day += returnprevinfo(symb, '1d')
            p_week += returnprevinfo(symb, '1w')
            p_month += returnprevinfo(symb, '1m')

#            if math.isnan(p_day[0]['prevdayclose']):
#                raise ValueError

        except ValueError:
            pstatus[0]['status'] = 11
        except:
            pstatus[0]['status'] = 10
    
    
    def block_e(p_threem, p_year, cp, pstatus):
        try:
            p_threem += returnprevinfo(symb, '3m')
            p_year += returnprevinfo(symb, '1y')
            cp += [{'currentPrice': symb.info['currentPrice']}]
        except:
            pstatus[0]['status'] = 10
        
    # multi threading to speed up processing
#        start = time.time()
    blocka_thread = threading.Thread(target=block_a, args=(dailydict, weeklydict, status,))
    blockb_thread = threading.Thread(target=block_b, args=(monthlydict, threemlydict, status,))
    blockc_thread = threading.Thread(target=block_c, args=(yearlydict, status,))
    blockd_thread = threading.Thread(target=block_d, args=(prevdayclose, prevweekclose, prevmonthclose, status,))
    blocke_thread = threading.Thread(target=block_e, args=(prevthreemclose, prevyearclose, currentprice, status,))

    blocka_thread.start()
    blockb_thread.start()
    blockc_thread.start()
    blockd_thread.start()
    blocke_thread.start()

    blocka_thread.join()
    blockb_thread.join()
    blockc_thread.join()
    blockd_thread.join()
    blocke_thread.join()

    if status[0]['status'] != 0:
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
    startdate = argendate - datetime.timedelta(days=delta)
    returndate = datetime.datetime(startdate.year, startdate.month, startdate.day, 9, 30, 0)
    return returndate


def returndatef(argdate):
    """ returns date in YYYY-MM-DD format given datetime """
    return argdate.strftime("%Y-%m-%d")

def returndatef2(argdate):
    """ returns date in MONTH DD format given datetime """
    return argdate.strftime("%d %B")


def returnprevinfo(argsymb, argrange):
    """ returns a list of dict of the prevrange closing and price in the format
        'prevdayclose':pc or 'prevweekopen':pw or 'prevmonthopen':pm or 'prevthreemopen':pt or 'prevyearopen':py
        takes in argrange of '1d', '1w', '1m', '3m', '1y'
    """    
    
    enddate = datetime.datetime.now()
    
    match argrange:
        case '1d':
            startdate = returnstartdate(enddate, 3)
            varname = 'prevdayclose'
        case '1w':
            startdate = returnstartdate(enddate, 8)
            varname = 'prevweekopen'
        case '1m':
            startdate = returnstartdate(enddate, 31)
            varname = 'prevmonthopen'
        case '3m':
            startdate = returnstartdate(enddate, 91)
            varname = 'prevthreemopen'
        case '1y':
            startdate = returnstartdate(enddate, 366)
            varname = 'prevyearopen'

    prevclose = []

    if (argrange == '1d'):
        prevclosedf = argsymb.history(period='3d')
        newdf = prevclosedf.reset_index()

        index1 = newdf.iloc[len(newdf)-2]['Close']
        index2 = newdf.iloc[len(newdf)-1]['Open']

        prevclose.append({'prevdayclose':index1, 'dayopen':index2, 'prevclosedate':returndatef2(newdf.iloc[0]['Date'])})
        
    else: 
        prevclosedf = argsymb.history(start=returndatef(startdate), end=returndatef(enddate))
        newdf = prevclosedf.reset_index()

        prevclose.append({varname:newdf.iloc[1]['Open'], 'prevclosedate':returndatef2(newdf.iloc[1]['Date'])})

    return prevclose


""" return stock quantity, avgcost, cash, symb data from db given userid and db """
def dbReturnUserHoldingsData(argid, argsymb, argdb):

    rows = []

    # get cash from db
    def block_a(pid, pdb):
        pdb.execute("SELECT cash FROM fin_users WHERE fin_users.id = %s", (pid,))
        rows = pdb.fetchall()
        return str(rows[0]['cash'])

    # get rest of info from db
    def block_b(prows, pid, psymb, pdb):
        # execute seperately incase the row doesnt exist, if new transaction
        symbid = buysell.lookupSymbol(psymb, pdb)

        pdb.execute("SELECT quantity, avgcost, cash FROM fin_holdings INNER JOIN fin_users ON fin_holdings.user_id = fin_users.id WHERE user_id = %s AND symb_id = %s", (pid, symbid,))

#        pdb.execute("SELECT quantity, avgcost FROM fin_holdings WHERE user_id = %s AND symb_id = %s", (pid, symbid,))
        prows += argdb.fetchall()
    
    block_b(rows, argid, argsymb, argdb)

    data = []
    # handles null cases
    if len(rows) == 0:
        cash = block_a(argid, argdb)
        data.append({'avgcost':0, 'quantity':0, 'symb':argsymb, 'cash':cash, 'status':9})
    else:
        cash = str(rows[0]['cash'])
        data.append({'avgcost':rows[0]['avgcost'], 'quantity':rows[0]['quantity'], 'symb':argsymb, 'cash':cash, 'status':0})
    
    return data


""" return stock quantity, avgcost, symb data for all holdings from db, given userid and db """
def dbReturnUserHoldingsDataALL(argid, argdb):
    
    # execute seperately incase the row doesnt exist, if new transaction
    executionstr = "SELECT fin_holdings.quantity, fin_holdings.avgcost, fin_symbs.symb FROM (fin_holdings INNER JOIN fin_symbs ON fin_symbs.id = fin_holdings.symb_id) WHERE fin_holdings.user_id = %s ORDER BY fin_symbs.symb ASC"
    argdb.execute(executionstr, (argid,))
    rows = argdb.fetchall()
    
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
    data = yf.download(symbstr, period='3d')

    # initialise list of dict
    returndata = [{} for _ in range(len(argholdingsdata) + 1)]

    for i in range(len(argholdingsdata)):
        symb = argholdingsdata[i]['symb']
        # if only 1 entry, use a different cmd
        if len(argholdingsdata) == 1:
            closeinfo = data['Close']
        else:
            closeinfo = data['Close'][symb]
        returndata[i]['currprice'] = closeinfo.iloc[len(closeinfo) - 1]
        returndata[i]['prevclose'] = closeinfo.iloc[len(closeinfo) - 2]

    # turns out yfinance drops rows once in awhile, causing errors on occasion.
    # for example, 2024-06-11 and 2024-05-27
    # will flag this

    if len(data) == 3:
        returndata[len(returndata)-1]['rowmissing'] = 'false'
    else:
        returndata[len(returndata)-1]['rowmissing'] = 'true'

    return returndata

""" returns currprice of symbol """
def returncurrprice(argsymb):

    symb = yf.Ticker(argsymb)
    currentprice = symb.info['currentPrice']

    return (currentprice)
 
