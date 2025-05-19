import requests

url = 'http://localhost:8000/submit'
myobj = {'song': 'test'}

x = requests.post(url, json = myobj)

print(x.status_code)