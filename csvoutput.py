from csv import reader

f = open("./stock_info.js", 'a')

with open("./static/stock_info_070624.csv", 'r') as data:
    for line in reader(data):
        f.write(str('["'+line[0]+'", "'+line[1]+'"]'))
        f.write(", \n")
f.close()


    