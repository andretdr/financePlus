import func, viewf

""" handles the buying shares """
def buyshares(argid, argsymb, argcashamt, argdb, conn):

    totalcash = func.returncash(argdb)

    #assume status is erroneous
    status = {'status':1}

    #validation
    if not enoughBuyingPower(totalcash, argcashamt):
        return status

    #make purchase
    status = buysharesDB(argid, argsymb, argcashamt, argdb, conn)

    return status


""" handles the selling shares """
def sellshares(argid, argsymb, argsharesamt, argclose, argdb, conn):

    totalquantity = func.returnquantity(argsymb, argdb)

    #assume status is erroneous
    status = {'status':2}

    #validation if its not a close
    if (not enoughSellingPower(totalquantity, argsharesamt)) and (not argclose):
        return status

    #make sale
    status = sellsharesDB(argid, argsymb, argsharesamt, argclose, argdb, conn)

    print(f"sellshares {status}")

    return status


""" validate if user has enough money to buy """
def enoughBuyingPower(argtotalcash, argcashamt):
    if float(argtotalcash) > float(argcashamt):
        return True
    else:
        return False
    

""" validate if user has enough money to buy """
def enoughSellingPower(argtotalquantity, argsharesamt):
    if float(argtotalquantity) > float(argsharesamt):
        return True
    else:
        return False


""" updates DB to buy shares """
def buysharesDB(argid, argsymb, argcashamt, argdb, conn):

    quantity = 0
    avgcost = 0
    cash = func.returncash(argdb)

    # retrieving USER holdings data
    rows = viewf.dbReturnUserHoldingsData(argid, argsymb, argdb)

    quantity = rows[0]['quantity']
    avgcost = rows[0]['avgcost']

    # calculating avg cost
    currprice = viewf.returncurrprice(argsymb)
    sharesamt = round(float(argcashamt)/float(currprice), 2)
    totalcost = float(quantity) * float(avgcost)
    newtotal = float(totalcost) + float(argcashamt)
    newquant = float(quantity) + float(sharesamt)
    
    newavgcost = round(newtotal/newquant, 2)
    newcash = float(cash) - float(argcashamt)

    # get back symbid, if symb is new, add it into db
    symbid = lookupSymbol(argsymb, argdb)
    if symbid == -1:
        symbid = addSymbol(argsymb, argdb, conn)

    # if holdings entry not found
    if rows[0]['status'] == 9:
        executionstr = "INSERT INTO fin_holdings (user_id, symb_id, avgcost, quantity) VALUES (%s, %s, %s, %s)"
        argdb.execute(executionstr, (argid, symbid, newavgcost, newquant))
    # if not, just update
    else:    
        executionstr = "UPDATE fin_holdings SET quantity = %s, avgcost = %s WHERE user_id = %s AND symb_id = %s"
        argdb.execute(executionstr, (newquant, newavgcost, argid, symbid,))

    executionstr = "UPDATE fin_users SET fin_users.cash = %s WHERE fin_users.id = %s"
    argdb.execute(executionstr, (newcash, argid,))
    conn.commit()

    data = []
    data.append({'quantity':newquant, 'avgcost':newavgcost, 'symbol':argsymb, 'cash':newcash, 'status':0})

    return data



""" updates DB to sell shares """
def sellsharesDB(argid, argsymb, argsharesamt, argclose, argdb, conn):

    # retrieving USER holdings data
    rows = viewf.dbReturnUserHoldingsData(argid, argsymb, argdb)
    quantity = rows[0]['quantity']
    avgcost = rows[0]['avgcost']

    # calculate new cash, new quanity in holdings
    cash = func.returncash(argdb)
    currprice = viewf.returncurrprice(argsymb)
    delta = 0

    if argclose:
        delta = float(quantity) * float(currprice)
        avgcost = 0
        newquant = 0
    else:
        delta = float(argsharesamt) * float(currprice)
        newquant = float(quantity) - float(argsharesamt)

    newcash = float(cash) + delta

    # get back symbid
    symbid = lookupSymbol(argsymb, argdb)

    # if holdings entry not found
    if argclose: #remove entry
        executionstr = "DELETE FROM fin_holdings WHERE user_id = %s AND symb_id = %s"
        argdb.execute(executionstr, (argid, symbid))
    # if not, just update
    else:
        executionstr = "UPDATE fin_holdings SET quantity = %s WHERE user_id = %s AND symb_id = %s"
        argdb.execute(executionstr, (newquant, argid, symbid,))

    executionstr = "UPDATE fin_users SET fin_users.cash = %s WHERE fin_users.id = %s"
    argdb.execute(executionstr, (newcash, argid,))
    conn.commit()

    data = []
    data.append({'quantity':newquant, 'avgcost':avgcost, 'symbol':argsymb, 'cash':newcash, 'status':0})

    print(data)

    return data



""" lookup symbol, returns -1 if not found, 'id' if found """
def lookupSymbol(argsymb, argdb):

    executionstr = "SELECT * FROM fin_symbs WHERE symb = %s"
    argdb.execute(executionstr, (argsymb,))
    rows = argdb.fetchall()
    if len(rows) == 0:
        return -1
    return rows[0]['id']

""" add symbol """
def addSymbol(argsymb, argdb, conn):

    executionstr = "INSERT INTO fin_symbs (symb) VALUES (%s)"
    argdb.execute(executionstr, (argsymb,))
    conn.commit()

    return lookupSymbol(argsymb, argdb)

    

