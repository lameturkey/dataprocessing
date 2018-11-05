#!/usr/bin/env python
# Name:
# Student number:
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

# Read csv files
def load_csv(filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data_dict[row['Year']].append(float(row['Rating']))
        return

if __name__ == "__main__":
    load_csv(INPUT_CSV)
    plt.subplot(1, 2, 1)
    plt.plot([key for key in data_dict],
             [sum(data_dict[key]) / len(data_dict[key]) for key in data_dict])
    plt.title("Imdb top 50 average rating per year")
    plt.xlabel("year")
    plt.ylabel("average score")

    plt.subplot(1, 2, 2)
    plt.title("Composition of the Imdb top 50 by release year")
    plt.pie([len(data_dict[key]) for key in data_dict], labels=[key for key in data_dict])
    plt.show()
