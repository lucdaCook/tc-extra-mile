from api.model.router import bp 
from scripts.predict import predict_on_video
from flask import request, send_from_directory, current_app, Response
from werkzeug.utils import secure_filename
import os
import config.config as cfg
import json


@bp.route('/')
def model():
  return f'This is a model route' 

 
# @bp.route('/extract/', methods=['POST'])
# async def extract_toxic_clouds():

#   c = request.data
#   print(request.form, 'form', request.files, 'files')
  
#   with open('back/api/testing.mp4', 'wb') as vid:
#     await vid.write(c)
#     predict_on_video('back/api/testing.mp4', model_name='mobilevit_xxs_tfr_nopreproc_vl39', 
#                      output_filename='back/api/testing.mp4')
#   return c




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
   
    return json.dumps(res)
  
@bp.route('/extract-many/', methods=['POST'])
def extract_for_many_videos():
  
  res = list()
    
  for f in request.files.getlist('file[]'):
    fname = secure_filename(f.filename)
    path = os.path.join(cfg.UPLOAD_FOLDER, fname)
    f.save(path)
    
    
    res.append(predict_on_video(path,
                                model_name='mobilevit_xxs_tfr_nopreproc_vl39', 
                                out_location=current_app.config['UPLOAD_FOLDER'],
                                n_frames_to_extract=int(request.form['n_frames'])))
    

    
    
      
  return json.dumps(res)
      
  
  
@bp.route('clip/<video_id>', methods=['GET']) 
def video_loader(video_id): 
  return send_from_directory(current_app.config['UPLOAD_FOLDER'], video_id)

@bp.route('feedback')
def get_feedback():
  
  return Response(200)
