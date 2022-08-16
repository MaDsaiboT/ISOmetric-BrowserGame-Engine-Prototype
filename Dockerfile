FROM ubuntu

MAINTAINER MaDsaiboT

RUN apt update
RUN apt install python3-pip -y
RUN pip3 install Flask
RUN pip3 install Flask-RESTful
RUN pip3 install flask-sock
RUN pip3 install redis

WORKDIR /app

COPY . . 
# Add this:
ENV FLASK_APP=/server.py

CMD [ "python3","-m", "flask", "run", "--host=0.0.0.0"]