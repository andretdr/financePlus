async function getHoldingsData(argsymbol){
    // retrieve holdings data
    return responseObj = await fetcher('/viewstock', 'POST', {'symbol':argsymbol, 'type':'holdings'});
}

function setHTMLHoldingsData(argholdingsdata){

    // retrieving data
    let quantity = argholdingsdata[0]['quantity']
    let avgcost = argholdingsdata[0]['avgcost']
    let cash = argholdingsdata[0]['cash']

    // setting data to HTML
    setHTMLAvailShares(quantity);
    setHTMLAvgCost(avgcost);
    setHTMLCash(cash);
}

function renderBuySellData(argstates, argcurrprice){

    if (argstates['buy']){
        // update curr price buy page
        refreshbuypagecurrprice(argcurrprice);
//        updateAvailSharesTxnPage(argstates);
//        updateCashTxnPage();

        if (argstates['bydollars'])
            // update est shares buy page
            refreshEstShares(argcurrprice);

        if (argstates['byshares'])
            // update est cost buy page
            refreshEstDollars(argcurrprice);
    }
    
    if (argstates['sell']){
        // update curr price sell page
        refreshsellpagecurrprice(argcurrprice);
//        updateAvailSharesTxnPage(argstates);

        if (argstates['bydollars'])
            // update est shares buy page
            refreshSellEstShares(argcurrprice);

        if (argstates['byshares'])
            // update est cost buy page
            refreshSellEstTotal(argcurrprice);

        if (argstates['close'])
            // update est cost buy page
            refreshSellEstTotalClose();
    }

}


/** main logic, renderpage. last arg can be type='full', 'api', 'hdata'. */
async function renderpage(argsymbol, argstates, type='full'){

    if ((type == 'full') || (type == 'api')){
        // retrieve stock info from API
        const stockrecords = await getAPIData(symbol);

        // if error on retrieving data
        if (stockrecords[0]['status'] == 10){
            renderviewpageError(stockrecords[0]);
            return 1;
        }
    
        // setting api data to HTML
        setHTMLCurrPrice(getCurrentPrice(stockrecords));

        // add EL to graph buttons
        addELGraphButtons(stockrecords);

        // refresh graph, stock info
        refreshGraphInfo(stockrecords, document.getElementById("viewdata").value);
    }

    if ((type == 'full') || (type == 'hdata')){
        // retrieve holdings data
        const hdata = await getHoldingsData(argsymbol);

        updatePageHoldingsData(hdata, argstates)
    }
}


// sets the data to HTML and refreshes page
function updatePageHoldingsData(hdata, argstates){

    // setting holdings data to HTML
    setHTMLHoldingsData(hdata);

    // disable sell button if no holdings
    disableSellButton(hdata);

    // these 2 values dont need refreshing
    updateAvailSharesTxnPage(argstates);
    updateCashTxnPage(argstates);

    // this function is used for refreshing data
    renderBuySellData(argstates, getCurrentPricePage())

    renderHoldings();
}


/** takes in dictionary with 'symbol':symbol, 'status':status and prints error */
function renderviewpageError(argstatus){

    let errorindex = argstatus['status'];

    // storing error message
    html = validationstatus[errorindex];
    
    // special message if index == 10
    if (errorindex == 10)
        html = `SYMBOL ${argstatus['symbol']} not found`;

    //rendering message
    document.getElementById("viewstockbody").innerHTML = html;

}


/** takes in dictionary with 'symbol':symbol, 'status':status and prints error */
async function getAPIData(argsymbol){

    let response = await fetch('/viewstock', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({'symbol':argsymbol, 'type':'stock'})
    });

    let responset = await response.text();
    let responseObj = JSON.parse(responset);

    console.log(responseObj);

    return responseObj;
}


/** reads from server our current cash, adds to html page */
async function getSetHTMLCash(){

    let response = await fetch('/', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({'return':'cash'})
    });

    let responset = await response.text();
    let responseObj = JSON.parse(responset);

    setHTMLCash(responseObj['cash']);

    return responseObj['cash'];
}


/** reads from html our current cash, adds to html page */
function getCashPage(){
    return parseFloat(document.getElementById("viewcash").value);
}


/** reads from html our current cash, adds to html page */
function getAvailSharesPage(){
    return parseFloat(document.getElementById("viewquantity").value);
}


