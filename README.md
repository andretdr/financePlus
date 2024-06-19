# Introduction

Finance plus is a personal full stack project created by me, Andre Tong.  
It is inspired by and based on the CS050 assignment Finance, albeit plused up in its features.  

It gets and calculates real time market data from Yahoo's free API via yfinance.  
It features real-time rendered ticker graph history  
The app allows you to buy and sell shares with virtual money, based on real information pulled real time.  
Please feel free to ping me if you ever want to try it out!

[Primer Video](https://youtu.be/QBfx-Er88Kk)

# Development
The app is developed using Flask/Python/Jinja2, HTML, CSS, JS.

CSS is organised in the BEM methodology.
JS files are compressed using google closure compiler.
App optimizations are done using google lighthouse.

It runs on Pylons/Waitress WSGI server and is currently deployed on Heroku using JawsDB for its MYSQL database.

# MVC Design Pattern
- The app is designed based on the MVC design pattern. The back-end python and MYSQL processes correspond to the MODEL, this is where the data is stored.
In the front-end I implement CONTROLLER Classes which are incharge of getting and processing data from the MODEL and storing the state of the page.
I also implement VIEW Classes which are solely responsible for updating the interface of the page, based on the state and processed data from the CONTROLLER Classes.

# Full feature list

## Connections
- MYSQL is used as the back-end database, connecting to it via [python mysql connector](https://pypi.org/project/mysql-connector-python/)
- Connection pooling is used for more efficient connecting to the database

## Login and Registry page
- All forms here feature client side and server side validation.
- Regex is used for client side and server side checks.
- Usernames are checked using regex to be alpha numeric ONLY.
- Passwords are checked for a minimum length of 8 and can be anykey.
- Confirmation passwords are checked to match the password.
- All passwords are hashed using werkzeug.security before storing.

## Search Bar
- Search bar features dynamic results from reading directly from a list of symbols.
- Symbol CSV is gotten from online [source](https://stockanalysis.com/stocks/) and outputted into a list of dictionaries as a JS object. It is then fed directly into the app.
- Search results are outputted on a list of max length 6
- Items are highlighted when mouse over, and keyboard up and down arrows can be used to select the items as well

## Index Page
- At the back end, stock data is pulled from Yahoo's free API using [yfinance](https://pypi.org/project/yfinance/) python library.
- Holdings data (Stock bought, quantity, average cost) is pulled from MYSQL database.
- Processing the API data and MYSQL database is alittle slow and the process is sped up using python multi-threading.
- When the market is open, at EDT 0930 to 1600 or SGT 2100 to 0400, the app refreshes every 3 secs pulling in real-time stock data.

## View Stock Page
- At the back end, the specific Stock Symbol data is pulled from Yahoo's free API using [yfinance](https://pypi.org/project/yfinance/) python library.
- Holdings data (Stock bought, quantity, average cost) is pulled from MYSQL database.
- #### Real-time stock graphs are rendered using [chart.js](https://www.chartjs.org/), for each of the 1day, 1week, 1month, 3months and 1year buttons.
- As the app is drawing the Stock graph real-time in the view stock page, it requires alot of data from the API. It gets from the API the close data for each of 1 day,
1 week, 1 month, 3 months and 1 year. It also get close information for every 5mins for the current day, for every hour for the pass 1 week, for every 1 day for the pass 1 month,
for every 1 day for the pass 3 months, and for every 1 week for the pass 1 year.
- This processing takes about 500-700ms, so the app uses python multi-threading to bring the average time down to about 200ms.
- The app keeps the data all on the same page so the page does not need to refresh with each different graph range selected.
- If the Symbol searched is not found, the error page is loaded, showing an error message.
- When the market is open, at EDT 0930 to 1600 or SGT 2100 to 0400, the app refreshes every 3 secs updating the graph and the holdings data.

## Real-Time ticker graphs


## Buy Sell Page
- All forms here feature client side and server side validation.
- The app give the option to Buy new or existing stock, or Sell existing stock.
- Inputs here are event-listened for their value and checked/validated against current stock holdings. If Buying, the app checks that there is enough money left to buy the stock.
If Selling, the app checks if there is enough stock left to sell. The app also checks against Buying or Selling 0 Stock. If all goes well, the transaction takes place.
- On succesful transaction, the MYSQL database in the back-end is updated with the new information.

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
