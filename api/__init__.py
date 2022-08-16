from flask import Blueprint, jsonify
from flask_restful import Api
from werkzeug.http import HTTP_STATUS_CODES
from werkzeug.exceptions import HTTPException
from server import app
from .TaskAPI import Task
# from .TaskByIDAPI import TaskByID

apiVersion = '2.0'

api = Api(app)

api.add_resource(Task,f'/api/v{apiVersion}/task')
# restServerInstance.add_resource(TaskByID,"/api/v1.0/task/id/<string:taskId>")
