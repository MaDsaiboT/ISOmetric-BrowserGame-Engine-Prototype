"""
Server for ISO-game-prototype
"""

from collections import namedtuple

import os
import pathlib
import redis

from flask import Flask, send_file, redirect, url_for, request
from flask_sock import Sock


apiVersion = '2.0';
DEBUG = True

staticRoute = os.path.dirname('./client/')

app = Flask(__name__, static_folder=staticRoute,static_url_path='/')

app.config['SOCK_SERVER_OPTIONS'] = {'ping_interval': 25}
sock  = Sock(app)

REDIS_IS_ACTIVE = False
redis_client   = redis.Redis(
  host='localhost', 
  port=49153, 
  db=1, 
  password='redispw'
)
try:
  redis_client.ping()
  REDIS_IS_ACTIVE = True

except Exception as e:
  print('could not connect to redis')
  msg = getattr(e, 'message', repr(e))
  print('    '+msg[    :  80])
  print('    '+msg[80  : 160])
  print('    '+msg[160 :    ])
  REDIS_IS_ACTIVE = False


def home():
  return send_file('./client/index.html')

@app.route('/')
def route_index():
  return home()

@app.route('/login')
def route_login():
  return home()

@app.route('/signup')
def route_signup():
  return home()

@app.route('/settings')
@app.route('/settings/<path:text>')
def route_settings(text=None):
  return home()

@app.route('/api')
def route_api():
  return 'test'

@sock.route('/socket')
def socket(ws):
  while True:
    text = ws.receive()
    ws.send(text[::-1])

@app.route('/redisTest')
def redistest():
  #redis_client.set('foo', 'bar', 30);
  #redis_client.expire(name='foo',time=30);
  return redis_client.get('foo')

@app.errorhandler(404)
def not_found(args):

  parts = pathlib.Path(request.path).parts
  print(parts)

  if parts[1] == 'api':
    message = f'...'
    if len(parts) > 2 and parts[2] != f'v{apiVersion}': 
      message = f'wrong api version {parts[2]}; current version is v{apiVersion}'
    return {'message':message},404 

  file_extension = pathlib.Path(request.path).suffix.lower()[1:]
  print('file_extension',file_extension)

  if file_extension == '':
    return redirect(url_for('route_index'))

  if file_extension not in ['html','htm','js','css','png','ico','ttf','svg']:
    return 'unsuportet file extension', 404

  return 'not found', 404

if __name__ == "__main__":
  from api import *
  app.run(port=5000,debug=DEBUG)
