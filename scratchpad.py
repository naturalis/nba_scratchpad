import sys
import requests
import json
import urllib
from flask import Flask
from flask import request, make_response, render_template
from os import environ
from urllib.parse import urlparse

app = Flask(__name__)

try:
	nba_address = environ['NBA_ADDRESS']
	nba_port = environ['NBA_PORT']
except Exception as e:
	print('no environs found')
	print(e)
	exit(1)

try:
	nba_request_timeout = int(environ['NBA_TIMEOUT'])
except Exception as e:
	nba_request_timeout = 10

try:
	listening_port = int(environ['LISTENING_PORT'])
except Exception as e:
	listening_port = 80

base_url = 'http://' + nba_address + ':' + nba_port

@app.route('/')
def root():
   	return render_template('index.html',nba_address=nba_address,nba_port=nba_port)
	
@app.route('/proxy/', methods=['GET','POST'])
def proxy():
	if request.method == 'POST':
		nba_request=request.form['query']
	else:
		nba_request=request.args.get('query', '')
		
	nba_request=urllib.request.unquote(nba_request);

	if len(nba_request.strip())==0:
		return 'no nba request'
		
	urlparts = urlparse(nba_request)
	
	try:
		if len(urlparts.query)==0:
			r = requests.get(base_url+urlparts.path,timeout=nba_request_timeout)
		else:
			r = requests.post(base_url+urlparts.path,timeout=nba_request_timeout, data=urllib.parse.parse_qs(urlparts.query))

		response = make_response(r.content)
		response.headers['content-type'] = 'application/json; charset=utf-8'

		return response	
	except Exception as e:
		return 'request error: ' + str(e)
		
if __name__ == "__main__":
	app.run(host="0.0.0.0", port=int(listening_port))

