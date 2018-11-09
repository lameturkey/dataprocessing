import csv
import pandas

titles = ["Country", "Region", "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)" , "GDP ($ per capita) dollars"]
def read():
    with open('input.csv') as csvfile:

        # read the csv
        dictreader = csv.DictReader(csvfile)
        dictionarylist = []

        # save the csv to dict
        for dict in dictreader:
            newdict = {}
            for key in dict:
                if key in titles:
                    newdict[key] = dict[key].strip()
            dictionarylist.append(newdict)
        # return the dict
        return dictionarylist

def clean(dicts):
    dicts = [dict for dict in dicts if not ('' in dict.values()  or 'unknown' in dict.values())]
    for dict in dicts:
        for key in dict:
            if key == "GDP ($ per capita) dollars":
                dict[key] = dict[key].split(' ')[0]
    return dicts

if __name__ == '__main__':
    dicts = read()
    dicts = clean(dicts)
    pandadict = pandas.DataFrame(dicts)
    print(pandadict.to_string())
