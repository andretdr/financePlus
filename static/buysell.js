/** array of status messages for the buy/sell menu */

const transactionStatus =   [   "Transaction Made",
                                "Insufficient Funds available",
                                "Insufficient Shares available",
                                ""
                            ];


/** set state given the state list, and boolean values in the order of
 *  buy, sell, dollars, shares */
function setState(argstates, buy, sell, dollars, shares, close){

    argstates['buy'] = buy;
    argstates['sell'] = sell;
    argstates['bydollars'] = dollars;
    argstates['byshares'] = shares;
    argstates['byclose'] = close;
}


/** test for quantity owed, if 0, disable sell button */
function disableSellButton(arghdata){

    let sellbutton = document.getElementById("viewsellbutton");

    if (arghdata[0]['quantity'] == 0){
        sellbutton.disabled = true;
    }
    else
        sellbutton.disabled = false;
}


/** show buy menu */
function showBuyMenu(argstates){
    document.getElementById("buyhideme").style.visibility = "visible";

    // show and set buy in dollars state
    buyindollars(argstates);

    currprice = getCurrentPricePage();

    //refresh page data
    refreshbuypagecurrprice(currprice);
    refreshEstShares(currprice);

    updateAvailSharesTxnPage(argstates);
    updateCashTxnPage(argstates);

    addELbuyshares(argstates);
    addELbuydollars(argstates);
}


/** show sell menu */
function showSellMenu(argstates){
    document.getElementById("sellhideme").style.visibility = "visible";

    // show and set sell in dollars state
    sellindollars(argstates);

    currprice = getCurrentPricePage();

    //refresh page data
    refreshsellpagecurrprice(currprice);
    refreshSellEstShares(currprice);
    
    updateAvailSharesTxnPage(argstates);
    updateCashTxnPage(argstates);

    addELsellshares(argstates);
    addELselldollars(argstates);
}


/** hide buy sell menus */
function closeBuySellMenu(argstates){
    let buysellmenu = document.getElementById("buyhideme")
    buysellmenu.style.visibility = "hidden";

    buysellmenu = document.getElementById("sellhideme")
    buysellmenu.style.visibility = "hidden";

    hideallbuy();
    hideallsell();

    // clear messages
    renderTxnMessage(argstates, {"status":3});

    // set state to buystate false
    setState(argstates, false, false, false, false, false);

}


/** show buy in dollars state */
function buyindollars(argstates){

    document.getElementById("buydollarsformcontainer").style.visibility = "visible";
    document.getElementById("buydollarsbuttoncontainer").style.visibility = "hidden";
    document.getElementById("buysharesformcontainer").style.visibility = "hidden";
    document.getElementById("buysharesbuttoncontainer").style.visibility = "visible";

    document.getElementById("buytype").innerHTML = `Estimated Shares : <data id="buyestshares"></data> share(s)`;

    renderTxnMessage(argstates, {"status":3});

    // set buy in dollars state
    setState(argstates, true, false, true, false, false);

//    refreshEstShares(getCurrentPricePage());
    updatebuydollarspage(argstates);
}


/** show buy in shares state */
function buyinshares(argstates){

    document.getElementById("buydollarsformcontainer").style.visibility = "hidden";
    document.getElementById("buydollarsbuttoncontainer").style.visibility = "visible";
    document.getElementById("buysharesformcontainer").style.visibility = "visible";
    document.getElementById("buysharesbuttoncontainer").style.visibility = "hidden";

    document.getElementById("buytype").innerHTML = `Estimated Cost : $<data id="buyestdollars"></data>`;

    renderTxnMessage(argstates, {"status":3});

    // set buy in shares state
    setState(argstates, true, false, false, true, false);

//    refreshEstDollars(getCurrentPricePage());
    updatebuysharespage(argstates);
}


