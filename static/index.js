async function getHoldingsPage(argtype = 'full'){
    
    // type = full, cash, holdings, sort = symb, quantity, avgcost
    let dataobj = await fetcher('/', 'POST', {'status':'request', 'type':argtype});
    return dataobj;

}

async function refreshHoldingsPage() {
    let resultObj = await getHoldingsPage();
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