from api.model.router import bp 
from scripts.predict import predict_on_video
from flask import request, send_from_directory, current_app, redirect
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
    
    # if 'confident' in form['model']:
    #   model_name = 'confidence'
    # elif 'sensitive' in model_name:
    #   model_name = 'sensitive'
    
    # output_filename
    
    res = predict_on_video(path, 
                           model_name='mobilevit_xxs_tfr_nopreproc_vl39', 
                           out_location=current_app.config['UPLOAD_FOLDER'])
    
    print(filename, 'FILENAME')
    print(path, 'PATH')
    
    # return json.dumps(res)
    fn = '_1.'.join(filename.split('.'))
    print(filename, fn, 'FILENAME FN')
    return json.dumps(res)
  
  # else :
  #   return abort(400, 'Video not found')
  
@bp.route('/clip/<video_id>', methods=['GET'])
def video_loader(video_id):
  return send_from_directory(current_app.config['UPLOAD_FOLDER'], video_id)
