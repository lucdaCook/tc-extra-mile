import tqdm
import glob
import zipfile
import shutil
import random
import collections
import pathlib
import tensorflow as tf 
import back.config.config as cfg
from back.scripts.utils import set_seeds
import os
import logging
import cv2 
import numpy as np

def set_seeds(seed=11): #pragma: no cover, just setting seeds
  np.random.seed(seed)
  tf.random.set_seed(seed)
  tf.keras.utils.set_random_seed(seed)
  os.environ['PYTHONHASHSEED'] = str(seed)

def list_files_from_zip(zip):
  '''
  Func that takes a zip file and returns array w/ its contents
  '''
  files = []
  with zipfile.ZipFile(zip) as zip:
    for zip_info in zip.infolist():
      files.append('/'.join(zip_info.filename.split('/')[-2:]))
  return files

def get_class(fname):
  ''' Get class name of a file given its path
      - Neg : No smoke at all or white clouds
      - Pos : Any colored smoke/clouds typically black or orange/brown
  '''
  class_name = pathlib.Path(fname).parent.name
  return class_name

def get_files_per_class(files):
  '''Seperate files by class
  '''

  files_for_class = collections.defaultdict(list)

  for fname in files:
    class_name = get_class(fname)
    files_for_class[class_name].append(fname)
  return files_for_class

def split_class_lists(files_for_class, count):
  ''' split data between classes wrt count
  '''
  split_files = []
  remainder = {}
  for cls in files_for_class:
    split_files.extend(files_for_class[cls][:count])
    remainder[cls] = files_for_class[cls][count:]
  return split_files, remainder

def download_from_zip(zip_file, to_dir, 
                      file_names, base_name='frissewind'):

  ''' Given a zip file, download its contents
   '''
  with zipfile.ZipFile(zip_file) as zip:
    for fn in tqdm.tqdm(file_names):
      class_name = get_class(fn)
      zip.extract(f'{base_name}/' + fn, str(to_dir / class_name))
      unzipped_file = str(to_dir / class_name) + f'/{base_name}/' + fn
      output_file = to_dir / fn
      pathlib.Path(unzipped_file).rename(output_file)

def get_splits(zip, num_classes, splits, to_dir, base_name='frissewind'):

  ''' Download & split the contents of zip into n_splits
      '''

  set_seeds()

  files = list_files_from_zip(zip)
  files = [f for f in files if f.endswith('.mp4')]

  dirs = {}

  files_for_class = get_files_per_class(files)

  classes = list(files_for_class.keys())[:num_classes]

  for cls in classes:
    random.shuffle(files_for_class[cls])

  files_for_class = {x: files_for_class[x] for x in classes}

  for split_name, split_count in splits.items():
    print(split_name, ':')
    split_dir = to_dir / split_name
    split_files, files_for_class = split_class_lists(files_for_class, split_count)

    download_from_zip(zip, split_dir, split_files, base_name=base_name)
    dirs[split_name] = split_dir

    for dir in glob.glob(str(split_dir) +'/*'): # Cleaning up the folder structure
      for subdir in glob.glob(dir + '/*/'):
          shutil.rmtree(subdir)

  return dirs

def write_data(zip_path:str, split_info:dict, 
                   to_dir:str|pathlib.PosixPath=pathlib.Path('back/data/frissewind'),
                   base_name='frissewind'):
  '''Write data from zip

  Args:
      zip_path (str): _description_
      split_info (dict): _description_
      to_dir (_type_, optional): _description_. Defaults to pathlib.Path('../data/frissewind').

  Returns:
     Dict of posix path(s) to data directories
  '''

  paths = get_splits(zip_path, 2, split_info,
                      to_dir=to_dir, base_name=base_name
                      )
  return paths

def get_data_paths(train_size:float=1.0, val_size:float=0.8, resample:bool=True):
  
  check_train = pathlib.Path('back/data/frissewind').is_dir()
  check_eval = pathlib.Path('back/data/frissewind_eval').is_dir()
  
  if check_eval and check_train:
    
    if not resample:
      
      paths = {str(dir): pathlib.Path(f'back/data/frissewind/{dir}') for dir in os.listdir('back/data/frissewind')}
      eval_paths = {str(dir): pathlib.Path(f'back/data/frissewind_eval/{dir}') for dir in os.listdir('back/data/frissewind_eval')}
      
      return paths, eval_paths
    
    elif resample:
      shutil.rmtree('back/data/frissewind')
      shutil.rmtree('back/data/frissewind_eval')
    
  elif not resample and not check_eval and not check_train:
    logging.info('Resample arugment passed as False when no data has been written. Resampling anyways..')
      
  files = list_files_from_zip(cfg.ZIP_PATH)
  files = [f for f in files if f.endswith('.mp4')]
  files_for_class = get_files_per_class(files)
  
  train_size = int(train_size*len(files_for_class['Neg']))

  split_info = {'train': train_size}
  
  paths = write_data(cfg.ZIP_PATH, split_info=split_info)
  
  
  eval_files = list_files_from_zip(cfg.EVAL_ZIP_PATH)
  eval_files = [f for f in eval_files if f.endswith('.mp4')]
  eval_files_for_class = get_files_per_class(eval_files)
  
  test_size = 1 - val_size
  val_size = int(val_size*len(eval_files_for_class['Neg']))
    
  if test_size > 0.0:
    test_size = int(test_size*len(eval_files_for_class['Neg']))
    eval_split_info = {'val': val_size, 'test': test_size}
    
  else:
    eval_split_info = {'val': val_size}
  
  eval_paths = write_data(cfg.EVAL_ZIP_PATH, split_info=eval_split_info,
                              to_dir=pathlib.Path('back/data/frissewind_eval'), 
                              base_name='frissewind_eval')

  return paths, eval_paths


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