/** show sell in dollars state */
function sellindollars(argstates){

    document.getElementById("selldollarsformcontainer").style.visibility = "visible";
    document.getElementById("selldollarsbuttoncontainer").style.visibility = "hidden";
    document.getElementById("sellsharesformcontainer").style.visibility = "hidden";
    document.getElementById("sellsharesbuttoncontainer").style.visibility = "visible";

    document.getElementById("sellcloseformcontainer").style.visibility = "hidden";
    document.getElementById("sellclosebuttoncontainer").style.visibility = "visible";

    document.getElementById("selltype").innerHTML = `Estimated Shares : <data id="sellestshares"></data> share(s)`;

    // set buy in dollars state
    setState(argstates, false, true, true, false, false);

    //refreshSellEstShares(getCurrentPricePage());
    updateselldollarspage(argstates);
}


/** show sell in shares state */
function sellinshares(argstates){

    document.getElementById("selldollarsformcontainer").style.visibility = "hidden";
    document.getElementById("selldollarsbuttoncontainer").style.visibility = "visible";
    document.getElementById("sellsharesformcontainer").style.visibility = "visible";
    document.getElementById("sellsharesbuttoncontainer").style.visibility = "hidden";

    document.getElementById("sellcloseformcontainer").style.visibility = "hidden";
    document.getElementById("sellclosebuttoncontainer").style.visibility = "visible";

    document.getElementById("selltype").innerHTML = `Estimated Total : $<data id="sellesttotal"></data>`;

    // set buy in shares state
    setState(argstates, false, true, false, true, false);

    //refreshSellEstShares(getCurrentPricePage());
    updatesellsharespage(argstates);

}


/** show sell close state */
function sellClose(argstates){

    document.getElementById("selldollarsformcontainer").style.visibility = "hidden";
    document.getElementById("selldollarsbuttoncontainer").style.visibility = "visible";
    document.getElementById("sellsharesformcontainer").style.visibility = "hidden";
    document.getElementById("sellsharesbuttoncontainer").style.visibility = "visible";

    document.getElementById("sellcloseformcontainer").style.visibility = "visible";
    document.getElementById("sellclosebuttoncontainer").style.visibility = "hidden";

    document.getElementById("selltype").innerHTML = `Estimated Total : $<data id="sellesttotal"></data>`;

    // set buy in shares state
    setState(argstates, false, true, false, false, true);

    //refreshSellEstShares(getCurrentPricePage());
    updatesellclosepage(argstates);

}


/** hide all shares */
function hideallbuy(){

    document.getElementById("buydollarsformcontainer").style.visibility = "hidden";
    document.getElementById("buydollarsbuttoncontainer").style.visibility = "hidden";
    document.getElementById("buysharesformcontainer").style.visibility = "hidden";
    document.getElementById("buysharesbuttoncontainer").style.visibility = "hidden";
}


/** hide all shares */
function hideallsell(){

    document.getElementById("selldollarsformcontainer").style.visibility = "hidden";
    document.getElementById("selldollarsbuttoncontainer").style.visibility = "hidden";
    document.getElementById("sellsharesformcontainer").style.visibility = "hidden";
    document.getElementById("sellsharesbuttoncontainer").style.visibility = "hidden";
    document.getElementById("sellcloseformcontainer").style.visibility = "hidden";
    document.getElementById("sellclosebuttoncontainer").style.visibility = "hidden";

}


/** update buydollarspage */
function updatebuydollarspage(argstates){

    let buyid = document.getElementById("viewbuydollars");
    const inputvalue = parseFloat(buyid.value);
    const currprice = parseFloat(getCurrentPricePage());
    const cash = getCashPage();
    let color = '';

    if (inputvalue > cash){
        color = 'red';
    }
    else
        color = 'black';

    buyid.style.color = color;
    updateCashTxnPage(argstates, color);

    refreshEstShares(currprice);
}


/** dynamically updates color for cash n refreshes est dollars 
 *  based on curr price updates and input */
function updatebuysharespage(argstates){
    let buysid = document.getElementById("viewbuyshares");
    const inputvalue = parseFloat(buysid.value);
    const currprice = parseFloat(getCurrentPricePage());
    const cash = getCashPage();
    let color = '';

    if (inputvalue*currprice > cash){
        color = 'red';
    }
    else
        color = 'black';
    
    
    updateCashTxnPage(argstates, color);

    refreshEstDollars(currprice, color);
}


