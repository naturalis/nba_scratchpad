import sys
import requests
import json
from flask import Flask
from flask import request, make_response, render_template
from os import environ

app = Flask(__name__)

try:
	ip = environ['NBA_ADDRESS']
	port = environ['NBA_PORT']
except Exception as e:
	print('no environs found')
	print(e)
	exit(1)

try:
	nba_request_timeout = int(environ['NBA_TIMEOUT'])
except Exception as e:
	nba_request_timeout = 10

base_url = 'http://' + ip + ':' + port

@app.route('/')
def root():
    return app.send_static_file('index.html')
	
@app.route('/query/', methods=['GET','POST'])
def query():
	if request.method == 'POST':
		nba_request=request.form['query']
	else:
		nba_request=request.args.get('query', '')

	if len(nba_request.strip())==0:
		return 'no nba request'
		
	try:
		r = requests.post(base_url+nba_request,timeout=nba_request_timeout)
		response = make_response(r.content)
		response.headers['content-type'] = 'application/json; charset=utf-8'
		return response	
	except Exception as e:
		return 'request error: ' + str(e)
		
if __name__ == "__main__":
	app.run(host="0.0.0.0", port=int("80"))

