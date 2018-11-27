import csv
import json

def reader(filename):
    athletes = []

    #isolate the values i want to use
    values = ['NOC', 'Medal', 'Event']
    with open(filename, 'r') as csvfile:

        # read the file
        dict = csv.DictReader(csvfile)

        noclist = []
        # Produce a list of dictionaries with a dictionary for every athlete (easier to handle for me)
        for athlete in dict:
            if athlete['NOC'] not in noclist:
                noclist.append(athlete['NOC'])
            newathlete = {}
            for value in athlete:
                if value in values:
                    newathlete[value] = athlete[value]
            athletes.append(newathlete)
    # return this list
    return athletes

def clean(dicts):
    nocdic = {}
    # remove all athletes who did not win any medals
    dicts = [dict for dict in dicts if not 'NA' in dict.values()]

    # remove all duplicate events (one event can have multiple athletes)
    dicts = [dict(touple) for touple in set(tuple(dict.items()) for dict in dicts)]

    # figure out the most gold awarded countries (15 of them)
    for dictionary in dicts:
        try:
            nocdic[dictionary['NOC']] += 1
        except:
            nocdic[dictionary['NOC']] = 1
    noclist = []

    searchdic = nocdic.copy()
    for i in range(15):
        test = max(searchdic, key=nocdic.get)
        noclist.append(test)
        searchdic.pop(test)

    dicts = {}
    # removce all countries not in top 10
    for value in nocdic:
        if value in noclist:
            dicts[value] = nocdic[value]
    print(dicts)
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
