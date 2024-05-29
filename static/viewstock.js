

/** OOBSOLETE>>??????????????????????????????????? */
/** takes in dictionary with 'symbol':symbol, 'status':status and prints error */


/** OBSOLETE */
/** render graph and stock info  */
function refreshGraphInfo(argstockrecords, argrange){

    // draw graph
    renderGraph(argstockrecords, argrange);

    // retrieve current prcce, range returns, percentage return, last close
    const stockdata = returnstockdata(argstockrecords);

    // render info
}


/** Handles the controller logic and stores states */
class viewController{
    // methods
    constructor(){
        // initialise
        this.states = {'buy':false, 'sell':false, 'bydollars':false, 'byshares':false, 'byclose':false};
        this.status = 10;

        let rawdata = this.getRawDataFromHTML();
        if (rawdata[1]['status'] == 0)
            this.status = 0;

        this.symb = rawdata[0]['symb'];
        this.refreshVars(rawdata);
        this.refreshStockData(rawdata);
        this.viewdata = '1d';    
    }

    /** updates and mantains all the dynamic holdings data on the view and buy/sell page */
    refreshVars(argrawdata){
        if (this.status != 0)
            return;
        this.avgcost = argrawdata[0]['avgcost'];
        this.quantity = argrawdata[0]['quantity'];
        this.symb = argrawdata[0]['symb'];
        this.cash = this.getCashFromRawData(argrawdata);
    }

    /** updates and mantains all the dynamic graph data on the view and buy/sell page */
    refreshStockData(argrawdata){

        if (this.status != 0)
            return;
        this.daygraph = [];
        this.weekgraph = [];
        this.monthgraph = [];
        this.threemgraph = [];
        this.yeargraph = [];

        // finding the index for when the graph data starts
        let j=0;
        for (j=0; j<argrawdata.length; j++){
            if (argrawdata[j]['prevdayclose'] != undefined)
                break;
        }

        this.currprice = argrawdata[j-1]['currentPrice'];

        this.daygraph.push({'prevclose':argrawdata[j]['prevdayclose'], 'prevdate':argrawdata[j]['prevclosedate']});
        this.weekgraph.push({'prevclose':argrawdata[j+1]['prevweekclose'], 'prevdate':argrawdata[j+1]['prevclosedate']});
        this.monthgraph.push({'prevclose':argrawdata[j+2]['prevmonthclose'], 'prevdate':argrawdata[j+2]['prevclosedate']});
        this.threemgraph.push({'prevclose':argrawdata[j+3]['prevthreemclose'], 'prevdate':argrawdata[j+3]['prevclosedate']});
        this.yeargraph.push({'prevclose':argrawdata[j+4]['prevyearclose'], 'prevdate':argrawdata[j+4]['prevclosedate']});

        for (let i = 0; i<argrawdata.length; i++){
                if (argrawdata[i]['bm'] == 'DAY'){
                    this.daygraph = this.daygraph.concat(argrawdata[i+1]);
                }
                if (argrawdata[i]['bm'] == 'WEEK'){
                    this.weekgraph = this.weekgraph.concat(argrawdata[i+1]);
                }
                if (argrawdata[i]['bm'] == 'MONTH'){
                    this.monthgraph = this.monthgraph.concat(argrawdata[i+1]);
                }
                if (argrawdata[i]['bm'] == 'THREEM'){
                    this.threemgraph = this.threemgraph.concat(argrawdata[i+1]);
                }
                if (argrawdata[i]['bm'] == 'YEAR'){
                    this.yeargraph = this.yeargraph.concat(argrawdata[i+1]);
                }
        }

        this.dailyreturn = this.currprice-argrawdata[j]['prevdayclose'];
        this.dailypercent = this.dailyreturn/argrawdata[j]['prevdayclose']*100;

        this.weeklyreturn = this.currprice-argrawdata[j+1]['prevweekclose'];
        this.weeklypercent = this.weeklyreturn/argrawdata[j+1]['prevweekclose']*100;

        this.monthlyreturn = this.currprice-argrawdata[j+2]['prevmonthclose'];
        this.monthlypercent = this.monthlyreturn/argrawdata[j+2]['prevmonthclose']*100;

        this.threemreturn = this.currprice-argrawdata[j+3]['prevthreemclose'];
        this.threempercent = this.threemreturn/argrawdata[j+3]['prevthreemclose']*100;

        this.yearlyreturn = this.currprice-argrawdata[j+4]['prevyearclose'];
        this.yearlypercent = this.yearlyreturn/argrawdata[j+4]['prevyearclose']*100;
    }

