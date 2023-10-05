import tqdm
import glob
import zipfile
import shutil
import random
import collections
import pathlib
import tensorflow as tf 
import back.config.config as cfg
from back.scripts.utils import set_seeds, frames_from_video_file
import os
import logging

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

class FrameGen():
  def __init__(self, path, n_frames, training=False, image_size:tuple=cfg.IMAGE_SIZE):
    self.path = path
    self.n_frames = n_frames
    self.training = training
    self.image_size = image_size
    self.class_names = sorted(set(p.name for p in self.path.iterdir() if p.is_dir()))
    self.class_ids_for_name = dict((name, idx) for idx, name in enumerate(self.class_names))

  def get_files_and_classes(self):
    video_paths = list(self.path.glob('*/*.mp4'))
    classes = [p.parent.name for p in video_paths]
    return video_paths, classes

  def __call__(self):
    video_paths, classes = self.get_files_and_classes()

    pairs = list(zip(video_paths, classes))

    random.shuffle(pairs)

    for path, name in pairs:
      label = self.class_ids_for_name[name]
      for frame in frames_from_video_file(path, self.n_frames, output_size=self.image_size):
        yield frame, label

def write_data(zip_path:str, split_info:dict, 
                   to_dir=pathlib.Path('data/frissewind'),
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
  
  check_train = pathlib.Path('data/frissewind').is_dir()
  check_eval = pathlib.Path('data/frissewind_eval').is_dir()
  
  if check_eval and check_train:
    
    if not resample:
      
      paths = {str(dir): pathlib.Path(f'data/frissewind/{dir}') for dir in os.listdir('data/frissewind')}
      eval_paths = {str(dir): pathlib.Path(f'data/frissewind_eval/{dir}') for dir in os.listdir('data/frissewind_eval')}
      
      return paths, eval_paths
    
    elif resample:
      shutil.rmtree('data/frissewind')
      shutil.rmtree('data/frissewind_eval')
    
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
                              to_dir=pathlib.Path('data/frissewind_eval'), 
                              base_name='frissewind_eval')

  return paths, eval_paths

def scale(x, y):
  x = tf.keras.layers.Rescaling(255)(x)
  return x, y

augmentation = tf.keras.Sequential([
  tf.keras.layers.RandomRotation(0.9),
  tf.keras.layers.RandomFlip('horizontal_and_vertical')
])

def get_datasets(resample:bool=True, 
                 train_size:float=1.0, 
                 val_size:float=0.8,
                 BATCH_SIZE:int=32,
                 shuffle_buffer:int=7200,
                 image_size:tuple=cfg.IMAGE_SIZE,
                 augmentation:tf.keras.Sequential()=augmentation):

  
  paths, eval_paths = get_data_paths(train_size=train_size, 
                                     val_size=val_size, resample=resample)
    
  output_signature= (tf.TensorSpec(shape=(None, None, 3), dtype=tf.float32),
                     tf.TensorSpec(shape=(), dtype=tf.int16))

  train_ds = tf.data.Dataset.from_generator(FrameGen(paths['train'], None, image_size=image_size),
                                            output_signature=output_signature)
  
  val_ds = tf.data.Dataset.from_generator(FrameGen(eval_paths['val'], None, image_size=image_size),
                                          output_signature=output_signature),
  
  
  AUTOTUNE = tf.data.AUTOTUNE
  
  train_ds = (
    train_ds
    .map(scale,
        num_parallel_calls=AUTOTUNE) 
    .cache()
    .shuffle(7200)
    .batch(BATCH_SIZE)
    .map(lambda x, y: (augmentation(x, training=True), y),
         num_parallel_calls = AUTOTUNE)
    .prefetch(AUTOTUNE)
  )
    
  val_ds = (
      val_ds[0]
      .batch(BATCH_SIZE)
      .map(scale,
          num_parallel_calls=AUTOTUNE)
      .cache()
      .prefetch(AUTOTUNE)
  )
 
  if pathlib.Path('data/frissewind_eval/test').is_dir():
    test_ds = tf.data.Dataset.from_generator(FrameGen(eval_paths['test'], None, image_size=image_size),
                                            output_signature=output_signature)
    test_ds = (
      test_ds
      .batch(BATCH_SIZE)
      .map(scale,
          num_parallel_calls=AUTOTUNE)
      .cache()
      .prefetch(AUTOTUNE)
  )
    return train_ds, val_ds, test_ds
  
  return train_ds, val_ds
  