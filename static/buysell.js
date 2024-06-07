/** array of status messages for the buy/sell menu */

const transactionStatus =   [   "Transaction Made",
                                "Insufficient Funds available",
                                "Insufficient Shares available",
                                "",
                                "Input cannot be zero"
                            ];

class buySellView{
    // methods
    constructor(argController){
        // initialise
        this.controllerRef = argController;
    }

    /** show buy in dollars state */
    buyindollars(){
        document.getElementById("buydollarsformcontainer").style.display = "flex";
        document.getElementById("buydollarsbuttoncontainer").style.display = "none";
        document.getElementById("buysharesformcontainer").style.display = "none";
        document.getElementById("buysharesbuttoncontainer").style.display = "flex";

        document.getElementById("buytype").innerHTML = 
                    ` 
                        <div class="buysell-holdings__text"> Estimated Shares : </div>
                        <div class="buysell-holdings__resultcontainer">
                            <div class="buysell-holdings__result" id="buyestshares">
                            </div>
                        </div>
                    `;

        this.renderTxnMessage({"status":3});

        // set buy in dollars state
        this.controllerRef.setState(true, false, true, false, false);

        this.updatebuydollarspage();
    }

    /** show buy in shares state */
    buyinshares(){

        document.getElementById("buydollarsformcontainer").style.display = "none";
        document.getElementById("buydollarsbuttoncontainer").style.display = "flex";
        document.getElementById("buysharesformcontainer").style.display = "flex";
        document.getElementById("buysharesbuttoncontainer").style.display = "none";

        document.getElementById("buytype").innerHTML = 
                    `
                        <div class="buysell-holdings__text"> Estimated Cost : </div>
                        <div class="buysell-holdings__resultcontainer">
                            <div class="buysell-holdings__unit">$</div>
                            <div class="buysell-holdings__result" id="buyestdollars">
                            </div>
                        </div>
                            
                    `;

        this.renderTxnMessage({"status":3});

        // set buy in shares state
        this.controllerRef.setState(true, false, false, true, false);

    //    refreshEstDollars(getCurrentPricePage());
        this.updatebuysharespage();
    }

    /** show sell in dollars state */
    sellindollars(){
        document.getElementById("selldollarsformcontainer").style.display = "flex";
        document.getElementById("selldollarsbuttoncontainer").style.display = "none";
        document.getElementById("sellsharesformcontainer").style.display = "none";
        document.getElementById("sellsharesbuttoncontainer").style.display = "flex";

        document.getElementById("sellcloseformcontainer").style.display = "none";
        document.getElementById("sellclosebuttoncontainer").style.display = "flex";

        document.getElementById("selltype").innerHTML =
                    `
                        <div class="buysell-holdings__text"> Estimated Shares : </div>
                        <div class="buysell-holdings__resultcontainer">
                            <div class="buysell-holdings__result" id="sellestshares">
                            </div>
                        </div>
                    `;

        // set buy in dollars state
        this.controllerRef.setState(false, true, true, false, false);

        //refreshSellEstShares(getCurrentPricePage());
        this.updateselldollarspage();
    }


    /** show sell in shares state */
    sellinshares(){

        document.getElementById("selldollarsformcontainer").style.display = "none";
        document.getElementById("selldollarsbuttoncontainer").style.display = "flex";
        document.getElementById("sellsharesformcontainer").style.display = "flex";
        document.getElementById("sellsharesbuttoncontainer").style.display = "none";

        document.getElementById("sellcloseformcontainer").style.display = "none";
        document.getElementById("sellclosebuttoncontainer").style.display = "flex";

        document.getElementById("selltype").innerHTML =
                    `
                        <div class="buysell-holdings__text"> Estimated Total : </div>
                        <div class="buysell-holdings__resultcontainer">
                            <div class="buysell-holdings__unit">$</div>
                            <div class="buysell-holdings__result" id="sellesttotal">
                            </div>
                        </div>
                            
                    `;

        // set buy in shares state
        this.controllerRef.setState(false, true, false, true, false);

        //refreshSellEstShares(getCurrentPricePage());
        this.updatesellsharespage();

    }