    async refreshAPIDataServer(){
        const data = await this.getAPIData();
        this.refreshStockData(data);
        console.log(this.returnCurrprice());
    }

    async getHoldingsData(){
        // retrieve holdings data
        const responseObj = await fetcher('/viewstock', 'POST', {'symbol':this.symb, 'type':'holdings'});
        return responseObj;
    }

    async getAPIData(){
        // retrieve API data
        const responseObj = await fetcher('/viewstock', 'POST', {'symbol':this.symb, 'type':'stock'});
        return responseObj;
    }
    

    /** gets the raw data from HTML and returns an obj */
    getRawDataFromHTML(){
        let data = document.getElementById("datadump").value;
        console.log(data);
        let dataobj = JSON.parse(data);
        return dataobj;
    }

    /** gets cash */
    getCashFromRawData(argrawdata){
        return argrawdata[0]['cash'];
    }

    /** NO OINE IS USING THIS */
    /** reads from server our current cash, adds to html page */
    async getSetHTMLCash(){

        let response = await fetch('/', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({'return':'cash'})
        });

        let responset = await response.text();
        let responseObj = JSON.parse(responset);

        this.cash = (responseObj['cash']);
    }


    /** sets the buy page state */
    setState(buy, sell, dollars, shares, close){

        this.states['buy'] = buy;
        this.states['sell'] = sell;
        this.states['bydollars'] = dollars;
        this.states['byshares'] = shares;
        this.states['byclose'] = close;
    }

    /** accepts 1d, 1w, 1m, 3m, 1y*/
    setViewdata(argrange){
        this.viewdata=argrange;
    }

    setQuantity(argquantity){
        this.quantity = argquantity;
    }

    setAvgCost(argavgcost){
        this.avgcost = argavgcost;
    }

    setCash(argcash){
        this.cash = argcash;
    }


    /** returns values */

    /** returns the right graph data following viewdata */
    returnSmartGraphdata(){
        const switcher = {
        '1d':this.daygraph,
        '1w':this.weekgraph,
        '1m':this.monthgraph,
        '3m':this.threemgraph,
        '1y':this.yeargraph
        }

        return switcher[this.viewdata];
    }

    /** returns the right daily/monthly etc data following viewdata */
    returnSmartly(){
        const switcher = {
        '1d':this.dailyreturn,
        '1w':this.weeklyreturn,
        '1m':this.monthlyreturn,
        '3m':this.threemreturn,
        '1y':this.yearlyreturn
        }

        return switcher[this.viewdata];
    }

    /** returns the right daily/monthly etc data following viewdata */
    returnSmartlyP(){
        const switcher = {
        '1d':this.dailypercent,
        '1w':this.weeklypercent,
        '1m':this.monthlypercent,
        '3m':this.threempercent,
        '1y':this.yearlypercent
        }

        return switcher[this.viewdata];
    }



    returnStates(){return this.states;}
    returnStatus(){return this.status;}
    returnAvgcost(){return this.avgcost;}
    returnQuantity(){return this.quantity;}
    returnSymb(){return this.symb;}
    returnCash(){return this.cash;}
    returnCurrprice(){return this.currprice;}
    returnDaygraph(){return this.daygraph;}
    returnWeekgraph(){return this.weekgraph;}
    returnMonthgraph(){return this.monthgraph;}
    returnThreemgraph(){return this.threemgraph;}
    returnYeargraph(){return this.yeargraph;}
    returnViewdata(){return this.viewdata;}

    returnDaily(){return this.dailyreturn;}
    returnDailyp(){return this.dailypercent;}

    returnWeekly(){return this.weeklyreturn;}
    returnWeeklyp(){return this.weeklypercent;}

    returnMonthly(){return this.monthlyreturn;}
    returnMonthlyp(){return this.monthlypercent;}

    returnThreem(){return this.threemreturn;}
    returnThreemp(){return this.threempercent;}

    returnYearly(){return this.yearlyreturn;}
    returnYearlyp(){return this.yearlypercent;}
}


