import tensorflow as tf
from back.scripts.model import models
from back.scripts.predict import predict_on_video
import numpy as np
import pathlib
import logging

class ModelDeployment:
  def __init__(self, model_name:str,):
    
    self.model_name = model_name
    for model in models:
      if model in model_name:
        self.model_config = models[model]
      else: 
        logging.error(f'Can not infer a model token from the name given: `{model_name}`, choose one along the lines of {[model for model in models]}')
        
    # self.model = None TODO: how will we load the correct model?
    
    # app.post('/predict/) ?? still unknown
    def get_toxic_cloud_clips(
      video: list | np.ndarray | tf.Tensor,
      threshold:float=0.5,
      n_frames_threshold:int=None,
      output_filename:str=None,
      output_dir:str='toxic_clouds',
      n_frames_to_extract:int=8
    ):
      
      if output_filename is None:
        output_filename = pathlib.Path(video).stem
        
      ret, n_captured = predict_on_video(video, 
                                         self.model_name, 
                                         output_filename=output_filename,
                                         threshold=threshold,
                                         n_frames_threshold=n_frames_threshold,
                                         n_frames_to_extract=n_frames_to_extract)
      
      return ret, n_captured
      
"""
Can either call predict on vid or reimpl
"""
      
      
      
    
    