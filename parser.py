from bs4 import BeautifulSoup
import urllib
import sqlite3

url_root = "https://lede-project.org"

def insert_device(brand, model, versions, current, target, subtarget):
    sql = "insert or replace into devices (brand, model, versions, current, target, subtarget) values (?,?,?,?,?,?)"
    c.execute(sql, (brand, model, versions, current, target, subtarget))

conn = sqlite3.connect("devices.db")
c = conn.cursor()

toh_website = urllib.request.urlopen(url_root + "/toh").read().decode('utf-8')
soup = BeautifulSoup(toh_website, 'html.parser')
tables = soup.find_all('table')


for table in tables:
    if "inline" in table.get('class'):
        for device in table.find_all('tr'):
            cols = device.find_all('td')
            _, brand, model, versions, current = [col.text for col in cols[0:5]]
            url = cols[7].find('a').get('href')
            device_website = urllib.request.urlopen(url_root + url).read().decode('utf-8')
            device_soup = BeautifulSoup(device_website, 'html.parser')
            entries = device_soup.find_all('dd')
            for entry in entries:
                if entry['class'][0] == "target":
                    if entry.find('a'):
                        target = entry.find('a').get_text()
                    else:
                        target = entry.get_text()
                if entry['class'][0] == "subtarget":
                    subtarget = entry.get_text()
            print(brand, model, versions, current, target, subtarget)
            insert_device(brand, model, versions, current, target, subtarget)
            conn.commit()


