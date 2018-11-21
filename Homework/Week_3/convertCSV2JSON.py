import csv
import json

def reader(filename):
    athletes = []
    values = ['NOC', 'Medal', 'Year', 'Event']
    with open(filename, 'r') as csvfile:

        # read the file
        dict = csv.DictReader(csvfile)

        # Produce a list of dictionaries with a dictionary for every athlete (easier to handle for me)
        for athlete in dict:
            newathlete = {}
            for value in athlete:
                if value in values:
                    newathlete[value] = athlete[value]
            athletes.append(newathlete)
        print(athletes[0])

    # return this list
    return athletes

def clean(dicts):
    # remove all athletes who did not win any medals
    dicts = [dict for dict in dicts if not 'NA' in dict.values()]

    # remove all duplicate events (one event can have multiple athletes)
    dicts = [dict(touple) for touple in set(tuple(dict.items()) for dict in dicts)]
    return dicts

def savejson(dictionaries):
    with open('output.json', 'w+') as jsonfile:
        json.dump(dictionaries, jsonfile, indent=4)

if __name__ == '__main__':

    # parse/load data
    athletes = reader('athlete_events.csv')

    # clean data
    cleaned = clean(athletes)

    # save data
    savejson(cleaned)