    /** show sell close state */
    sellClose(){

        document.getElementById("selldollarsformcontainer").style.display = "none";
        document.getElementById("selldollarsbuttoncontainer").style.display = "flex";
        document.getElementById("sellsharesformcontainer").style.display = "none";
        document.getElementById("sellsharesbuttoncontainer").style.display = "flex";

        document.getElementById("sellcloseformcontainer").style.display = "flex";
        document.getElementById("sellclosebuttoncontainer").style.display = "none";

        document.getElementById("selltype").innerHTML =
                        `
                            <div class="buysell-holdings__text"> Estimated Total : </div>
                            <div class="buysell-holdings__resultcontainer">
                                <div class="buysell-holdings__unit">$</div>
                                <div class="buysell-holdings__result" id="sellesttotal">
                                </div>
                            </div>
                                
                        `;

        // set buy in shares state
        this.controllerRef.setState(false, true, false, false, true);

        //refreshSellEstShares(getCurrentPricePage());
        this.updatesellclosepage();
    }

    /** renders any status message */
    renderTxnMessage(status, argcolor = 'black'){
        const argmessage = transactionStatus;
        const argstate = this.controllerRef.returnStates();

        let html =  `
                    ${argmessage[status['status']]}
                `
        if (argstate['buy']){
            document.getElementById("buystatus").innerHTML = html;
            document.getElementById("buystatus").style.color = argcolor;
        }
        if (argstate['sell']){
            document.getElementById("sellstatus").innerHTML = html;
            document.getElementById("sellstatus").style.color = argcolor;
        }
    }


    /** update buydollarspage */
    updatebuydollarspage(){
        const cash = parseFloat(this.controllerRef.returnCash());

        let buyid = document.getElementById("viewbuydollars");
        const inputvalue = parseFloat(buyid.value);

        let color = '';

        if (inputvalue > cash){
            color = 'red';
        }
        else
            color = 'black';

        buyid.style.color = color;
        this.updateCashTxnPage(color);

        this.refreshEstShares();
    }

    /** update cash buy page */
    updateCashTxnPage(argcolor='black'){
        const argstates = this.controllerRef.returnStates();
        const cash = returnCash()
    
        if (argstates['buy']){
            document.getElementById("buycash").innerHTML=`${parseFloat(cash).toFixed(2)}`;
            document.getElementById("buycash").style.color = argcolor;
        }

        if (argstates['sell']){
            document.getElementById("sellcashtotal").innerHTML=`${parseFloat(cash).toFixed(2)}`;
        }

    }

    /** dynamically updates color for cash n refreshes est dollars 
     *  based on curr price updates and input */
    updatebuysharespage(){
        let buysid = document.getElementById("viewbuyshares");
        const inputvalue = parseFloat(buysid.value);
        const currprice = parseFloat(this.controllerRef.returnCurrprice());
        const cash = parseFloat(this.controllerRef.returnCash());
        let color = '';

        if (inputvalue*currprice > cash){
            color = 'red';
        }
        else
            color = 'black';
        
        
        this.updateCashTxnPage(color);

        this.refreshEstDollars(color);
    }



    /** show buy menu */
    showBuyMenu(){
        // disable scrolling
        disableScroll();

        const argstates = this.controllerRef.returnStates();
        const currprice = this.controllerRef.returnCurrprice()

        document.getElementById("buyhideme").style.visibility = "visible";
        document.getElementById("buysell-menu__page").style.visibility = "visible";

        // show and set buy in dollars state
        this.buyindollars();

        //refresh page data
        this.refreshbuypagecurrprice();
        this.refreshEstShares();

        this.updateAvailSharesTxnPage();
        this.updateCashTxnPage();

        this.addELbuyshares();
        this.addELbuydollars();
    }

    /** show sell menu */
    showSellMenu(){
        // disable scrolling
        disableScroll();

        document.getElementById("sellhideme").style.visibility = "visible";
        document.getElementById("buysell-menu__page").style.visibility = "visible";
        document.getElementById("viewsellclose").checked = false;

        // show and set sell in dollars state
        this.sellindollars();

        //refresh page data
        this.refreshsellpagecurrprice();
        this.refreshSellEstShares();
        
        this.updateAvailSharesTxnPage();
        this.updateCashTxnPage();

        this.addELsellshares();
        this.addELselldollars();
    }

    /** update availshares in sell page */
    updateAvailSharesTxnPage(argcolor='black'){
        const shares = this.controllerRef.returnQuantity();
        const argstates = this.controllerRef.returnStates();
    
        if (argstates['sell']){
            document.getElementById("sellsharestotal").innerHTML=`${parseFloat(shares).toFixed(2)}`;
            document.getElementById("sellsharestotal").style.color = argcolor;
        }
        if (argstates['buy']){
            document.getElementById("buyquantity").innerHTML=`${parseFloat(shares).toFixed(2)}`;
        }
    }


