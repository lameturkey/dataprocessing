import csv
import pandas
import matplotlib.pyplot as plt

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
                    newdict[key.split(' ')[0].strip('.')] = dict[key].strip()
            dictionarylist.append(newdict)
        # return the dict
        return dictionarylist

def clean(dicts):
    dicts = [dict for dict in dicts if not ('' in dict.values()  or 'unknown' in dict.values())]
    for dict in dicts:
        for key in dict:
            if key == "GDP":
                dict[key] = int(dict[key].split(' ')[0])
            elif key == 'Infant' or key ==  'Pop':
                dict[key] = float(dict[key].replace(',','.'))
    return dicts

if __name__ == '__main__':
    dicts = read()
    dicts = clean(dicts)
    pandadict = pandas.DataFrame(dicts)
    # http://www.datasciencemadesimple.com/mean-function-python-pandas-dataframe-row-column-wise-mean/
    print(pandadict.GDP.mean())
    print(pandadict.GDP.median())
    print(pandadict.GDP.std())
    #https://stackoverflow.com/questions/23199796/detect-and-exclude-outliers-in-pandas-dataframe
    pandadict[abs(pandadict.GDP - pandadict.GDP.mean()) < 2 * pandadict.GDP.std()].to_string()
    print(pandadict.to_string())
    plt.figure()
    plt.grid(True)
    histogram = pandadict.hist(column='GDP')
    print(histogram)
    #https://stackoverflow.com/questions/34347145/pandas-plot-doesnt-show
    boxplot = pandadict.boxplot(column='Infant').plot()
    plt.show()
