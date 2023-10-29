import back.config.config as cfg
from back.scripts.utils import format_frames, capture_to_mpeg
from back.scripts.model import models
import tensorflow as tf
import cv2 
import numpy as np
import pathlib
import logging

#TODO: 
'''
- make it faster
- see if this or repredict is faster
'''

def downsample(video:str, n_frames_to_extract, new_size:tuple=(512, 512)):

  vid = cv2.VideoCapture(video)


  frame_step = int(vid.get(cv2.CAP_PROP_FPS))
  n_frames = int(vid.get(cv2.CAP_PROP_FRAME_COUNT))
  frames_slice = n_frames_to_extract * frame_step

  n_extractable_frames = n_frames // frame_step

  ret, frame = vid.read()


  frames = []

  for _ in range(n_frames):


    current_frame = vid.get(1)
    ret, frame = vid.read()

    if ret and current_frame % frame_step == 0:
      frames.append(cv2.resize(frame, new_size))
    else:
      continue

  vid.release()

  vid_info = {
              'frame_step': frame_step,
              'n_frames': n_frames,
              'frames_slice': frames_slice,
              'n_extractable_frames': n_extractable_frames
              }


  return np.array(frames)[..., [2, 1, 0]], vid_info


def predict_on_video(video:str,
                     model_name:str,
                     out_location:str|pathlib.PosixPath=cfg.UPLOAD_FOLDER,
                     n_frames_to_extract:int|str=8,
                     threshold:float=0.5):

  for model in models:
    if model in model_name:
      model_token = models[model]
      break
    else:
      raise KeyError('That model name is not valid')

  image_size = model_token.img_shape[:-1]

  vid, vid_info = downsample(video, new_size=image_size, n_frames_to_extract=n_frames_to_extract)

  frame_step = vid_info['frame_step']
  frames_slice = vid_info['frames_slice']
  n_extractable_frames = vid_info['n_extractable_frames']
    

  if n_frames_to_extract > n_extractable_frames:
    logging.info(f'The given video is too short to extract `{n_frames_to_extract}` frames. Falling back to {n_extractable_frames} instead')
    n_frames_to_extract = n_extractable_frames


  frames = []
  toxic_clouds = []
  out_paths = []

  model = tf.keras.saving.load_model(f'back/models/{model_name}')

  captured = False
  n_captured = 0
  n_pos = 0
  n_preds = 0

  out_name = pathlib.Path(video).stem

  out_ext = pathlib.Path(video).suffix

  for i, f in enumerate(vid):

    frames.append(f)

    toxic_clouds.extend(range((i * int(frame_step)) + frame_step))

    f = np.array(f)[..., [2, 1, 0]]

    f = format_frames(f, output_size=image_size)

    pred = model(tf.expand_dims(f, 0), training=False)
    n_preds += 1

    if pred >= threshold:

      n_pos += 1

    if n_preds >= n_frames_to_extract and n_pos >= n_frames_to_extract:
        captured = True
        n_captured += 1

        out_path = pathlib.Path(f'{out_location}/{out_name}_{n_captured}{out_ext}')

        out_path.parent.mkdir(parents=True, exist_ok=True)

        out_paths.append(str(out_path))


        cloud = video_from_predictions(video, toxic_clouds[-frames_slice:])

        capture_to_mpeg(cloud, out_path,
                        fps=frame_step)

        logging.info(f'A toxic cloud has been captured! The clip has been written to {out_path}.')
        n_pos = 0
        n_preds = 0
    else:
      continue

  optimism = ". That's a great thing!"
  message = f'Captured {n_captured} toxic clouds{f"! You can view them at {out_location}" if n_captured > 0 else optimism}'
  logging.info(message)
    
  data = {
    "video_file": video,
    "captured": captured,
    "n_captured": n_captured,
    "written": out_paths,
    "message": message
  }
  return data


def video_from_predictions(video, toxic_frames):

  vid = cv2.VideoCapture(str(video))

  n_frames = vid.get(cv2.CAP_PROP_FRAME_COUNT)

  ret, frame = vid.read()

  frames = []

  for i in range(int(n_frames)):

    ret, frame = vid.read()

    if ret and i in toxic_frames:
      frames.append(frame)

  vid.release()
  return np.array(frames)[..., [2,1,0]]