/** returns dict 'currentprice':cp, 'dailyreturns':dr, 'dailypercentage':dp, 'prevclose':pc */
function returnstockdata(argstockrecords){
    data = [];
    graphinfo = document.getElementById("viewdata").value

    switch (graphinfo){
        case '1d':
            dataprevclose = parseFloat(argstockrecords[1]['prevdayclose']);
            dataprevdate = argstockrecords[1]['prevclosedate'];
            break;
        case '1w':
            dataprevclose = parseFloat(argstockrecords[2]['prevweekclose']);
            dataprevdate = argstockrecords[2]['prevclosedate'];
            break;
        case '1m':
            dataprevclose = parseFloat(argstockrecords[3]['prevmonthclose']);
            dataprevdate = argstockrecords[3]['prevclosedate'];
            break;
        case '3m':
            dataprevclose = parseFloat(argstockrecords[4]['prevthreemclose']);
            dataprevdate = argstockrecords[4]['prevclosedate'];
            break;
        case '1y':
            dataprevclose = parseFloat(argstockrecords[5]['prevyearclose']);
            dataprevdate = argstockrecords[5]['prevclosedate'];
            break;
    }

    datacurrentprice = getCurrentPrice(argstockrecords); 

    datadailyreturn = (datacurrentprice-dataprevclose).toFixed(2);

    datadailypercent = (datadailyreturn/dataprevclose*100).toFixed(2);

    // reformat in 2 dec places
    datacurrentprice = datacurrentprice.toFixed(2);
    dataprevclose = dataprevclose.toFixed(2);

    data.push({'currentprice':datacurrentprice, 'dailyreturn':datadailyreturn, 'dailypercent':datadailypercent, 'prevclose':dataprevclose, 'prevdate':dataprevdate});

    return data;
    
}


/** render the stock data */
function renderviewinfo(argstockdata){

    const currentprice = argstockdata[0]['currentprice'];
    const dailyreturn = argstockdata[0]['dailyreturn'];
    const dailypercent = argstockdata[0]['dailypercent'];

    html = `
            <div>
                <data id="viewcurrentprice">${currentprice}</data></br>
            `;
    if (parseFloat(dailyreturn) < 0)
        html += `   <data id="viewdailyreturn" style='color:red;'>${dailyreturn}&#11206 </data>
                    <data id="viewdailypercent" style='color:red;'>(${dailypercent})&#37 &#11206</data>
                    </div>
                `;
    else
        html += `   <data id="viewdailyreturn" style='color:green;'>${dailyreturn}&#11205</data>
                    <data id="viewdailypercent" style='color:green;'>(${dailypercent})&#37 &#11205</data>
                    </div>
                `;

    document.getElementById("viewinfo").innerHTML = html;

}


/** render the stock graph 
 *  period arg takes in 1d, 1w, 1m, 3m, 1y. Defaults to 1d if not explicitly called
*/
function renderGraph(argstockrecords, argperiod="1d"){

    document.getElementById('viewcanvas').innerHTML = `<canvas id='viewgraph' style="width:100%; max-width:700px"></canvas>`;

    let xValues = [];
    let yValues = [];

    // setting up end and start var for the following loop
    let end = '';
    let start = '';
    switch (argperiod) {
        case '1d': // drawing a graph of 1 day
            end = 'WEEK';
            start = 'DAY';
            break;
        case '1w': // drawing a graph of 1 week
            end = 'MONTH';
            start = 'WEEK';
            break;
        case '1m': // drawing a graph of 1 month
            end = 'THREEM';
            start = 'MONTH';
            break;
        case '3m': // drawing a graph of 3 month
            end = 'YEAR';
            start = 'THREEM';
            break;
        case '1y': // drawing a graph of 1 year
            end = 'EOF';
            start = 'YEAR';
            break;
    }

    // finding the data points for the graph
    let found = false;
    for (let i=0; i<argstockrecords.length; i++){

        if (argstockrecords[i]['bm'] == end)
            break;

        if (found){
        yValues.push(argstockrecords[i]['Close']);
        xValues.push(i);
        }

        if (argstockrecords[i]['bm'] == start)
            found = true;
    }

    // determining color of graph
    ylength = yValues.length;
    let graphcolor = '';

    if (yValues[0] <= yValues[ylength-1])
        graphcolor = 'green';
    else
        graphcolor = 'red';

    // drawing the chart
    chart = new Chart("viewgraph", {
        type: "line",
        data:{
            labels: xValues,
            datasets: [{
                backgroundColor: "white",
                borderColor: graphcolor,
                data: yValues
            }]
        },
        pointRadius: "0",
        animation:{duration:0},
        options: {
            legend: {display: false},
            animation:{duration:0}
            
        }
    });

    setHTMLGraphState(argperiod);

    // recal current prcce, range returns, percentage return, last close
    const stockdata = returnstockdata(argstockrecords);

    // render info
    renderviewinfo(stockdata);
    
}


