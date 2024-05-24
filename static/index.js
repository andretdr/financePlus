async function getHoldingsPage(argtype = 'full'){
    
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