    /** update cash buy page */
    updateCashTxnPage(argcolor='black'){
        const cash = this.controllerRef.returnCash();
        const argstates = this.controllerRef.returnStates();

        if (argstates['buy']){
            document.getElementById("buycash").innerHTML=`${parseFloat(cash).toFixed(2)}`;
            document.getElementById("buycash").style.color = argcolor;
        }

        if (argstates['sell']){
            document.getElementById("sellcashtotal").innerHTML=`${parseFloat(cash).toFixed(2)}`;
        }
    }


    /** dynamically updates color for avilshares n refreshes est shares 
     *  based on curr price updates and input */
    updateselldollarspage(){

        let sellid = document.getElementById("viewselldollars");
        const inputvalue = parseFloat(sellid.value);
        const currprice = parseFloat(this.controllerRef.returnCurrprice());
        const availshares = parseFloat(this.controllerRef.returnQuantity());
        let color = '';

        if ((inputvalue/currprice) > availshares){
            color = 'red';
        }
        else
            color = 'black';
        
        this.updateAvailSharesTxnPage(color);

        this.refreshSellEstShares(color);
    }


    /** dynamically updates color for avilshares n refreshes est total 
     *  based on curr price updates and input */
    updatesellsharespage(){
        
        let sellid = document.getElementById("viewsellshares");
        const inputvalue = parseFloat(sellid.value);
        const availshares = parseFloat(this.controllerRef.returnQuantity());
        let color = '';

        if (inputvalue > availshares)
            color = 'red';
        
        else
            color = 'black';
        
        sellid.style.color = color;

        this.updateAvailSharesTxnPage(color);

        this.refreshSellEstTotal(color);
    }

    /** toggles the close position */
    toggleClosePosition(){
        // toggle check box
        let el = document.getElementById('viewsellclose');
        console.log("before"+el.checked)
        if (el.checked == true)
            el.checked = false;
        else
        el.checked = true;
        console.log("after"+el.checked)
    }

    /** dynamically updates color for avilshares n refreshes est total 
     *  based on curr price updates and input */
    updatesellclosepage(){
        this.updateAvailSharesTxnPage();
        this.refreshSellEstTotalClose();
    }

    /** runs close position, then updates the sell page */
    checkAndUpdateClose(){
        this.toggleClosePosition();
        this.updatesellclosepage();
    }

    /** main refresher of buysell data */
    renderBuySellData(){
        let argstates = this.controllerRef.returnStates();

        if (argstates['buy']){
            // update curr price buy page
            this.refreshbuypagecurrprice();
            this.updateAvailSharesTxnPage();
    
            if (argstates['bydollars'])
                // update est shares buy page
                this.updatebuydollarspage();    
            //this.refreshEstShares();
    
            if (argstates['byshares'])
                // update est cost buy page
                //this.refreshEstDollars();
                this.updatebuysharespage();
        }
        
        if (argstates['sell']){
            // update curr price sell page
            this.refreshsellpagecurrprice();
            this.updateCashTxnPage();
    
            if (argstates['bydollars'])
                // update est shares sell page
                //this.refreshSellEstShares();
                this.updateselldollarspage();
    
            if (argstates['byshares'])
                // update est cost sell page
                //this.refreshSellEstTotal();
                this.updatesellsharespage();
    
            if (argstates['byclose'])
                // update est cost sell page
                this.updatesellclosepage();
        }
    }

    /** refresh buy page current price */
    refreshbuypagecurrprice(){
        let argcurrprice = this.controllerRef.returnCurrprice();
        document.getElementById("buycurrentprice").innerHTML = `${argcurrprice.toFixed(2)}`
    }

    /** refresh sell page current price */
    refreshsellpagecurrprice(){
        let argcurrprice = this.controllerRef.returnCurrprice();
        document.getElementById("sellcurrentprice").innerHTML = `${argcurrprice.toFixed(2)}`
    }

    /** refresh est shares */
    refreshEstShares(){
        let argcurrprice = this.controllerRef.returnCurrprice();
        let buyinputdollars = parseFloat(document.getElementById("viewbuydollars").value);

        if (isNaN(buyinputdollars)){
            buyinputdollars = 0;
        }

        let estshares = (buyinputdollars/argcurrprice).toFixed(2);

        // update est shares on buy page
        document.getElementById("buyestshares").innerHTML = `${estshares}`;
    }


