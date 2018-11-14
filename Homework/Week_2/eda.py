import csv
import pandas
import matplotlib.pyplot as plt
import json

def read():
    with open('input.csv') as csvfile:
        titles = ["Country", "Region", "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)" , "GDP ($ per capita) dollars"]
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

def save_json(pandadict):
    with open('output.json', 'w+') as json_file:
        json.dump(pandadict.to_dict(orient='index'), json_file,  indent=4)

if __name__ == '__main__':
    # read the data
    dicts = read()

    # process the data
    dicts = clean(dicts)

    # convert to pandaframe
    pandadict = pandas.DataFrame(dicts, [dict["Country"] for dict in dicts])
    pandadict = pandadict.drop("Country", axis=1)

    #remove all values more than 2 stdev away from the mean
    # https://stackoverflow.com/questions/23199796/detect-and-exclude-outliers-in-pandas-dataframe
    pandadict = pandadict[abs(pandadict.GDP - pandadict.GDP.mean()) < 2 * pandadict.GDP.std()]

    # http://www.datasciencemadesimple.com/mean-function-python-pandas-dataframe-row-column-wise-mean/
    # print the central tendency
    print("GDP per capita")
    print(f"Mean: {int(pandadict.GDP.mean())}")
    print(f"Median: {int(pandadict.GDP.median())}")
    print(f"Standard deviation  {int(pandadict.GDP.std())}")

    # print 5 number summary
    print("The 5 number summary of Infant mortality (per 1000 births) per country")
    print(f"Minimum: {pandadict.Infant.min()}")
    print(f"First Quartile: {pandadict.Infant.quantile(0.25)}")
    print(f"Median: {pandadict.Infant.median()}")
    print(f"Third Quartile: {pandadict.Infant.quantile(0.75)}")
    print(f"Maximum: {pandadict.Infant.max()}")

    #produce a histogram for the GDP
    plt.title("GDP per capita with different countries histogram")
    histogram = pandadict.GDP.hist(bins=20).plot()
    plt.show()
    plt.title("Infant mortality rates boxplot")

    # produce a boxplot
    boxplot = pandadict.boxplot(column='Infant', grid=False)
    boxplot.axes.set_xticks([], minor=False)
    boxplot.plot()
    plt.show()
    save_json(pandadict)
