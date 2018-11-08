import csv
import pandas

titles = ["Country", "Region", "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)" , "GDP ($ per capita) dollars"]
def read():
    with open('input.csv') as csvfile:

        # read the csv
        dictreader = csv.DictReader(csvfile, restval='nodata')
        dictionary = []

        # save the csv to dict
        for row in dictreader:
            newdict = {}
            for key in row:
                if key in titles:
                    try:
                        newdict[key] = float(row[key])
                    except:
                        newdict[key] = row[key].strip(' ')
            dictionary.append(newdict)

        # return the dict
        return dictionary

def clean(dicts):
    for dict in dicts:
        for key in dict:
            if dict[key] == '' or dict[key] == 'unknown':
                dict[key] = 'nodata'
    return dicts

if __name__ == '__main__':
    dicts = read()
    dicts = clean(dicts)
    pandadict = pandas.DataFrame(dicts)
    print(pandadict)
    print(pandadict.to_string())
