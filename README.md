# Introduction

Finance plus is a personal full stack project created by me, Andre Tong.  
It gets and calculates real time market data from Yahoo's free API via yfinance.  
The app allows you to buy and sell shares with virtual money, based on real information pulled real time.  

There's an intro video and a link to the app below.

[Intro Video](https://youtu.be/QBfx-Er88Kk)

[Finance Plus](https://financeplus-cfec3ff5d154.herokuapp.com/landing)

# Development
The app is developed using Flask/Python/Jinja2, HTML, CSS, JS, MySQL.

CSS is organised in the BEM methodology.
JS files are compressed using google closure compiler.
App optimizations are done using google lighthouse.

It runs on Pylons/Waitress WSGI server and is currently deployed on Heroku using JawsDB for its MYSQL database.

# Full feature list

## Login and Registry page

![image](https://github.com/andretdr/financePlus/assets/162653875/d5416b33-e863-492a-8037-0b265fcd405a)

<img src="https://github.com/andretdr/financePlus/assets/162653875/d5416b33-e863-492a-8037-0b265fcd405a" alt="drawing" width="500"/>

- All forms here feature client side and server side validation.
- Regex is used for client side and server side checks.
- Usernames are checked using regex to be alpha numeric ONLY.
- Passwords are checked for a minimum length of 8 and can be anykey.
- Confirmation passwords are checked to match the password.
- All passwords are hashed using werkzeug.security before storing.

## Search Bar

![image](https://github.com/andretdr/financePlus/assets/162653875/b7a8fd91-b5cb-4e9c-bff5-f139ec509ad6)

- Search bar features dynamic results from reading directly from a list of symbols.
- Symbol CSV is gotten from online [source](https://stockanalysis.com/stocks/) and outputted into a list of dictionaries as a JS object. It is then fed directly into the app.
- Search results are outputted on a list of max length 6
- Items are highlighted when mouse over, and keyboard up and down arrows can be used to select the items as well

## Index Page

![image](https://github.com/andretdr/financePlus/assets/162653875/e9ae2092-c02f-42c2-a859-d7dd5330a043)

- At the back end, stock data is pulled from Yahoo's free API using [yfinance](https://pypi.org/project/yfinance/) python library.
- Holdings data (Stock bought, quantity, average cost) is pulled from MYSQL database.
- Processing the API data and MYSQL database is alittle slow and the process is sped up using python multi-threading.
- When the market is open, at EDT 0930 to 1600 or SGT 2100 to 0400, the app refreshes every 3 secs pulling in real-time stock data.

## View Stock Page

![image](https://github.com/andretdr/financePlus/assets/162653875/cc1e1644-433b-4d49-8074-856ae5e888a3)

- At the back end, the specific Stock Symbol data is pulled from Yahoo's free API using [yfinance](https://pypi.org/project/yfinance/) python library.
- Holdings data (Stock bought, quantity, average cost) is pulled from MYSQL database.
- As the app is drawing the Stock graph real-time in the view stock page, it requires alot of data from the API. Itg ets from the API the close data for each of 1 day,
1 week, 1 month, 3 months and 1 year. It also get close information for every 5mins for the current day, for every hour for the pass 1 week, for every 1 day for the pass 1 month,
for every 1 day for the pass 3 months, and for every 1 week for the pass 1 year.
- This processing takes about 500-700ms, so I implement python multi-threading to bring the average time down to about 200ms.
- At the front-end the stock history graph is drawn real-time with js.chart using the stock data for each of the 1day, 1week, 1month, 3months and 1year buttons.
- The app keeps the data all on the same page so the page does not need to refresh with each different graph range selected.
- If the Symbol searched is not found, the error page is loaded, showing an error message.
- When the market is open, at EDT 0930 to 1600 or SGT 2100 to 0400, the app refreshes every 3 secs updating the graph and the holdings data.

## Buy Sell Page

![image](https://github.com/andretdr/financePlus/assets/162653875/e95f15f3-ec36-46e3-b99a-daac4209bc58)

- All forms here feature client side and server side validation.
- The app give the option to Buy new or existing stock, or Sell existing stock.
- Inputs here are event-listened for their value and checked/validated against current stock holdings. If Buying, the app checks that there is enough money left to buy the stock.
If Selling, the app checks if there is enough stock left to sell. The app also checks against Buying or Selling 0 Stock. If all goes well, the transaction takes place.
- On succesful transaction, the MYSQL database in the back-end is updated with the new information.

# MVC Design Pattern
- The app is designed based on the MVC design pattern. The back-end python and MYSQL processes correspond to the MODEL, this is where the data is stored.
In the front-end I implement CONTROLLER Classes which are incharge of getting and processing data from the MODEL and storing the state of the page.
I also implement VIEW Classes which are solely responsible for updating the interface of the page, based on the state and processed data from the CONTROLLER Classes.

# Calculations
The app uses the following data and calculations to display its data
- Current Price = current price of Stock ticker
- Quantity = number of Stocks of current ticker that user has in his holdings
- Previous Close = previous day close price for current ticker
- Average Cost = average cost of all the Stocks of a particular ticker bought. It is calculated using (Total Cost of all particular ticker bought) / (Total quantity of all particular ticker bought)
- Daily Profit and Loss % = (Current Price - Previous Close)/Previous Close * 100 %
- Market Value = the total current value of a particular ticker in user's holding. It is calculated using (Current Price * Quantity)
- Total Cost = the total cost of buying a particular ticker in the user's holding. It is calculated using (Average Cost * Quantity)
- Unrealised Profit and Loss = (Market Value - Total Cost)
- Total Unrealised Profit and Loss = Sum of all Unrealised Profit and Loss for all the tickers in the holding
- Equity = Sum of all Market Value for all the tickers in the holding
- Cash = How much liquid Cash the user has in his account
- Total Value = Cash + Equity

# Known Bugs
- Yahoo Finance API appears to drop data once in awhile. For now I am simply flagging a warning when this is detected. [source1](https://stackoverflow.com/questions/40111621/yahoo-finance-api-missing-data-for-certain-days) [source2](https://www.reddit.com/r/algotrading/comments/wzimgy/anyone_else_seeing_massive_chunks_of_data_missing/)
- Index Page displays a warning when stock data is missing
- View Stock Page displays a warning when stock data is missing

# What can be improved?
- There is alot of wasted connections to the DB for extracting information on the timed refreshes. Data storage and retrival can be designed better, what to store, what data doesn't need to be updated, and what does.