class viewView{
    // methods
    constructor(argController, argBuySellView){
        // initialise
        this.controllerRef = argController;
        this.buysellviewRef = argBuySellView;
    }

    /** main logic, renderpage. arg can be type='full', 'api', 'hdata'. */
    renderpage(){
        let argsymbol = this.controllerRef.returnSymb();
        let argstatus = this.controllerRef.returnStatus();

        // if error on retrieving data
        if (argstatus != 0){
            this.renderviewpageError({'symbol':argsymbol, 'status':argstatus});
            return argstatus;
        }

        // render Symbol
        this.renderSymbol();

        this.renderGraph(this.controllerRef.returnViewdata);

        this.renderviewinfo();

        this.updatePageHoldingsData();

    }

    /** renders symbol on page */
    renderSymbol(){
        document.getElementById("viewlogo").innerHTML = `${this.controllerRef.returnSymb()}`;
    }

    /** takes in dictionary with 'symbol':symbol, 'status':status and prints error */
    renderviewpageError(argstatus){

        let errorindex = argstatus['status'];

        // storing error message
        let html = validationstatus[errorindex];
        
        // special message if index == 10
        if (errorindex == 10)
            html = `SYMBOL ${argstatus['symbol']} not found`;

        //rendering message
        document.getElementById("viewstockbody").innerHTML = html;
    }

    /** accepts argrange of '1d','1w','1m','3m','1y' */
    graphButton(argrange) {
        // if button is not already pressed
        if (this.controllerRef.returnViewdata() != argrange){

            // set new view data
            this.controllerRef.setViewdata(argrange);

            // redraw graph
            this.renderGraph();

        //INVESTIGATE
            // render info
            this.renderviewinfo();
        }
    }

