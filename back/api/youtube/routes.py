# from api.youtube.router import bp 
# import flask
# import google_auth_oauthlib.flow
# import config.config as cfg
# import google.oauth2.credentials
# import googleapiclient.discovery

# @bp.route('/home')
# def home():
#   if 'credentials' not in flask.session:
#     return flask.redirect(flask.url_for('main.authorize'))
  
#   creds = google.oauth2.credentials.Credentials(
#     **flask.session['credentials'] 
#   )
  
#   youtube = googleapiclient.discovery.build(
#     cfg.API_SERVICE_NAME, cfg.API_VERSION, credentials=creds
#   )
  
#   channel = youtube.channels().list(mine=True, part='snippet').execute()
  
  
#   flask.session['credentials'] = {
#   'token': creds.token,
#   'refresh_token': creds.refresh_token,
#   'token_uri': creds.token_uri,
#   'client_id': creds.client_id, 
#   'client_secret': creds.client_secret,
#   'scopes': creds.scopes
#  }
  
#   return flask.redirect('http://localhost:3000')

# @bp.route('/authorize', methods=['POST', 'OPTIONS', 'GET'])
# def authorize():
  
  
  
#   flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
#     cfg.CLIENT_SECRET_JSON,
#     scopes=cfg.SCOPES
#   )

#   flow.redirect_uri = cfg.REDIRECT_URI
 
#   authorization_url, state = flow.authorization_url(
#     access_type='offline',
#     include_granted_scopes='false'
#   )
  
#   flask.session['state'] = state
  
#   return flask.redirect(authorization_url)

# @bp.route('/callback')
# def callback():
  
#   state = flask.session['state']
  
#   flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
#     cfg.CLIENT_SECRET_JSON,
#     scopes=cfg.SCOPES,
#     state=state
#   )
   
#   flow.redirect_uri = cfg.REDIRECT_URI
  
#   authorization_response = flask.request.url
#   flow.fetch_token(authorization_response=authorization_response)
  
#   creds = flow.credentials
#   flask.session['credentials'] = {
#     'token': creds.token,
#     'refresh_token': creds.refresh_token,
#     'token_uri': creds.token_uri,
#     'client_id': creds.client_id, 
#     'client_secret': creds.client_secret,
#     'scopes': creds.scopes
#   }
  
#   return flask.redirect(flask.url_for('main.home'))