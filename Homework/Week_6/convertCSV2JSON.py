import csv
import json

def reader(filename):
    dicts = []

    #isolate the values i want to use
    keys = ["Type 1","Type 2",  "Total", "HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed", "Generation"]
    with open(filename, 'r') as csvfile:

        # read the file
        dict = csv.DictReader(csvfile)

        properties = []
        # Produce a list of dictionaries with a dictionary for every item
        for item in dict:
            newitem = {}
            for key in item:
                if key in keys:
                    if item[key] != '':
                        newitem[key.replace(' ', '').replace(".", "")] = item[key]
            dicts.append(newitem)
    # return this list
    return dicts

def clean(dicts):

    return dicts

def savejson(dictionaries):
    with open('output.json', 'w+') as jsonfile:
        json.dump(dictionaries, jsonfile, indent=4)

if __name__ == '__main__':

    # parse/load data
    athletes = reader('Pokemon.csv')

    # clean data
    cleaned = clean(athletes)

    # save data
    savejson(cleaned)
