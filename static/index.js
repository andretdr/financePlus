async function getHoldingsPage(argtype = 'cash'){
    
    // type = full, cash, holdings, sort = symb, quantity, avgcost
    let dataobj = await fetcher('/', 'POST', {'status':'request', 'type':argtype});
    return dataobj;

}

async function refreshHoldingsPage(resultObj) {
//    let resultObj = await getHoldingsPage();
    html = ``;

    for (let i = 1; i < resultObj.length; i++){
        symb = resultObj[i]['symb'];
        currprice = (resultObj[i]['currprice']).toFixed(2);
        quantity = resultObj[i]['quantity'];
        avgcost = resultObj[i]['avgcost'];
        prevclose = resultObj[i]['prevclose'];
        dailypnl = ((currprice - prevclose)/prevclose).toFixed(2);

        marketvalue = (currprice*quantity).toFixed(2);
        totalcost = (avgcost*quantity).toFixed(2);
        pnl = (marketvalue - totalcost).toFixed(2);

        html += `
                    <a href="/viewstock?q=${symb}">
                    <p>${symb}  currprice: ${currprice} quantity: ${quantity} 
                    avgcost: ${avgcost} %${dailypnl}, MARKET VALUE: ${marketvalue} 
                    PNL: ${pnl}</p>
                    </a>    
                `
                    
    }

    document.getElementById("holdgrid").innerHTML = html;

};

/**  updates the search counter on the arrow keys. argdir accepts "up", "down" **/
function updateSearchCounter(argcounter, arglength, argdir) {
    let counter = argcounter;

    if (argdir == "up"){
        if (counter <= 0)
            counter = arglength-1;
        else
            counter -= 1;
    }
    if (argdir == "down"){ // if "down"
        if (counter >= arglength-1)
            counter = 0;
        else
            counter += 1;
    }
    console.log("counter aa:"+counter)
    return counter;
}

/**  set color **/
function setActiveSearch(argcounter) {
    searchlist = document.getElementsByClassName("search-menu__items");
    // reset color on all items
    for (let i = 0; i < searchlist.length; i++)
        searchlist[i].style.backgroundColor="rgb(227, 245, 255)";

    // highlight the selected item
    searchlist[argcounter].style.backgroundColor="rgb(233, 127, 137)";
}

/** on hover, set the new highlight, return new counter **/
function onHoverSearch(argcounter) {
    setActiveSearch(argcounter);
    // changing page var
    searchcounter = argcounter;
}


/** class for extracting and handling db data **/
class indexController {
    // methods
    constructor(){
        
        // initialise
        let rawdata = this.getRawDataFromHTML();

        this.cash = this.getCashFromRawData(rawdata);
        this.data = this.getDataFromRawData(rawdata);
        
    }

    /** read html for data, parse to obj */
    getRawDataFromHTML(){
        let datastr = document.getElementById("datadump").value;
        let dataobj = JSON.parse(datastr);
        return dataobj
    }

    /**  read the string and JSON.parse it into object */
    getCashFromRawData(argRawData){
        return parseFloat(argRawData[0]['cash']).toFixed(2);
    }

    /**  return just the data list without the 1st cash entry */
    getDataFromRawData(argRawData){
        let data = [];
        // skip the 1st item
        for (let i = 1; i < argRawData.length; i++){
            data.push(argRawData[i])
        }
        return data;
    }

    returnCash() {
        return this.cash;
    }

    returnData() {
        return this.data;
    }

    async updateRawData() {
        // type = full, cash, holdings, sort = symb, quantity, avgcost
        let argtype = "holdings"
        let dataobj = await fetcher('/', 'POST', {'status':'request', 'type':argtype});
        this.data = this.getDataFromRawData(dataobj);
    }
    
}


/** class for updating page **/
class indexView {
    // methods
    constructor(argController){
        // initialise
        this.controllerRef = argController;
    }

    refreshHoldingsPage() {
        let html = ``;
        let dataobj = this.controllerRef.returnData();

        for (let i = 0; i < dataobj.length; i++){
            let symb = dataobj[i]['symb'];
            let currprice = parseFloat(dataobj[i]['currprice']).toFixed(2);
            let quantity = dataobj[i]['quantity'];
            let avgcost = dataobj[i]['avgcost'];
            let prevclose = dataobj[i]['prevclose'];
            let dailypnl = ((currprice - prevclose)/prevclose).toFixed(2);

            let marketvalue = (currprice*quantity).toFixed(2);
            let totalcost = (avgcost*quantity).toFixed(2);
            let pnl = (marketvalue - totalcost).toFixed(2);

            // setting up the color
            const green = "rgb(15, 175, 0)";
            const red = "rgb(255, 57, 57)";

            let dpnlhtml = ``;
            let pnlhtml = ``;

            if (parseFloat(dailypnl) < 0)
                dpnlhtml = `<data style="color:${red}">(${dailypnl}&#37) &#11206</data>`
            else
                dpnlhtml = `<data style="color:${green}">(${dailypnl}&#37) &#11205</data>`

            if (parseFloat(pnl) < 0)
                pnlhtml = `<data style="color:${red}">${pnl}&#11206</data>`
            else
                pnlhtml = `<data style="color:${green}">${pnl}&#11205</data>`
    
            html += `
                    <a href="/viewstock?q=${symb}">
                        <div class="holding-item">
                            <div class="hitem__each hitem__each--symb"><data>${symb}</data></div>
                            <div class="hitem__each hitem__each--cp"><data>${currprice}</data></div>
                            <div class="hitem__each hitem__each--quantity"><data>${quantity}</data></div>
                            <div class="hitem__each hitem__each--dailypnl">
                    `
                    +
                    dpnlhtml
                    +
                    `
                            </div>
                            <div class="hitem__each hitem__each--value"><data class="hitem__data">${marketvalue}</data></div>
                            <div class="hitem__each hitem__each--pnl">
                    `
                    +
                    pnlhtml
                    +
                    `       </div>
                        </div>
                    </a>    
                    `
                        
        }
        document.getElementById("index-body__grid-insert").innerHTML = html;
    }
}