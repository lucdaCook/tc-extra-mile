# import httplib2
# import http.client as httplib
# import random
# import os 
# import sys
# import time
# from flask import request 
# import config.config as cfg
import flask
import googleapiclient
import google
import config.config as cfg
from api.youtube.router import bp
import json

# from googleapiclient.discovery import build 
# from googleapiclient.errors import HttpError
# from googleapiclient.http import MediaFileUpload
# from oauth2client.client import flow_from_clientsecrets
# from oauth2client.file import Storage
# from oauth2client.tools import argparser, run_flow

# httplib2.RETRIES = 1

# MAX_RETRIES = 10

# RETRIABLE_EXCEPTIONS = (
#   httplib2.HttpLib2Error, IOError, httplib.NotConnected, 
#   httplib.ImproperConnectionState, httplib.IncompleteRead,
#   httplib.CannotSendHeader, httplib.CannotSendRequest, 
#   httplib.ResponseNotReady, httplib.BadStatusLine
# )

# RETRIABLE_STATUS_CODES = [500, 502, 503, 504]
# CLIENT_SECRETS_FILE = cfg.CLIENT_SECRET_JSON

# YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube.upload"
# API_SERVICE_NAME = 'youtube'
# VERSION = 'v3'

# MISSING_CLIENT_SECRESTS_MESSAGE = "No client secrets file"

# VALID_PRIVACY_STATUS = ('public', 'private', 'unlisted')

# def get_authenticated_service(args): 
  
#   flow = flow_from_clientsecrets(
#     CLIENT_SECRETS_FILE,
#     scope=YOUTUBE_UPLOAD_SCOPE, 
#     message=MISSING_CLIENT_SECRESTS_MESSAGE)
  
#   storage = Storage('%s-oauth2.json' % sys.argv[0])
#   creds = storage.get()
  
#   if creds is None or creds.invalid:
#     credentials = run_flow(flow, storage, args)
  
#   return build(API_SERVICE_NAME, VERSION,
#                 credentials=httplib2.HTTP())

# def init_upload():
  
#   options = request.form
    
#   tags = None
#   if options.keywords: 
#     tags = options.keywords.split(',')
    
#   body = dict(
#     snippet=dict(
#       title=options.title,
#       description=options.description,
#       tags=tags,
#       categoryId = options.category
#     ),
#     status=dict(
#       privacyStatus=options.privacyStatus
#     )
#   )
  
#   insert_request = youtube.videos().insert(
#     part=','.join(body.keys()),
#     body=body,
#     media_body=MediaFileUpload(options.file, chunk_size=-1, resumable=True))
  
#   resumable_upload(insert_request)  
  
# def resumable_upload(insert_request):
#   response = None
#   error = None
#   retry = 0
  
#   while response is None:
#     try:
#       print('Uploading Video...')
#       status, response = insert_request.next_chunk()
      
#       if response is not None:
#         if 'id' in response:
#           print(f'Video {response["id"]} was sucessfully uploaded!')
#         else: 
#           print(f'The upload failed {response}')
          
#     except HttpError as e:
#       if e.resp.status in RETRIABLE_STATUS_CODES:
#         err = f'A retriable frror occured: {(e.resp.status, e.content)}'
        
#       else: raise
      
#     except RETRIABLE_EXCEPTIONS as e:
#       err = f'A retriable error occured: {e}'
      
#     if err is not None:
#       print(err)
#       retry += 1
#       if retry > MAX_RETRIES:
#         print('No longer retrying')
        
#       max_sleep = 2 ** MAX_RETRIES
#       sleep_seconds = random.random() * max_sleep
#       print(f'Sleeping {sleep_seconds} seconds, then retrying')
#       time.sleep(sleep_seconds)


@bp.route('/channel')
def channel():
  if 'credentials' not in flask.session:
    return flask.redirect(flask.url_for('main.authorize'))
  
  creds = google.oauth2.credentials.Credentials(
    **flask.session['credentials'] 
  )
  
  youtube = googleapiclient.discovery.build(
    cfg.API_SERVICE_NAME, cfg.API_VERSION, credentials=creds
  )
  
  channel = youtube.channels().list(mine=True, part='snippet').execute()
  
  
  flask.session['credentials'] = {
  'token': creds.token,
  'refresh_token': creds.refresh_token,
  'token_uri': creds.token_uri,
  'client_id': creds.client_id, 
  'client_secret': creds.client_secret,
  'scopes': creds.scopes
 }
  
  return json.dumps(**channel)