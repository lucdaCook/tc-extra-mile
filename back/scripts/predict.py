import back.config.config as cfg
from back.scripts.utils import format_frames
from back.scripts.model import models
import tensorflow as tf
import cv2 
import numpy as np
import pathlib
import logging
import imageio.v3 as imageio

#TODO: 
'''
- make it faster
- see if this or repredict is faster
'''
def downsample(video:str, new_size:tuple=cfg.IMAGE_SIZE,
               output_dir:str='captured/downsampled/'):

  
  fn = pathlib.Path(video).name
  
  output_path = pathlib.Path(output_dir, fn)
  
  output_path.parent.mkdir(parents=True, exist_ok=True)

  vid = cv2.VideoCapture(video)

  n_frames = vid.get(cv2.CAP_PROP_FRAME_COUNT)

  fps = vid.get(cv2.CAP_PROP_FPS)

  fourcc = cv2.VideoWriter_fourcc(*'mp4v')

  writer = cv2.VideoWriter(str(output_path), fourcc, fps, new_size)

  for _ in range(int(n_frames)):
    ret, frame = vid.read()
    if ret:
      resized = cv2.resize(frame, new_size)
      writer.write(resized)
    else:
      break

  vid.release()
  writer.release()
  cv2.destroyAllWindows()
  
  return output_path

def predict_on_video(video:str,
                     model_name:str,
                     output_filename:str,
                     write_size:tuple=(512, 512),
                     output_dir:str='captured',
                     n_frames_threshold:int=8,
                     n_frames_to_extract:int|str=8,
                     model:tf.keras.Model=None,
                     threshold:float=0.5,
                     write_fps:int=None):
  
  for model in models:
    if model in model_name:
      model_token = model
      break
    else:
      raise KeyError('That model name is not valid')
      
  image_size = models[model_token].img_shape[:-1]

  video_filename = pathlib.Path(video).stem

  video_path = downsample(video, new_size=write_size, output_dir=f'captured/downsampled/{video_filename}')

  vid = cv2.VideoCapture(str(video_path))

  frame_step = vid.get(cv2.CAP_PROP_FPS)
  height = vid.get(cv2.CAP_PROP_FRAME_HEIGHT)
  width = vid.get(cv2.CAP_PROP_FRAME_HEIGHT)
  n_frames = vid.get(cv2.CAP_PROP_FRAME_COUNT)
  frames_slice = int(n_frames_to_extract) * int(frame_step)
    
  n_extractable_frames = n_frames // frame_step
  
  if n_frames_to_extract > n_extractable_frames:
    logging.info(f'The given video is too short to extract `{n_frames_to_extract}` frames. Falling back to {n_extractable_frames} instead')
    n_frames_to_extract = int(n_extractable_frames)
    
  elif 'max' in str(n_frames_to_extract):
    n_frames_to_extract = int(n_extractable_frames)
  
  if write_fps is None:
    write_fps = frame_step

  frames = []
  toxic_clouds = []
  out_paths = []

  ret, frame = vid.read()
  
  model = tf.keras.saving.load_model(f'back/models/{model_name}')
  
  captured = False
  n_captured = 0
  n_pos = 0
  n_preds = 0
  
  out_ext = pathlib.Path(video).suffix
  
  if output_filename is None:
    output_filename = pathlib.Path(video).name
  
  out_stem = pathlib.Path(output_filename).stem
  
  for i in range(int(n_frames)):
    current_frame = int(vid.get(1))

    ret, frame = vid.read()
    
    frames.append(frame)
    
    
    if ret:

      if current_frame % frame_step == 0:

        f = format_frames(frame, output_size=(image_size))

        f = tf.keras.layers.Rescaling(255)(f)

        pred = model(tf.expand_dims(f, 0), training=False)
        n_preds += 1

        if pred >= threshold:
          n_pos += 1

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')

        if n_preds >= n_frames_to_extract:

          if n_pos >= n_frames_threshold:
            captured = True
            n_captured += 1

            out_path = pathlib.Path(f'{output_dir}/{out_stem}_{n_captured}{out_ext}')
            
            out_path.parent.mkdir(parents=True, exist_ok=True)
            
            out_paths.append(str(out_path))

            writer = cv2.VideoWriter(str(out_path), fourcc, frame_step, (int(width), int(height)))

            toxic_clouds = frames[-frames_slice:].copy()
            
            for spt in toxic_clouds:
              writer.write(spt)
            writer.release()
            
            capture_to_mpeg(frames_from_prediction_file(out_path), 
                           out_path, fps=write_fps)
              
            logging.info(f'A toxic cloud has been captured! The clip has been written to {out_path}.')
            n_pos = 0
            n_preds = 0
    else:
      continue
  
  optimism = ". That's a great thing!" 
  message = f'Captured {n_captured} toxic clouds{f"! You can view them at {output_dir}" if n_captured > 0 else optimism}'
  logging.info(message)
  vid.release()
  cv2.destroyAllWindows()
  
  data = {
    "video_file": video,
    "captured": captured,
    "n_captured": n_captured,
    "written": out_paths,
    "message": message
  }
  return data


def frames_from_prediction_file(video_path:str, output_size:tuple=None):
  
  src = cv2.VideoCapture(str(video_path))
  
  n_frames = src.get(cv2.CAP_PROP_FRAME_COUNT)
  
  toxic_cloud = []
  
  if output_size is None:
    output_size = (512, 512)
  
  for _ in range(int(n_frames)):
    ret, frame = src.read()
    if ret:
      frame = format_frames(frame, output_size)
      toxic_cloud.append(frame)
    else:
      continue 
    
  capture = np.array(toxic_cloud)[..., [2,1,0]]
  src.release()
  
  return capture

def capture_to_mpeg(images, output_file, fps, verbose:int=0):
  converted_images = np.clip(images * 255, 0, 255).astype('uint8')
  pathlib.Path(output_file).touch(exist_ok=True)
  imageio.imwrite(output_file, converted_images, fps=fps)
  
  if verbose:
    logging.info(f'A capture was written to {output_file}!')
