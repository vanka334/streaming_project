FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY ./streaming_project /app

RUN pip install --upgrade pip
RUN pip install -r /app/requirements.txt

