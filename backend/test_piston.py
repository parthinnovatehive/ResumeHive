import urllib.request
import json

url = "https://wandbox.org/api/compile.json"
data = {
    "compiler": "cpython-3.10.6",
    "code": "print('hello world')"
}

req = urllib.request.Request(url, json.dumps(data).encode('utf-8'), {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0'
})
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
