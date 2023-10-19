import logging
import subprocess
import tensorflow as tf
import cv2
import os
import pathlib
from datetime import datetime
from back.scripts.model import models
from back.scripts.utils import format_frames, capture_to_mpeg

def predict_on_stream(stream:str,
                      model_name:str,
                      threshold:float=0.5,
                      n_frames_to_extract:int=10,
                      max_retries:int=10,
                      write_location:str='clip'):

  b = subprocess.Popen(f'$(yt-dlp -g {stream})', 
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                       shell=True).stderr.read()

  src = b.decode('utf-8').split(' ')
  
  src = [link for link in src if 'https' in link][0]

  if 'https://' not in src:
    raise ValueError("Can't capture frames from that source")

  vid = cv2.VideoCapture(src)

  frame_step = int(vid.get(cv2.CAP_PROP_FPS))
  height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
  width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))

  cont = True

  retries = 0
  n_pos = 0
  n_preds = 0
  frames = []
  status = 200
  fourcc = cv2.VideoWriter_fourcc(*'mp4v')

  pathlib.Path(write_location).mkdir(parents=True, exist_ok=True)

  for model in models:
    if model in model_name:
      model_token = models[model]
      break
    else:
      raise NameError('That model name is not valid')

  image_shape = model_token.img_shape[:-1]

  model = tf.keras.saving.load_model(f'back/models/{model_name}')

  while cont:

    current_frame = vid.get(1)
    ret, frame = vid.read()

    if ret == True:
      frame = frame[..., [2, 1, 0]]
      frames.append(frame)
      if current_frame % frame_step == 0:
        f = format_frames(frame, output_size=image_shape)

        pred = model(tf.expand_dims(f, 0), training=False)
        n_preds += 1

        if pred >= threshold:
          n_pos += 1
          continue

        if n_preds >= n_frames_to_extract and n_pos >= n_frames_to_extract:
            out_path = f'{write_location}/toxic_cloud_{datetime.now().strftime("%Y-%m-%d-%H:%M:%S")}.mp4'
            toxic_cloud = frames[-n_pos * frame_step:]
            capture_to_mpeg(toxic_cloud, out_path,
                            fps=frame_step)
            frames = []
            n_seconds = n_pos
            n_pos = 0
            n_preds = 0
            cont = False
    else:
      frames = []
      n_pos = 0
      n_preds = 0
      if retries < max_retries:
        logging.info('Could not read the last frame of the video, will retry again')
        retries += 1
      else:
        cont = False
        status = 400
        logging.info(f'Failed to read the last {max_retries} frames..aborting')
        break

  if status == 200:
    return {
      'video_file': stream,
      'live_capture': True,
      'captured': True,
      'n_captured': 1,
      'written': [out_path],
      'n_seconds': n_seconds
    }
    