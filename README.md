# Introduction

Finance plus is a personal full stack project created by me, Andre Tong.

It gets and calculates real time market data from Yahoo's free API via yfinance.  
The app allows you to buy and sell shares with virtual money, based on real information pulled real time.  

Please feel free to ping me if you ever want to try it out!

## Full feature list

- All forms on the site feature client side and server side validation.  
- All passwords are hashed before storing.  

- Search bar features dynamic results from reading directly from a list of symbols.  

- Stock data is pulled from Yahoo's free API using [yfinance](https://pypi.org/project/yfinance/) python library.  
- Stock holdings data bought or sold is stored and pulled from the MYSQL database.  
- When the market is open, at EDT 0930 to 1600 or SGT 2100 to 0400, the app refreshes every 3 secs pulling in real-time stock data.  
- Stock history graph is drawn real-time with js.chart using the stock data for each of the 1day, 1week, 1month, 3months and 1year buttons.  

- Python multithreading is used to optimise some of the backend processing.

## Design and development
The app is developed using Flask/Python/Jinja2, HTML, CSS, JS.  

It is designed based on the MVC design pattern. It abstracts server side Python and MySQL to the Model, and on the client side uses JS classes which handle updating view content and controller logic separately.  

CSS is organised in the BEM methodology.  
JS files are compressed using google closure compiler.  
App optimizations are done using google lighthouse.  

It runs on Pylons/Waitress WSGI server and is currently deployed on Heroku using JawsDB for its MYSQL database.  
