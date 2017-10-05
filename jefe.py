#!/usr/bin/env python3

from flask import Flask, render_template, request, redirect, url_for
import json
import logging
import sqlite3
import urllib

server_address = "https://betaupdate.libremesh.org"

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
    distros = json.loads(urllib.request.urlopen(server_address + "/api/distros").read().decode('utf-8'))
    network_profiles = json.loads(urllib.request.urlopen(server_address + "/api/network_profiles").read().decode('utf-8'))
    return render_template("image_request.html", distros=distros, network_profiles=network_profiles)

@app.route("/image_request", methods=["POST"])
def image_request():
    if request.method == "POST":
        return request.form["release"]
    return "kk"


db = Database()
app.run(host="0.0.0.0", port=5001, )

