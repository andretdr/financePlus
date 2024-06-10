
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

        this.getMarketStatus();

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

        this.daygraph.push({'prevclose':argrawdata[j]['prevdayclose'], 'open':argrawdata[j]['dayopen'], 'prevdate':argrawdata[j]['prevclosedate']});
        this.weekgraph.push({'open':argrawdata[j+1]['prevweekopen'], 'prevdate':argrawdata[j+1]['prevclosedate']});
        this.monthgraph.push({'open':argrawdata[j+2]['prevmonthopen'], 'prevdate':argrawdata[j+2]['prevclosedate']});
        this.threemgraph.push({'open':argrawdata[j+3]['prevthreemopen'], 'prevdate':argrawdata[j+3]['prevclosedate']});
        this.yeargraph.push({'open':argrawdata[j+4]['prevyearopen'], 'prevdate':argrawdata[j+4]['prevclosedate']});

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

        this.weeklyreturn = this.currprice-argrawdata[j+1]['prevweekopen'];
        this.weeklypercent = this.weeklyreturn/argrawdata[j+1]['prevweekopen']*100;

        this.monthlyreturn = this.currprice-argrawdata[j+2]['prevmonthopen'];
        this.monthlypercent = this.monthlyreturn/argrawdata[j+2]['prevmonthopen']*100;

        this.threemreturn = this.currprice-argrawdata[j+3]['prevthreemopen'];
        this.threempercent = this.threemreturn/argrawdata[j+3]['prevthreemopen']*100;

        this.yearlyreturn = this.currprice-argrawdata[j+4]['prevyearopen'];
        this.yearlypercent = this.yearlyreturn/argrawdata[j+4]['prevyearopen']*100;
    }

    /** get server side stock/API data, updates it */
    async refreshAPIDataServer(){
        const data = await this.getAPIData();
        this.refreshStockData(data);
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


    /** records current market status */
    getMarketStatus(){
        const open = new Date();
        open.setUTCHours(13);
        open.setUTCMinutes(30);

        const close = new Date();
        close.setUTCHours(20);
        open.setUTCMinutes(0);

        const now = new Date();
        if ((open <= now) && (now <= close)){
            this.market_status = 'open';
        }
        else{
            this.market_status = 'close';        
        }
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

    returnMarketStatus(){return this.market_status;}
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

        this.renderMarketStatus();

        this.renderGraph(this.controllerRef.returnViewdata);

        this.disableGraphButton();

        this.renderviewinfo();

        this.updatePageHoldingsData();

    }

    /** renders symbol on page */
    renderSymbol(){
        document.getElementById("viewlogo").innerHTML = `<h2>${this.controllerRef.returnSymb()}</h2>`;
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
        document.getElementById("view-error").innerHTML = html;
    }

    /** accepts argrange of '1d','1w','1m','3m','1y' */
    graphButton(argrange) {
        // if button is not already pressed
        if (this.controllerRef.returnViewdata() != argrange){

            // set new view data
            this.controllerRef.setViewdata(argrange);

            // redraw graph
            this.renderGraph();

            // render info
            this.renderviewinfo();

            this.disableGraphButton();
        }
    }

    /** disables the graph buttons when selected */
    disableGraphButton(){
        const argrange = this.controllerRef.returnViewdata();

        // disable button
        const switcher = {'1d':'viewgraphday', '1w':'viewgraphweek', 
                            '1m':'viewgraphmonth', '3m':'viewgraphthreem', '1y':'viewgraphyear'}

        // enable all buttons 1st                                
        for (let key in switcher){
            let element = document.getElementById(switcher[key]);
            element.disabled = false;
        }
        // disable the one
        let element = document.getElementById(switcher[argrange]);
        element.disabled = true;
    }

    /** render the stock graph given data from this.controllerRef **/
    renderGraph(){

        let argdata = this.controllerRef.returnSmartGraphdata();

        document.getElementById('viewcanvas').innerHTML = `<canvas id='viewgraph' style="width:100%; max-width:700px;"></canvas>`;

        let xValues = [];
        let yValues = [];

        yValues.push(argdata[0]['open']);
        xValues.push(argdata[0]['prevdate']);

        for (let i=1; i<argdata.length; i++){
            yValues.push(argdata[i]['Close']);
            xValues.push(argdata[i]['Range']);
        }

        // determining color of graph
        let ylength = yValues.length;
        let bordercolor;
        let fillcolor;

        // dynamically determining scale of graph
        let fontsize = 12
        let w = window.innerWidth;
        if (w < 650)
            fontsize = 9

        if (yValues[0] <= yValues[ylength-1]){
            bordercolor = '#65cb45'; //rgb(101, 228, 69);
            fillcolor = '#dbffd2'; //rgb(219, 255, 210);
        }
        else {
            bordercolor = '#ec4959'; //rgb(236, 73, 89);
            fillcolor = 'rgb(255, 210, 215)';
        }

        // prepping data
        const data = {
            labels: xValues,
            datasets: [{
                data: yValues,
                fill: true,
                backgroundColor: fillcolor,
                borderColor: bordercolor,
                borderWidth: 2,
                pointStyle: false,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 0,
                tension: 0
            }]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    ticks: {
                        // forces step size to be 50 units
                        stepSize: 0.05,
                        maxTicksLimit: 6,
                        // Include a dollar sign in the ticks
                        callback: function(value, index, ticks) {
                            return ('$' + value.toFixed(2));
                        },
                        font: {
                            size: fontsize
                        }
                      },
                    grid: {
                    display: false
                    }
                },
                x: {
                    ticks: {
                        // forces step size to be 50 units
                        maxTicksLimit: 6,

                        font: {
                            size: fontsize
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {duration:0},
            layout: {
                padding: {
                    right: 5,
                    bottom: 20
                }
            }
        };

        // drawing the chart
        new Chart("viewgraph", {
            type: 'line',
            data: data,
            spanGaps: true,
            options: options
        });
    }

    /** render the stock data */
    renderviewinfo(){

    const currentprice = (this.controllerRef.returnCurrprice()).toFixed(2);
    const dailyreturn = (this.controllerRef.returnSmartly()).toFixed(2);
    const dailypercent = (this.controllerRef.returnSmartlyP()).toFixed(2);

    let html = `
            <div class="view-stockprice">
                <div class="view-stockprice-cp" id="viewcurrentprice">$${currentprice}</div>
                <div class="view-stockprice-drdp">
            `;
    if (parseFloat(dailyreturn) < 0)
        html += `       <span id="viewdailyreturn" style='color:red;'>${dailyreturn}&darr;  (${dailypercent})&#37&darr; </span>
                    </div>
                </div>
                `;
    else
        html += `       <span id="viewdailyreturn" style='color:green;'>${dailyreturn}&uarr;  (${dailypercent})&#37&uarr;</span>
                    </div>
                </div>
                `;

    document.getElementById("viewinfo").innerHTML = html;
    }

    /** get API data from server through controllerRef, then update page */
    async refreshAPIDataServerV(){
        await this.controllerRef.refreshAPIDataServer();
        this.renderGraph(this.controllerRef.returnSmartGraphdata());
        this.renderviewinfo();
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
        const pnl = (value - totalcost).toFixed(2);

        let html = `
                <div class="view-holdings__header">Holdings </div>

                <div class="view-holdings__lineitem">
                    <div>Quantity :</div>
                    <div class="view-holdings__resultcontainer">
                        <div class="view-holdings__result">${quantity}</div>
                    </div>
                </div>
        
                <div class="view-holdings__lineitem">
                    <div>Avg Cost :</div>                
                    <div class="view-holdings__resultcontainer">
                        <div class="view-holdings__unit">$</div>
                        <div class="view-holdings__result">${avgcost}</div>
                    </div>
                </div>
        
                <div class="view-holdings__lineitem">
                    <div>Market Value :</div>
                    <div class="view-holdings__resultcontainer">
                        <div class="view-holdings__unit">$</div>
                        <div class="view-holdings__result">${value}</div>
                    </div>
        
                </div>
        
                <div class="view-holdings__lineitem">
                    <div>Unrealised P & L :</div>
                    <div class="view-holdings__resultcontainer">
                        <div class="view-holdings__unit">$</div>
                        <div class="view-holdings__result">${pnl}</div>
                    </div>
                </div>
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

    /** resets all input values in buy page */
    resetBuyInput(){
        document.getElementById('viewbuydollars').value = '';
        document.getElementById('viewbuyshares').value = '';
    }

    /** resets all input values in buy page */
    resetSellInput(){
        document.getElementById('viewselldollars').value = '';
        document.getElementById('viewsellshares').value = '';
        document.getElementById('viewsellclose').checked = false;
        const argstate = this.controllerRef.returnStates();
        if (argstate['bydollars'])
            this.buysellviewRef.refreshSellEstShares();
        if (argstate['byshares'])
            this.buysellviewRef.refreshSellEstTotal();
        //document.getElementById('sellesttotal').innerHTML = '0.00';
    }

    /** handles the buy request */
    async buy(){

        const argstates = this.controllerRef.returnStates();
        const cash = parseFloat(this.controllerRef.returnCash());
        const symbol = this.controllerRef.returnSymb();
        const currprice = parseFloat(this.controllerRef.returnCurrprice());
        let input = 0;

        // getting user input
        if (argstates['bydollars'])
            input = document.getElementById("viewbuydollars").value;
        if (argstates['byshares']){
            let inputshares = document.getElementById("viewbuyshares").value;
            input = inputshares * currprice;
        }

        let errorcolor='red';
        
        // Client side check
        if (input > cash){
            this.buysellviewRef.renderTxnMessage({'status':1}, errorcolor)
            return 1;
        }
        if (input == 0){
            this.buysellviewRef.renderTxnMessage({'status':4}, errorcolor)
            return 1;
        }

        // Good to transact
        // disable button
        document.getElementById("buy-button").disabled = true;
        setTimeout(()=>{document.getElementById("buy-button").disabled = false;}, 4000);
        // server POST
        let responseobj = await fetcher('/buy', 'POST', {'symbol':symbol, 'buyamt':input});

        // if all went well, refresh
        if (responseobj[0]['status'] == 0){
            errorcolor = 'black';
            this.resetBuyInput();
            this.updatePageHoldingsData(responseobj);
        }

        this.buysellviewRef.renderTxnMessage(responseobj[0], errorcolor);
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
        
        if (argstates['byclose'])
            inputshares = quantity;

        let errorcolor='red';

        // Client side check
        // if not enough shares
        if (inputshares > quantity){
            this.buysellviewRef.renderTxnMessage({'status':2}, errorcolor)
            return 1;
        }
        // if not enough shares
        if (isNaN(inputshares) || (inputshares == 0)){
            this.buysellviewRef.renderTxnMessage({'status':4}, errorcolor)
            return 1;
        }

        // prepare body
        let body = {'symbol':symbol, 'sellamt':inputshares, 'close':false}

        if (argstates['byclose'])
            body['close'] = true;

        // Good to transact
        // disable button for 3 secs
        document.getElementById("sell-button").disabled = true;
        setTimeout(()=>{document.getElementById("sell-button").disabled = false;}, 4000);
        // server POST
        let responseobj = await fetcher('/sell', 'POST', body);

        // if all went well, refresh
        if (responseobj[0]['status'] == 0){
            this.resetSellInput();
            this.updatePageHoldingsData(responseobj)
            errorcolor = 'black'
        }

        this.buysellviewRef.renderTxnMessage(responseobj[0], errorcolor);
        
    }

    renderMarketStatus(){
        const argmarket_status = this.controllerRef.returnMarketStatus();
        let market_status;
        let color;

        if (argmarket_status == 'open'){
            market_status = 'MARKET OPEN';
            color = 'green';
        }
        else{
            market_status = 'MARKET CLOSE';
            color = 'red';
        }

        let el = document.getElementById("market__status");
        el.innerHTML = market_status;
        el.style.color = color;        
    }

}