/** dynamically updates color for avilshares n refreshes est shares 
 *  based on curr price updates and input */
function updateselldollarspage(argstates){
    console.log(argstates)

    let sellid = document.getElementById("viewselldollars");
    const inputvalue = parseFloat(sellid.value);
    const currprice = parseFloat(getCurrentPricePage());
    const availshares = getAvailSharesPage();
    let color = '';

    if ((inputvalue/currprice) > availshares){
        color = 'red';
    }
    else
        color = 'black';

    
    updateAvailSharesTxnPage(argstates, color);

    refreshSellEstShares(currprice, color);
}


/** dynamically updates color for avilshares n refreshes est total 
 *  based on curr price updates and input */
function updatesellsharespage(argstates){
    
    let sellid = document.getElementById("viewsellshares");
    const inputvalue = parseFloat(sellid.value);
    const currprice = parseFloat(getCurrentPricePage());
    const availshares = getAvailSharesPage();

    let color = '';

    if (inputvalue > availshares)
        color = 'red';
    
    else
        color = 'black';
    
    sellid.style.color = color;
    updateAvailSharesTxnPage(argstates, color);

    refreshSellEstTotal(currprice, color);
}


/** dynamically updates color for avilshares n refreshes est total 
 *  based on curr price updates and input */
function updatesellclosepage(argstates){
    
    updateAvailSharesTxnPage(argstates);
    
    refreshSellEstTotalClose();
}


/** add EL to input field buy in dollars */
function addELbuydollars(argstates){

    let buyid = document.getElementById("viewbuydollars");
    buyid.addEventListener('keyup', () => {
        updatebuydollarspage(argstates);
        renderTxnMessage(argstates, {"status":3});
    });
}


/** add EL to input field buy in shares */
function addELbuyshares(argstates){

    let buysid = document.getElementById("viewbuyshares");
    buysid.addEventListener('keyup', ()=> {
        updatebuysharespage(argstates);
        renderTxnMessage(argstates, {"status":3});
    });

}


/** add EL to input field buy in dollars */
function addELselldollars(argstates){

    let sellid = document.getElementById("viewselldollars");
    sellid.addEventListener('keyup', () => {
        updateselldollarspage(argstates);
        renderTxnMessage(argstates, {"status":3});
    });
}


/** add EL to input field buy in shares */
function addELsellshares(argstates){

    let buysid = document.getElementById("viewsellshares");
    buysid.addEventListener('keyup', ()=> {
        updatesellsharespage(argstates)
        renderTxnMessage(argstates, {"status":3});
    });

}


/** refresh buy page current price */
function refreshbuypagecurrprice(argcurrprice){
    document.getElementById("buycurrentprice").innerHTML = `${argcurrprice.toFixed(2)}`
}


/** refresh sell page current price */
function refreshsellpagecurrprice(argcurrprice){
    document.getElementById("sellcurrentprice").innerHTML = `${argcurrprice.toFixed(2)}`
}


/** refresh est shares */
function refreshEstShares(argcurrprice){

    let buyinputdollars = parseFloat(document.getElementById("viewbuydollars").value);

    if (isNaN(buyinputdollars)){
        buyinputdollars = 0;
   }

    let estshares = (buyinputdollars/argcurrprice).toFixed(2);

    // update est shares on buy page
    document.getElementById("buyestshares").innerHTML = `${estshares}`;
}


/** refresh est dollars */
function refreshEstDollars(argcurrprice, argcolor='black'){

    let buyinputshares = parseFloat(document.getElementById("viewbuyshares").value);

    if (isNaN(buyinputshares)){
        buyinputshares = 0;
   }
   console.log(argcurrprice);

   let estcost = (buyinputshares * argcurrprice).toFixed(2);

   // update est cost on buy page
   document.getElementById("buyestdollars").innerHTML = `${estcost}`;
   document.getElementById("buyestdollars").style.color = argcolor;
}


