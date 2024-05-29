
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


/** nested function for closure on variables */
function searchbarEvents(){
    let searchcounter = -1; // keeps track of current search item
    let newlist = true; // keeps track if list is new

    /** on search bar keydown run this **/
    function Keydown(event) {

        const key = event.key;
        // reset list if not up, down or enter key
        if ((key !== "ArrowUp") && (key !== "ArrowDown") && (key !== "Enter")){
            newlist = true;
            return;
        }

        if (newlist)
            searchcounter = -1 // initialise searchcounter

        const searchlist = document.getElementsByClassName("search-menu__items");
        const listlength = searchlist.length;
        
        if (key === "ArrowUp")
            searchcounter = updateSearchCounter(searchcounter, listlength, "up");

        if (key === "ArrowDown")
            searchcounter = updateSearchCounter(searchcounter, listlength, "down");
        
        if (key === "Enter")
            searchlist[searchcounter].click();

        setActiveSearch(searchcounter);
        
        newlist = false; // using the same list until it resets
    };

    /** on search bar keyup run this **/
    function Keyup(event) {

        let input = searchbar.value;
        // dont proceed if there is no new list to generate
        if (!newlist) 
            return;

        let html = `<section class="search-menu">`;

        if (input) { // only if there is value
            input = input.toUpperCase();
            let counter = 0;

            for (let stock of stocklist) {
                if (stock[0].startsWith(input)){
                    html += `
                            <a class="search-menu__items" href="/viewstock?q=${stock[0]}" 
                            onmouseover="onHoverSearch(${counter})">
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

    return {Keyup, Keydown}
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
        console.log(this.data);
    }
    
}


/** class for updating page **/
class indexView {
    // methods
    constructor(argController){
        // initialise
        this.controllerRef = argController;

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

    refreshHoldingsPage() {
        let html = ``;
        let dataobj = this.controllerRef.returnData();

        let totalpnl = 0;

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

            totalpnl += parseFloat(pnl);

            let dpnlhtml = ``;
            let pnlhtml = ``;

            const green = "rgb(15, 175, 0)";
            const red = "rgb(255, 57, 57)";

            if (parseFloat(dailypnl) < 0)
                dpnlhtml = `<data style="color:${red}">(${dailypnl}&#37) &darr;</data>`
            else
                dpnlhtml = `<data style="color:${green}">(${dailypnl}&#37) &uarr;</data>`

            if (parseFloat(pnl) < 0)
                pnlhtml = `<data style="color:${red}">$${pnl}&darr;</data>`
            else
                pnlhtml = `<data style="color:${green}">$${pnl}&uarr;</data>`
    
            html += `
                    <a href="/viewstock?q=${symb}">
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
                    `
                        
        }
        document.getElementById("index-body__grid-insert").innerHTML = html;

        this.updateFooter(this.controllerRef.returnCash(), totalpnl.toFixed(2));
    }
}