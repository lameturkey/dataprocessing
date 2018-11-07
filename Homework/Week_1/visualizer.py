#!/usr/bin/env python
# Name: Koen van der Kamp
# Student number: 12466573
# Graph should be fullscreen for optimal readability
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

titles = ['Title', 'Rating', 'Year', 'Actors', 'Runtime']

# Read csv file
def load_csv(filename):
    with open(filename) as csvfile:

        # make a dictreader
        reader = csv.DictReader(csvfile)

        # for every movie append to the global dict (ie: {2018: 8.3})
        for row in reader:
            data_dict[row['Year']].append(float(row['Rating']))
        return

if __name__ == "__main__":
    # loads the .csv
    load_csv(INPUT_CSV)

    # loads a line(sub)plot (year vs average score)
    plt.subplot(1, 2, 1)
    plt.plot([key for key in data_dict],
             [sum(data_dict[key]) / len(data_dict[key]) for key in data_dict])
    plt.title("Imdb top 50 average rating per year")
    plt.xlabel("year")
    plt.ylabel("average score")

    # Loads a pie chart (composition of the imdb top50)
    plt.subplot(1, 2, 2)
    plt.title("Composition of the Imdb top 50 by release year")
    plt.pie([len(data_dict[key]) for key in data_dict], labels=[key for key in data_dict])
    plt.show()