    /** render the stock graph given data from this.controllerRef **/
    renderGraph(){

        let argdata = this.controllerRef.returnSmartGraphdata();

        document.getElementById('viewcanvas').innerHTML = `<canvas id='viewgraph' style="width:100%; max-width:700px"></canvas>`;

        let xValues = [];
        let yValues = [];

        for (let i=1; i<argdata.length; i++){
            yValues.push(argdata[i]['Close']);
            xValues.push(i);
        }

        // determining color of graph
        let ylength = yValues.length;
        let graphcolor = '';

        if (yValues[0] <= yValues[ylength-1])
            graphcolor = 'green';
        else
            graphcolor = 'red';

        // drawing the chart
        let chart = new Chart("viewgraph", {
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
    }

    /** render the stock data */
    renderviewinfo(){

    const currentprice = this.controllerRef.returnCurrprice();
    const dailyreturn = (this.controllerRef.returnSmartly()).toFixed(2);
    const dailypercent = (this.controllerRef.returnSmartlyP()).toFixed(2);

    let html = `
            <div>
                <data id="viewcurrentprice">${currentprice}</data></br>
            `;
    if (parseFloat(dailyreturn) < 0)
        html += `   <data id="viewdailyreturn" style='color:red;'>${dailyreturn}&darr; </data>
                    <data id="viewdailypercent" style='color:red;'>(${dailypercent})&#37 &darr;</data>
                    </div>
                `;
    else
        html += `   <data id="viewdailyreturn" style='color:green;'>${dailyreturn}&uarr;</data>
                    <data id="viewdailypercent" style='color:green;'>(${dailypercent})&#37 &uarr;</data>
                    </div>
                `;

    document.getElementById("viewinfo").innerHTML = html;
    }

    /** get API data from server through controllerRef, then update page */
    async refreshAPIDataServerV(){
        await this.controllerRef.refreshAPIDataServer();
        this.updatePageHoldingsData();
    }

    /** accepts holdings data in the form of 
    ** [{'quantity':a, 'avgcost':b, 'symbol':c, 'cash':d, 'status':e}] */
    updatePageHoldingsData(argdata = null){

        if (argdata !== null){
        // controller update data
            this.controllerRef.setQuantity(argdata[0]['quantity']);
            this.controllerRef.setAvgCost(argdata[0]['avgcost']);
            this.controllerRef.setCash(argdata[0]['cash']);
        }   

        // disable sell button if no holdings
        this.disableSellButton();

        // these 2 values dont need dynamic refreshing in the buy/sell menu
        this.buysellviewRef.updateAvailSharesTxnPage();
        this.buysellviewRef.updateCashTxnPage();

        // calling buysellviewRef function is used for refreshing data in the buy/sell menu
        this.buysellviewRef.renderBuySellData();

        this.renderHoldings();
    }

    renderHoldings(){
        const currprice = (this.controllerRef.returnCurrprice()).toFixed(2);
        const quantity = (this.controllerRef.returnQuantity()).toFixed(2);
        const avgcost = (this.controllerRef.returnAvgcost()).toFixed(2);
        const value = (currprice*quantity).toFixed(2);
        const totalcost = (avgcost*quantity).toFixed(2);
        const pnl = value - totalcost;

        let html = `
                <p>Holdings </p>

                <p>Quantity : ${quantity} share(s)</p>
                <p>Avg Cost : $ ${avgcost}</p>
                <p>Market Value : $ ${value}</p>
        
                <p>P & L : $ ${pnl}</p>
                `;
                
        document.getElementById("viewholdings").innerHTML=html;
    }

    /** test for quantity owed, if 0, disable sell button */
    disableSellButton(){
        let sellbutton = document.getElementById("viewsellbutton");

        if (this.controllerRef.returnQuantity() == 0){
            sellbutton.disabled = true;
        }
        else
            sellbutton.disabled = false;
    }

    /** handles the buy request */
    async buy(){
        const argstates = this.controllerRef.returnStates();
        const cash = this.controllerRef.returnCash();
        const symbol = this.controllerRef.returnSymb();
        const currprice = parseFloat(this.controllerRef.returnCurrprice());
        let input = 0;

        // getting user input
        if (argstates['bydollars'])
            input = document.getElementById("viewbuydollars").value;
        if (argstates['byshares']){
            let inputshares = document.getElementById("viewbuyshares").value;

            input = (inputshares * currprice).toFixed(2);
        }

        // Client side check
        if (input > cash){
            this.buysellviewRef.renderTxnMessage({'status':1})
            return 1;
        }

        // server POST
        let responseobj = await fetcher('/buy', 'POST', {'symbol':symbol, 'buyamt':input});

        this.buysellviewRef.renderTxnMessage(responseobj[0]);

        // if all went well, refresh
        if (responseobj[0]['status'] == 0)
            this.updatePageHoldingsData(responseobj);
    }

    /** handles the sell request */
    async sell(){
        const argstates = this.controllerRef.returnStates();
        const quantity = this.controllerRef.returnQuantity();
        const currprice = this.controllerRef.returnCurrprice();
        const symbol = this.controllerRef.returnSymb();

        let inputshares = 0;

        // get the input depending on the state
        if (argstates['bydollars']){
            let input = parseFloat(document.getElementById("viewselldollars").value);
            inputshares = (input/currprice).toFixed(2);
        }
        if (argstates['byshares'])
            inputshares = parseFloat(document.getElementById("viewsellshares").value);


        // Client side check
        if (inputshares > quantity){
            this.buysellviewRef.renderTxnMessage({'status':2})
            return 1;
        }

        // prepare body
        let body = {'symbol':symbol, 'sellamt':inputshares, 'close':false}

        if (argstates['byclose'])
            body['close'] = true;

        // server POST
        let responseobj = await fetcher('/sell', 'POST', body);

        this.buysellviewRef.renderTxnMessage(responseobj[0]);

        // if all went well, refresh
        if (responseobj[0]['status'] == 0)
            this.updatePageHoldingsData(responseobj)
    }


}
