import os

from flask import Flask, send_from_directory, send_file, redirect, url_for, request
from flask_restful import Api, Resource
from flask_sock import Sock

import pathlib
import redis

from collections import namedtuple

DEBUG = True

staticRoute = os.path.dirname('../client/');

app   = Flask(__name__, static_folder=staticRoute,static_url_path='/')
api   = Api(app);
app.config['SOCK_SERVER_OPTIONS'] = {'ping_interval': 25}
sock  = Sock(app);

redis_isActive = False
redis_client   = redis.Redis(
  host='localhost', 
  port=49153, 
  db=1, 
  password='redispw'
)
try:
  redis_client.ping()
  redis_isActive = True

except Exception as e:
  print('could not connect to redis')
  msg = getattr(e, 'message', repr(e))
  print('    '+msg[    :  80])
  print('    '+msg[80  : 160])
  print('    '+msg[160 :    ])
  redis_isActive = False


def home():
  return send_file('../client/index.html');

@app.route('/')
def index():
  return home()

@app.route('/login')
def login():
  return home()

@app.route('/signup')
def signup():
  return home()

@app.route('/api')
def api():
  return 'test'

@sock.route('/socket')
def socket(ws):
  while True:
    text = ws.receive();
    ws.send(text[::-1]);

@app.route('/redisTest')
def redistest():
  #redis_client.set('foo', 'bar', 30);
  #redis_client.expire(name='foo',time=30);
  return redis_client.get('foo')

@app.errorhandler(404)
def notFound(e):
  print( request.path)
  file_extension = pathlib.Path(request.path).suffix.lower()[1:]
  print('file_extension',file_extension)

  if file_extension == '':
    return redirect(url_for('index'))

  if file_extension not in ['html','htm','js','css','png','ico','ttf','svg']:
    return 'unsuportet file extension', 404

  return 'not found', 404


if __name__ == "__main__":
  app.run(port=5000,debug=DEBUG);