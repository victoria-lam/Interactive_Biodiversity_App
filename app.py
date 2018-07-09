# dependencies
import os

import pandas as pd
import numpy as np

# Python SQL toolkit and Object Relational Mapper
import sqlalchemy
from sqlalchemy.orm import Session
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine, func

from flask import Flask, render_template, jsonify

# ************************************************
# Flask Setup
# ************************************************
app = Flask(__name__)

# create engine connection to sqlite database
db = os.path.join("db", "belly_button_biodiversity.sqlite")
engine = create_engine(f"sqlite:///{db}")

# reflect database into ORM class
Base = automap_base()
Base.prepare(engine, reflect=True)
# Base.classes.keys()

# save references to table
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

# create a session - link from Python to database
session = Session(engine)


# ************************************************
# create route that renders index.html template
# ************************************************
@app.route("/")
def home():
    return render_template("index.html")


# ************************************************
# create route that returns list of sample names
# ************************************************
@app.route("/names")
def names():
    # create empty list
    sample_names = []

    results = session.query(Samples_metadata.SAMPLEID).all()

    # loop and append ids
    for result in results:
        sample_names.append("BB_" + str(result[0]))

    print("sample name")
    print(sample_names)
    return jsonify(sample_names)


# ***************************************************
# create route that returns list of otu descriptions
# ***************************************************
@app.route("/otu")
def otu():
    results = session.query(Otu.lowest_taxonomic_unit_found).all()
    otu_list = list(np.ravel(results))

    # print("result")
    # print(results)
    return jsonify(otu_list)


# ***************************************************
# create route that returns metadate for given sample
# ***************************************************
@app.route("/metadata/<sample>")
def metadataSample(sample):
    # slice sample to only get number
    sample_number = int(sample[3:])
    metadata_results = session.query(Samples_metadata) \
        .filter(Samples_metadata.SAMPLEID == sample_number).all()

    data_list = []
    for metadata in metadata_results:
        # create dict for all queried objects
        sample_data = {
            "AGE": metadata.AGE,
            "BBTYPE": metadata.BBTYPE,
            "ETHNICITY": metadata.ETHNICITY,
            "GENDER": metadata.GENDER,
            "LOCATION": metadata.LOCATION,
            "SAMPLEID": metadata.SAMPLEID,
        }

        data_list.append(sample_data)

    for data in data_list:
        # only return metadata if sample id number matches queried id
        if data["SAMPLEID"] == sample_number:
            return jsonify(data)


# ***************************************************
# create route that returns weekly washing frequency
# ***************************************************
@app.route("/wfreq/<sample>")
def wfreq(sample):
    # slice sample to only get number
    sample_number = int(sample[3:])
    wfreq_results = session.query(Samples_metadata.WFREQ) \
        .filter(Samples_metadata.SAMPLEID == sample_number).all()
    wfreq = np.ravel(wfreq_results)

    # return only number value
    return jsonify(int(wfreq[0]))


# #**********************************************************************
# #create route that returns OTU IDs and Sample Values for a given sample
# #**********************************************************************
@app.route("/samples/<sample>")
def samples(sample):
    sample_results = session.query(Samples).statement
    df = pd.read_sql_query(sample_results, session.bind)

    # return only values greater than 1
    df = df[df[sample] > 1]

    # sort values of samples by descending order
    df = df.sort_values(by=sample, ascending=False)

    # format data
    otu_sample_values = [{
        "otu_ids": df[sample].index.values.tolist(),
        "sample_values": df[sample].values.tolist()
    }]

    return jsonify(otu_sample_values)


if __name__ == "__main__":
    app.run(debug=True)
