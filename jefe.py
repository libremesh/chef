#!/usr/bin/env python3

from flask import Flask, render_template, request
import json
import urllib

server_address = "https://betaupdate.libremesh.org"

app = Flask(__name__)

@app.route("/")
def root():
    distros = json.loads(urllib.request.urlopen(server_address + "/api/distros").read().decode('utf-8'))
    network_profiles = json.loads(urllib.request.urlopen(server_address + "/api/network_profiles").read().decode('utf-8'))
    return render_template("image_request.html", distros=distros, network_profiles=network_profiles)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, )