    /** refresh est dollars */
    refreshEstDollars(argcolor='black'){
        let argcurrprice = this.controllerRef.returnCurrprice();

        let buyinputshares = parseFloat(document.getElementById("viewbuyshares").value);

        if (isNaN(buyinputshares)){
            buyinputshares = 0;
        }
        let estcost = (buyinputshares * argcurrprice).toFixed(2);

        // update est cost on buy page
        document.getElementById("buyestdollars").innerHTML = `${estcost}`;
        document.getElementById("buyestdollars").style.color = argcolor;
    }


    /** refresh SELL est shares */
    refreshSellEstShares(argcolor = 'black'){
        let argcurrprice = this.controllerRef.returnCurrprice();
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
    refreshSellEstTotal(){
        let argcurrprice = this.controllerRef.returnCurrprice();
        let sellinputshares = parseFloat(document.getElementById("viewsellshares").value);

        if (isNaN(sellinputshares)){
            sellinputshares = 0;
        }

        let esttotal = (sellinputshares * argcurrprice).toFixed(2);

        // update est total on sell page
        document.getElementById("sellesttotal").innerHTML = `${esttotal}`;
    }


    /** refresh SELL est total on close */
    refreshSellEstTotalClose(){
        const argcurrprice = this.controllerRef.returnCurrprice();
        const availshares = this.controllerRef.returnQuantity();
        let sellid = document.getElementById("viewsellclose");
        let color = 'black';

        let esttotal = 0;

        console.log('currprice = '+ argcurrprice)
        console.log('qty = '+ availshares)

        if (sellid.checked == true){
            esttotal = argcurrprice*availshares;
            if (esttotal == 0)
                color = 'red';
        }
        // update est total on sell page
        document.getElementById("sellesttotal").innerHTML = `${esttotal.toFixed(2)}`;
        document.getElementById("sellesttotal").style.color = color;
    }

    /** add EL to input field buy in dollars */
    addELbuydollars(){
        
        let buyid = document.getElementById("viewbuydollars");
        buyid.addEventListener('keyup', () => {
            this.updatebuydollarspage();
            this.renderTxnMessage({"status":3});
        });
    }

    /** add EL to input field buy in shares */
    addELbuyshares(){

        let buysid = document.getElementById("viewbuyshares");
        buysid.addEventListener('keyup', ()=> {
            this.updatebuysharespage();
            this.renderTxnMessage({"status":3});
        });
    }

    /** add EL to input field buy in dollars */
    addELselldollars(){

        let sellid = document.getElementById("viewselldollars");
        sellid.focus({preventScroll:true});
        sellid.addEventListener('keyup', () => {
            this.updateselldollarspage();
            this.renderTxnMessage({"status":3});
        });
    }

    /** add EL to input field buy in shares */
    addELsellshares(argstates){

        let buysid = document.getElementById("viewsellshares");
        buysid.addEventListener('keyup', ()=> {
            this.updatesellsharespage()
            this.renderTxnMessage({"status":3});
        });
    }

    /** hide buy sell menus */
    closeBuySellMenu(){
        // enable scrolling
        enableScroll();

        let buysellmenu = document.getElementById("buyhideme");
        buysellmenu.style.visibility = "hidden";

        buysellmenu = document.getElementById("sellhideme");
        buysellmenu.style.visibility = "hidden";

        document.getElementById("buysell-menu__page").style.visibility = "hidden";

        this.hideallbuy();
        this.hideallsell();

        // clear messages
        this.renderTxnMessage({"status":3});

        // set state to buystate false
        this.controllerRef.setState(false, false, false, false, false);
    }

    /** hide all shares */
    hideallbuy(){
        document.getElementById("buydollarsformcontainer").style.display = "none";
        document.getElementById("buydollarsbuttoncontainer").style.display = "none";
        document.getElementById("buysharesformcontainer").style.display = "none";
        document.getElementById("buysharesbuttoncontainer").style.display = "none";
    }

    /** hide all shares */
    hideallsell(){
        document.getElementById("selldollarsformcontainer").style.display = "none";
        document.getElementById("selldollarsbuttoncontainer").style.display = "none";
        document.getElementById("sellsharesformcontainer").style.display = "none";
        document.getElementById("sellsharesbuttoncontainer").style.display = "none";
        document.getElementById("sellcloseformcontainer").style.display = "none";
        document.getElementById("sellclosebuttoncontainer").style.display = "none";
    }
}

