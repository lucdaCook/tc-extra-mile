from api.model.router import bp 
from scripts.predict import predict_on_video
from flask import request, send_from_directory, current_app, Response
from werkzeug.utils import secure_filename
import os
import config.config as cfg
import json
from scripts.serve import predict_on_stream
import back.api.model.gvar as gvar
import collections

@bp.route('/')
def model():
  return 'This is a model route' 

@bp.route('/extract/', methods=['GET', 'POST'])
def extract_toxic_clouds():
  
  if 'file' in request.files:
    file = request.files['file']
    filename = secure_filename(file.filename)
    path = os.path.join(cfg.UPLOAD_FOLDER, filename)
    file.save(path)
    
    
    model_choice = request.form['model']
    
    if 'Confident' in model_choice:
      model_name = 'mobilevit_xxs_tfr_nopreproc_vl39'
    elif 'Sensitive' in model_choice:
      model_name = 'mobilevit_xxs_tfr_nopreproc_vl39' 
    
    print(request.form['threshold'])
    
    res = predict_on_video(path, 
                           model_name=model_name,
                           out_location=current_app.config['UPLOAD_FOLDER'],
                           n_frames_to_extract=int(request.form['n_frames']),
                           threshold=float(request.form['threshold']))
    if 'True' in gvar.abort:
      gvar.abort = ['False']
      res['status'] = 205
   
    return json.dumps(res)
  return Response('that did not work', 400)
  
@bp.route('/extract-many/', methods=['POST'])
def extract_for_many_videos():
  
  res = list()
    
  for f in request.files.getlist('file[]'):
    
    fname = secure_filename(f.filename)
    path = os.path.join(cfg.UPLOAD_FOLDER, fname)
    f.save(path)
    
    print('predicting')
    res.append(predict_on_video(path,
                                model_name='mobilevit_xxs_tfr_nopreproc_vl39', 
                                out_location=current_app.config['UPLOAD_FOLDER'],
                                n_frames_to_extract=int(request.form['n_frames'])))
    
  if 'True' in gvar.abort:
    gvar.abort = ['False']
    res.append({'status': 205, 'message': 'User aborted'})
  return json.dumps(res)

@bp.route('/extract-live/', methods=['POST'])
def extract_from_livestream():
  
  if 'video' in request.form: 
    req = request.form
    
    print(req['video'], 'Live vid') 
    
    res = predict_on_stream(req['video'],
                            model_name='mobilevit_xxs_tfr_nopreproc_vl39',
                            n_frames_to_extract=int(req['n_frames']),
                            threshold=float(req['threshold']))
    
    return json.dumps(res)
  
  return Response('An error occured', 400)
    
@bp.route('clip/<video_id>', methods=['GET']) 
def video_loader(video_id): 
  return send_from_directory(current_app.config['UPLOAD_FOLDER'], video_id)

@bp.route('/feedback/')
def get_feedback():
  
  return Response(200)

@bp.route('/abort/', methods=['POST', 'GET'])
def abort_extraction(): 
  print('mutating...')
  gvar.abort = ['True']
  return json.dumps(True)