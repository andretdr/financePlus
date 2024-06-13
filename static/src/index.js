/** about pop up */
function showAbout() {
    updateWriteUp("about__text");
    let screen = document.getElementById('screen_about');
    let about = document.getElementById('about');
    screen.style.visibility = 'visible';
    about.style.visibility = 'visible';
}

/** hide about pop up */
function hideAbout() {
    let screen = document.getElementById('screen_about');
    let about = document.getElementById('about');
    screen.style.visibility = 'hidden';
    about.style.visibility = 'hidden';
}

/** aboutstart pop up */
function showAboutStart() {
    let screen = document.getElementById('screen_about');
    let aboutstart = document.getElementById('about-start');
    screen.style.visibility = 'visible';
    aboutstart.style.visibility = 'visible';
}

/** aboutstart pop up */
function hideAboutStart(){
    let screen = document.getElementById('screen_about');
    let aboutstart = document.getElementById('about-start');
    screen.style.visibility = 'hidden';
    aboutstart.style.visibility = 'hidden';
}

/** disable logo **/
function linkDisable(p_id){
    let el = document.getElementById(p_id);
    el.classList.add("link__disable");
}

/** log out **/
function logout() {
    location.assign('/logout');
}

/** delete account **/
async function deleteAccount() {
    let body = {'message':'confirm'}
    let confirm = await fetcher('/delete', 'POST', body)
    if (confirm['message'] == 'confirm')
        location.assign('/landing');
}

/**  toggles the profile menu on or off **/
function toggleProfile() {
    let el = document.getElementById("profile-menu__page");
    if (el.style.display == 'none')
        el.style.display = 'flex';
    else
    el.style.display = 'none';
}

/** show confirm delete account menu **/
function showConfirmDel() {
    let del_element = document.getElementById("profile-menu__del");
    del_element.style.display = 'none';
    let confirm_element = document.getElementById("profile-menu__confirm");
    confirm_element.style.display = 'grid';
}

/** hide confirm delete account menu **/
function hideConfirmDel() {
    let del_element = document.getElementById("profile-menu__del");
    del_element.style.display = 'flex';
    let confirm_element = document.getElementById("profile-menu__confirm");
    confirm_element.style.display = 'none';
}

/** nested function for closure on variables */
class searchBarClass {

    constructor(){
        this.searchcounter = -1; // keeps track of current search item
        this.newlist = true; // keeps track if list is new

        this.searchbarEL = document.getElementById("searchbar");

        // catch up, down or enter key on search results
        this.searchbarEL.addEventListener('keydown', event => {this.Keydown(event)});
    
        // catch search logic on any other key
        this.searchbarEL.addEventListener('keyup', event => {this.Keyup(event)});

    }
    /** on search bar keydown run this **/
    Keydown(event) {

        const key = event.key;
        // reset list if not up, down or enter key
        if ((key !== "ArrowUp") && (key !== "ArrowDown") && (key !== "Enter")){
            this.newlist = true;
            return;
        }

        if (this.newlist)
            this.searchcounter = -1 // initialise searchcounter

        const searchlist = document.getElementsByClassName("search-menu__items");
        const listlength = searchlist.length;
        
        if (key === "ArrowUp")
            this.searchcounter = this.updateSearchCounter(this.searchcounter, listlength, "up");

        if (key === "ArrowDown")
            this.searchcounter = this.updateSearchCounter(this.searchcounter, listlength, "down");
        
        if (key === "Enter")
            searchlist[this.searchcounter].click();

        this.setActiveSearch(this.searchcounter);
        
        this.newlist = false; // using the same list until it resets
    };

    /** on search bar keyup run this **/
    Keyup(event) {

        let input = this.searchbarEL.value;
        // dont proceed if there is no new list to generate
        if (!this.newlist) 
            return;

        let html = `<section class="search-menu">`;

        if (input) { // only if there is value
            input = input.toUpperCase();
            let counter = 0;

            for (let stock of stocklist) {
                if (stock[0].startsWith(input)){
                    html += `
                            <a class="search-menu__items" id="search-${counter}"href="/viewstock?q=${stock[0]}" 
                            onmouseover="searchClass.onHoverSearch(${counter})" onclick="linkDisable('search-${counter}')">
                            <div> ${stock[0]} | ${stock[1]} </div></a>`;
                    counter ++;
                    // if we list 6 already then break
                    if (counter > 5)
                        break;
                }
            }
        }
        html += `</section>`
        document.getElementById("searchstatus").innerHTML = html;
    };

