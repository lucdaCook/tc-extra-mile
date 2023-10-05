from back.api.model.router import bp 
from back.scripts.predict import predict_on_video
from flask import request

@bp.route('/')
def model():
  return f'This is a model route' 

 
@bp.route('/extract/', methods=['GET', 'POST'])
def extract_toxic_clouds():
  
  data = predict_on_video(request.video, 
                          model_name=request.model_name,
                          output_dir=request.output_dir, 
                          output_file=request.output_file)
  
  return {
    "captured": data.captured,
    "original_video": data.video_file,
    "n_captured": data.n_captured,
    "written": data.written,
    "message": data.message
  }