/** refresh SELL est shares */
function refreshSellEstShares(argcurrprice, argcolor = 'black'){

    let sellinputdollars = parseFloat(document.getElementById("viewselldollars").value);

    if (isNaN(sellinputdollars)){
        sellinputdollars = 0;
   }

    let estshares = (sellinputdollars/argcurrprice).toFixed(2);

    // update est shares on sell page
    document.getElementById("sellestshares").innerHTML = `${estshares}`;
    document.getElementById("sellestshares").style.color = argcolor;
}


/** refresh SELL est total */
function refreshSellEstTotal(argcurrprice){
    let sellinputshares = parseFloat(document.getElementById("viewsellshares").value);

    if (isNaN(sellinputshares)){
        sellinputshares = 0;
   }

   let esttotal = (sellinputshares * argcurrprice).toFixed(2);

   // update est total on sell page
   document.getElementById("sellesttotal").innerHTML = `${esttotal}`;
}


/** refresh SELL est total on close */
function refreshSellEstTotalClose(){

    let sellid = document.getElementById("viewsellclose");

    const currprice = parseFloat(getCurrentPricePage());
    const availshares = parseFloat(getAvailSharesPage());
    let esttotal = 0;

    if (sellid.checked == true){
        esttotal = (currprice*availshares).toFixed(2);
    }

    // update est total on sell page
    document.getElementById("sellesttotal").innerHTML = `${esttotal}`;

};

/** update cash buy page */
function updateCashTxnPage(argstates, argcolor='black'){
    const cash = getCashPage();
 
    if (argstates['buy']){
        document.getElementById("buycash").innerHTML=`${parseFloat(cash).toFixed(2)}`;
        document.getElementById("buycash").style.color = argcolor;
    }

    if (argstates['sell']){
        document.getElementById("sellcashtotal").innerHTML=`${parseFloat(cash).toFixed(2)}`;
    }

}


/** update availshares in sell page */
function updateAvailSharesTxnPage(argstates, argcolor='black'){
    const shares = getAvailSharesPage();
 
    if (argstates['sell']){
        document.getElementById("sellsharestotal").innerHTML=`${parseFloat(shares).toFixed(2)}`;
        document.getElementById("sellsharestotal").style.color = argcolor;
    }
    if (argstates['buy']){
        document.getElementById("buyquantity").innerHTML=`${parseFloat(shares).toFixed(2)}`;
    }
}


/** handles the buy request */
async function buy(argstates){
    const cash = getCashPage();
    const symbol = getSymbolPage();
    let input = 0;

    // getting user input
    if (argstates['bydollars'])
        input = document.getElementById("viewbuydollars").value;
    if (argstates['byshares']){
        let inputshares = document.getElementById("viewbuyshares").value;
        let currprice = getCurrentPricePage();
        input = (inputshares * currprice).toFixed(2);
    }

    // Client side check
    if (input > cash){
        renderTxnMessage(argstates, {'status':1})
        return 1;
    }

    // server POST
    let responseobj = await fetcher('/buy', 'POST', {'symbol':symbol, 'buyamt':input});

    renderTxnMessage(argstates, responseobj[0]);


    // if all went well, refresh
    if (responseobj[0]['status'] == 0)
        updatePageHoldingsData(responseobj, argstates)
}


/** handles the sell request */
async function sell(argstates){
    const quantity = parseFloat(getAvailSharesPage());
    const currprice = parseFloat(getCurrentPricePage());
    const symbol = getSymbolPage();

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
        renderTxnMessage(argstates, {'status':2})
        return 1;
    }

    // prepare body
    let body = {'symbol':symbol, 'sellamt':inputshares, 'close':false}

    if (argstates['byclose'])
        body['close'] = true;

    // server POST
    let responseobj = await fetcher('/sell', 'POST', body);

    renderTxnMessage(argstates, responseobj[0]);

    // if all went well, refresh
    if (responseobj[0]['status'] == 0)
        updatePageHoldingsData(responseobj, argstates)
}



/** renders any status message */
function renderTxnMessage(argstate, status, argmessage=transactionStatus){
    html =  `
                ${argmessage[status['status']]}
            `
    if (argstate['buy'])
        document.getElementById("buystatus").innerHTML= html;
    if (argstate['sell'])
        document.getElementById("sellstatus").innerHTML= html;
}