    /** on hover, set the new highlight, return new counter **/
    onHoverSearch(argcounter) {
        this.setActiveSearch(argcounter);
        // changing page var
        this.searchcounter = argcounter;
    }

    /**  set color **/
    setActiveSearch(argcounter) {
        let searchlist = document.getElementsByClassName("search-menu__items");
        // reset color on all items
        for (let i = 0; i < searchlist.length; i++)
            searchlist[i].style.backgroundColor="rgb(227, 245, 255)";

        // highlight the selected item
        searchlist[argcounter].style.backgroundColor="rgb(233, 127, 137)";
    }

    /**  updates the search counter on the arrow keys. argdir accepts "up", "down" **/
    updateSearchCounter(argcounter, arglength, argdir) {
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

        return counter;
    }



}


/** class for extracting and handling db data **/
class indexController {
    // methods
    constructor(){
        
        // initialise
        let rawdata = this.getRawDataFromHTML();

        console.log(rawdata);

        this.cash = this.getCashFromRawData(rawdata);
        this.data = this.getDataFromRawData(rawdata);
        this.apierror = this.getRowMissingFromRawData(rawdata);

        this.aboutstart = false;
        if (rawdata[0]['start'] == 'start')
            this.aboutstart = true;

        this.getMarketStatus();

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

    /**  return if there is API error */
    getRowMissingFromRawData(argRawData){
        return argRawData[0]['rowmissing'];
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

    returnMarketStatus(){return this.market_status;}
    returnAboutStart(){return this.aboutstart;}
    returnCash() {return this.cash;}
    returnData() {return this.data;}
    returnAPIError() {return this.apierror;}

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

        if (this.controllerRef.returnAboutStart() == true)
            this.renderAboutStart();
    }

    /** shows about start */
    renderAboutStart(){
        showAboutStart();
    }

    updateAPICorrectness() {
        let el = document.getElementById('index-body__errorhead');
        if (this.controllerRef.returnAPIError() === 'true'){
            el.style.display = 'block';
        }
    }

    // update footer with info
    updateFooter(argcash, argtotalpnl) {
        let doc = document.getElementById("footer-bar__info");
        const green = "rgb(126, 255, 114)";
        const red = "rgb(255, 57, 57)";

        let html = ``;
        if (parseFloat(argtotalpnl) < 0)
            html = `
                        <div class="footer-item__pnltxt" style="color:${red};">unrealised p&l</div>
                        <div class="footer-item__pnl" style="color:${red};"> $${argtotalpnl}&darr;</div>
                    `
        else
            html = `
                        <div class="footer-item__pnltxt" style="color:${green};">unrealised p&l</div>
                        <div class="footer-item__pnl" style="color:${green};"> $${argtotalpnl}&uarr;</div>
                    `

        doc.innerHTML =     `
                            <div class="footer-item">
                            `
                            + html +
                            `
                                <div class="footer-item__cashtxt">total cash available</div>
                                <div class="footer-item__cash">$${argcash}</div>
                            <div>
                            `;
    }

    /** refresh main index page with pulling updated data from server */
    async refreshHoldingsPageV() {
        await this.controllerRef.updateRawData();
        this.refreshHoldingsPage()
    }

    /** displays the market status based on this.controllerRef.returnMarketStatus() */
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

        let el = document.getElementById("holdings__market");
        el.innerHTML = market_status;
        el.style.color = color;        
    }


    /** disables index body for 1 sec */
    disableSelf(param_id) {
        let el = document.getElementById(param_id);
        el.style.pointerEvents="none";

        setTimeout(()=>{el.style.pointerEvents="auto";}, 1000);
    }

