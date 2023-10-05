import numpy as np
import tensorflow as tf
import os
import cv2

def set_seeds(seed=11): #pragma: no cover, just setting seeds
  np.random.seed(seed)
  tf.random.set_seed(seed)
  tf.keras.utils.set_random_seed(seed)
  os.environ['PYTHONHASHSEED'] = str(seed)
  
def format_frames(frame, output_size): 
  
  frame = tf.image.convert_image_dtype(frame, tf.float32)
  frame = tf.image.resize_with_pad(frame, *output_size)

  return frame

def frames_from_video_file(video_path, n_frames=None, output_size=(256,256)):
  result = []
  src = cv2.VideoCapture(str(video_path))

  video_length = src.get(cv2.CAP_PROP_FRAME_COUNT)
  frame_step = src.get(cv2.CAP_PROP_FPS)

  if n_frames is None:
    n_frames = video_length // frame_step

  start = 0

  src.set(cv2.CAP_PROP_POS_FRAMES, start)

  ret, frame = src.read()

  for f in range(int(n_frames)): #pragma: no cover, can't test but triggers cov loss
    for _ in range(int(frame_step)):
      ret, frame = src.read()
    if f in [0, 1]:
      continue
    if ret:
      frame = format_frames(frame, output_size)
      result.append(frame)
    else:
      continue 
    
  src.release()
  result = np.array(result)[..., [2,1,0]]

  return result
