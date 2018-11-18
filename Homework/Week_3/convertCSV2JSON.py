import csv
import json

def reader(filename):
    athletes = []
    values = ['Team', 'Medal', 'Year']
    with open(filename, 'r') as csvfile:
        dict = csv.DictReader(csvfile)
        for athlete in dict:
            newathlete = {}
            for value in athlete:
                if value in values:
                    newathlete[value] = athlete[value]
            athletes.append(newathlete)
        print(athletes[0])
    return athletes

def savejson(dictionaries):
    with open('output.json', 'w+') as jsonfile:
        for dictionary in dictionaries:
            json.dump(dictionary, jsonfile, indent=4)

def clean(dicts):
    dicts = [dict for dict in dicts if not 'NA' in dict.values()]
    return dicts

if __name__ == '__main__':
    athletes = reader('athlete_events.csv')
    cleaned = clean(athletes)
    savejson(cleaned)