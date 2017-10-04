import sys
import requests
import json
import urllib
from flask import Flask
from flask import request, make_response, render_template, stream_with_context, Response
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

try:
	public_nba_address = environ['PUBLIC_NBA_ADDRESS']
except Exception as e:
	public_nba_address = nba_address
	
base_url = 'http://' + nba_address + ':' + nba_port

@app.route('/')
def root():
   	return render_template('index.html',nba_address=public_nba_address,nba_port=nba_port)
	
@app.route('/proxy/', methods=['GET','POST'])
def proxy():
	if request.method == 'POST':
		nba_request=request.form['query']
	else:
		nba_request=request.args.get('query', '')

	if len(nba_request.strip())==0:
		return 'no nba request'
	
	try:
		r = requests.get(base_url+nba_request,timeout=nba_request_timeout)

		response = make_response(r.content)
		response.headers['content-type'] = r.headers.get('content-type')

		if (r.headers.get('content-type')=='application/zip'):
			response.headers['content-disposition'] = r.headers.get('content-disposition')

		return response	

	except Exception as e:
		return 'request error: ' + str(e)
		
if __name__ == "__main__":
	app.run(host="0.0.0.0", port=int(listening_port))