/** draw graph buttons */
function addELGraphButtons(argstockrecords){

    // add listeners
    addListenerGraphButtons("viewgraphday", "1d", argstockrecords);
    addListenerGraphButtons("viewgraphweek", "1w", argstockrecords);
    addListenerGraphButtons("viewgraphmonth", "1m", argstockrecords);
    addListenerGraphButtons("viewgraphthreem", "3m", argstockrecords);
    addListenerGraphButtons("viewgraphyear", "1y", argstockrecords);
}


/** addEventListener graph buttons 
    accepts argrange of '1d','1w','1m','3m','1y' */
function addListenerGraphButtons(argbuttonid, argrange, argstockrecords){
    let button = document.getElementById(argbuttonid);
    button.addEventListener('click', ()=> {
        // if button is not alerady pressed
        if (document.getElementById("viewdata").value != argrange){
            // redraw graph
            renderGraph(argstockrecords, argrange);    

            // recal current prcce, range returns, percentage return, last close
            const stockdata = returnstockdata(argstockrecords);

            // render info
            renderviewinfo(stockdata);

        }
    });
}


/** OBSOLETE?? */
/** return current price given stockrecords */
function getCurrentPrice(argstockrecords){
    return parseFloat(argstockrecords[6]['currentPrice']);
}

/** return current price given stockrecords */
function getAvailShares(argstockrecords){
    return parseFloat(argstockrecords[0]['quantity']);
}

/** return avgcost given stockrecords */
function getAvgCost(argstockrecords){
    return parseFloat(argstockrecords[0]['avgcost']);
}

/** OBSOLETE?? */

/** return current price from HTML */
function getCurrentPricePage(){
    const value = document.getElementById("viewcurrprice").value;
    return parseFloat(value);
}

/** return availshares from HTML */
function getAvailSharesPage(){
    const value = document.getElementById("viewquantity").value;
    return parseFloat(value);
}

/** return availshares from HTML */
function getAvgCostPage(){
    const value = document.getElementById("viewavgcost").value;
    return parseFloat(value);
}

/** return symbol from HTML */
function getSymbolPage(){
    const value = document.getElementById("viewsymbol").value;
    return value;
}

/** render symbol on view stock page */
function rendersymbol(argsymbol){
    
    document.getElementById("viewlogo").innerHTML = `${argsymbol}`;
}

/** render graph and stock info  */
function refreshGraphInfo(argstockrecords, argrange){

    // draw graph
    renderGraph(argstockrecords, argrange);

    // retrieve current prcce, range returns, percentage return, last close
    const stockdata = returnstockdata(argstockrecords);

    // render info
}

/** render user holdings of current symb */
async function renderHoldings(argcurrentprice, argsymb){
}

/** updating buy page data currprice */
function setHTMLCurrPrice(argcurrprice){
    document.getElementById("viewcurrprice").value = argcurrprice;
}

/** updating graph state for page */
function setHTMLGraphState(argperiod){
    document.getElementById("viewdata").value = argperiod;
}

/** updating cash for html */
function setHTMLCash(argcash){
    document.getElementById("viewcash").value = argcash;

}

/** updating avail shares for html */
function setHTMLAvailShares(argshares){
    document.getElementById("viewquantity").value = argshares;

}

/** updating avgcost for html */
function setHTMLAvgCost(argavgcost){
    document.getElementById("viewavgcost").value = argavgcost;

}


function renderHoldings(){
    const currprice = (parseFloat(getCurrentPricePage())).toFixed(2);
    const quantity = (parseFloat(getAvailSharesPage())).toFixed(2);
    const avgcost = (parseFloat(getAvgCostPage())).toFixed(2);
    const value = (currprice*quantity).toFixed(2);
    const totalcost = (avgcost*quantity).toFixed(2);
    const pnl = value - totalcost;

    html = `
            <p>Holdings </p>

            <p>Quantity : ${quantity} share(s)</p>
            <p>Avg Cost : $ ${avgcost}</p>
            <p>Market Value : $ ${value}</p>
    
            <p>P & L : $ ${pnl}</p>
            `;
            
    document.getElementById("viewholdings").innerHTML=html;
}