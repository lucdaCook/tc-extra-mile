import back.config.config as cfg
import tensorflow as tf
import cv2 
import numpy as np
import pathlib
from back.scripts.model import models
import logging
import imageio.v3 as iio
from back.scripts.utils import format_frames

def downsample(video:str, new_size:tuple=cfg.IMAGE_SIZE,
               output_dir:str='captures/downsampled/'):
  
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
      raise NameError('That model name is not valid')
      
  image_size = models[model_token].img_shape[:-1]

  video_path = downsample(video, new_size=write_size, output_dir='downsampled_clips/')

  vid = cv2.VideoCapture(str(video_path))

  frame_step = vid.get(cv2.CAP_PROP_FPS)
  height = vid.get(cv2.CAP_PROP_FRAME_HEIGHT)
  width = vid.get(cv2.CAP_PROP_FRAME_HEIGHT)
  n_frames = vid.get(cv2.CAP_PROP_FRAME_COUNT)
    
  n_extractable_frames = n_frames // frame_step
  
  if n_frames_to_extract > n_extractable_frames:
    logging.info(f'The given video is too short to extract `{n_frames_to_extract}` frames. Falling back to {n_extractable_frames} instead')
    n_frames_to_extract = int(n_extractable_frames)
  
  if write_fps is None:
    write_fps = n_frames_to_extract

  frames = []
  toxic_clouds = []
  predictions = []
  out_paths = []

  ret, frame = vid.read()
  
  model = tf.keras.saving.load_model(f'back/models/{model_name}')
  
  captured = False
  n_captured = 0
  
  out_ext = pathlib.Path(video).suffix
  
  if output_filename is None:
    output_filename = pathlib.Path(video).name
  
  out_stem = pathlib.Path(output_filename).stem

  for _ in range(int(n_frames)):

    current_frame = vid.get(1)

    ret, frame = vid.read()

    if ret:
      #if we choose, we can just go over every single frame and multiply n_frames_threshold by frame_step
      if current_frame % frame_step == 0:

        frames.append(frame)

        f = format_frames(frame, output_size=(image_size))

        f = tf.keras.layers.Rescaling(255)(f)

        pred = model(tf.expand_dims(f, 0), training=False)

        predictions.append(list(pred.numpy())[0][0])

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')

        if len(predictions) >= n_frames_to_extract:
          
          n_pos = len(np.where(np.array(predictions[-n_frames_to_extract:]) >= threshold)[0])

          if n_pos >= n_frames_threshold:
            captured = True
            n_captured += 1

            out_path = pathlib.Path(f'{output_dir}/{out_stem}_{n_captured}{out_ext}')
            
            out_paths.append(str(out_path))
            
            out_path.parent.mkdir(parents=True, exist_ok=True)

            writer = cv2.VideoWriter(str(out_path), fourcc, 1, (int(width), int(height)))

            toxic_clouds = frames[-n_frames_to_extract:].copy()
            
            for spt in toxic_clouds:
              writer.write(spt)
            writer.release()
            
            capture_to_mpeg(frames_from_prediction_file(out_path), out_path, fps=write_fps)
              
            logging.info(f'A toxic cloud has been captured! The clip has been written to {out_path}')
            predictions = []
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

def capture_to_mpeg(images, output_file, fps):
  converted_images = np.clip(images * 255, 0, 255).astype('uint8')
  pathlib.Path(output_file).touch(exist_ok=True)
  iio.imwrite(output_file, converted_images, fps=fps)