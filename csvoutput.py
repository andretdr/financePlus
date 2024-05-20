from csv import reader

f = open("./stock_info.js", 'a')

with open("./static/stock_info.csv", 'r') as data:
    for line in reader(data):
        f.write(str(line))
        f.write(", \n")
f.close()


    