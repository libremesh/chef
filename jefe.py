#!/usr/bin/env python3

from flask import Flask, render_template, request, redirect, url_for
import json
import logging
import sqlite3

app = Flask(__name__)

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class Database():
    def __init__(self):
        conn = sqlite3.connect("devices.db")
        self.c = conn.cursor()

    def search_device(self, string):
        sql = "select * from devices where brand like ? or model like ? or versions like ?"
        search_string = '%'+string+'%'
        return self.c.execute(sql, (search_string, search_string, search_string)).fetchall()

@app.route("/")
def root():
    return render_template("index.html.j2")


@app.route("/search")
def search():
    string = request.args.get('device', '')
    devices = db.search_device(string)
    return render_template("devices.j2", devices=devices)


db = Database()
app.run(host="0.0.0.0")