    /** main index page renderer */
    refreshHoldingsPage() {
        let html = ``;
        let dataobj = this.controllerRef.returnData();

        let totalpnl = 0;
        let equity = 0;

        const green = "rgb(15, 175, 0)";
        const red = "rgb(255, 57, 57)";

        if (dataobj.length > 0)
            html += `
                    <div class="holding-item holding-item--header">
                        <div class="hitem__headeach hitem__each--symbtext">symbol</div>
                        <div class="hitem__headeach hitem__each--pricetext">price/qty</div>
                        <div class="hitem__headeach hitem__each--dchangetext">1D % change</div>
                        <div class="hitem__headeach hitem__each--valuetext">value</div>
                        <div class="hitem__headeach hitem__each--pnltext">unrealised P&L</div>
                    </div>
                    `;

        for (let i = 0; i < dataobj.length; i++){
            let symb = dataobj[i]['symb'];
            let currprice = parseFloat(dataobj[i]['currprice']).toFixed(2);
            let quantity = dataobj[i]['quantity'];
            let avgcost = dataobj[i]['avgcost'];
            let prevclose = dataobj[i]['prevclose'];
            let dailypnl = ((currprice - prevclose)/prevclose * 100).toFixed(2);

            let marketvalue = (currprice*quantity).toFixed(2);
            let totalcost = (avgcost*quantity).toFixed(2);
            let pnl = (marketvalue - totalcost).toFixed(2);

            totalpnl += parseFloat(pnl);
            equity += parseFloat(marketvalue);

            let dpnlhtml = ``;
            let pnlhtml = ``;

            if (parseFloat(dailypnl) < 0)
                dpnlhtml = `<data style="color:${red}">(${dailypnl}&#37) &darr;</data>`
            else
                dpnlhtml = `<data style="color:${green}">(${dailypnl}&#37) &uarr;</data>`

            if (parseFloat(pnl) < 0)
                pnlhtml = `<data style="color:${red}">$${pnl}&darr;</data>`
            else
                pnlhtml = `<data style="color:${green}">$${pnl}&uarr;</data>`
    
            html += `
                    <a href="/viewstock?q=${symb}" id="id-${symb}" onclick="linkDisable('id-${symb}')">
                        <div class="holding-item">
                            <div class="hitem__each hitem__each--symb"><data>${symb}</data></div>
                            <div class="hitem__each hitem__each--cp"><data>$${currprice}</data></div>
                            <div class="hitem__each hitem__each--quantity"><data>${quantity}</data></div>
                            <div class="hitem__each hitem__each--dailypnl">
                    `
                    +
                    dpnlhtml
                    +
                    `
                            </div>
                            <div class="hitem__each hitem__each--value"><data class="hitem__data">$${marketvalue}</data></div>
                            <div class="hitem__each hitem__each--pnl">
                    `
                    +
                    pnlhtml
                    +
                    `       </div>
                        </div>
                    </a>    
                    `;
        }

        // handling the summary box
        let htmlsummary = ``;
        const cash = this.controllerRef.returnCash();
        //equity += parseFloat(cash);
        let totalvalue = parseFloat(cash) + equity;

        htmlsummary += `
            <div class="summary-item">
                <div class="sitem__each sitem__each--returntext">Unrealised Returns</div>
                <div class="sitem__each sitem__each--returnunit">$</div>
                <div class="sitem__each sitem__each--return">${totalpnl.toFixed(2)}</div>

                <div class="sitem__each sitem__each--cashtext">Cash Available</div>
                <div class="sitem__each sitem__each--cashunit">$</div>
                <div class="sitem__each sitem__each--cash">${cash}</div>

                <div class="sitem__each sitem__each--equitytext">Equity</div>
                <div class="sitem__each sitem__each--equityunit">$</div>
                <div class="sitem__each sitem__each--equity">${equity.toFixed(2)}</div>

                <div class="sitem__each sitem__each--valuetext">Total Value</div>
                <div class="sitem__each sitem__each--valueunit">$</div>
                <div class="sitem__each sitem__each--value">${totalvalue.toFixed(2)}</div>

            </div>
        `;

        document.getElementById("index-body__grid-insert").innerHTML = html;
        document.getElementById("index-body__summary-insert").innerHTML = htmlsummary;

    }

    /** timed refresh for holdings page */
    timedRefresh(){
        if (controller.returnMarketStatus() == 'open')
        {
            // refresh page every 8 secs
            let interval = 3000;
            let count = 0;
            const indexpageinterval = setInterval(()=>{

                this.refreshHoldingsPageV();
                // after 30s, increase interval to 6 secs
                if (count == 30){
                    clearInterval(indexpageinterval);
                }
                count++;
                }, interval);
        }
    }

}

