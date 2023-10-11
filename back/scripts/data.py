import tqdm
import glob
import zipfile
import shutil
import random
import collections
import pathlib
import tensorflow as tf 
import back.config.config as cfg
from back.scripts.utils import set_seeds, format_frames
import os
import logging
from decimal import Decimal
import cv2


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
  
  test_size = 1 - Decimal(str(val_size))
  val_size = int(val_size*len(eval_files_for_class['Neg']))
    
  if test_size > Decimal('0.0'):
    test_size = int(test_size*len(eval_files_for_class['Neg']))
    eval_split_info = {'val': val_size, 'test': test_size}
    
  else:
    eval_split_info = {'val': val_size}
  
  eval_paths = write_data(cfg.EVAL_ZIP_PATH, split_info=eval_split_info,
                              to_dir=pathlib.Path('back/data/frissewind_eval'), 
                              base_name='frissewind_eval')

  return paths, eval_paths

def scale(x, y):
  x = tf.keras.layers.Rescaling(255)(x)
  return x, y

augmentation = tf.keras.Sequential([
  tf.keras.layers.RandomRotation(0.9),
  tf.keras.layers.RandomFlip('horizontal_and_vertical')
])


image_features = {
    'height': tf.io.FixedLenFeature([], tf.int64),
    'width': tf.io.FixedLenFeature([], tf.int64),
    'depth': tf.io.FixedLenFeature([], tf.int64),
    'label': tf.io.FixedLenFeature([], tf.int64),
    'image': tf.io.FixedLenFeature([], tf.string)
}

def int64_feature(val):

  feature = tf.train.Feature(
      int64_list=tf.train.Int64List(value=[val])
  )
  return feature

def bytes_feature(val):
  if isinstance(val, type(tf.constant(0))):
    val = val.numpy()
  feature = tf.train.Feature(
      bytes_list=tf.train.BytesList(value=[val])
  )
  return feature

def write_frames_from_file(video_path):

  src = cv2.VideoCapture(str(video_path))

  video_path = pathlib.Path(video_path)

  video_length = src.get(cv2.CAP_PROP_FRAME_COUNT)
  frame_step = src.get(cv2.CAP_PROP_FPS)

  n_frames = video_length // frame_step

  start = 0

  src.set(cv2.CAP_PROP_POS_FRAMES, start)

  ret, frame = src.read()

  out_dir = pathlib.Path(f'{video_path.parent.parent}/images/{video_path.parent.name}')
  out_dir.mkdir(parents=True, exist_ok=True)

  for f in range(int(n_frames)):
    for _ in range(int(frame_step)): # skip over frames
      ret, frame = src.read()
    if f in [0,1]:
      continue
    if ret:
      write_location = pathlib.Path(f'{out_dir}/{video_path.stem}_{str(f)}.jpg')
      cv2.imwrite(str(write_location), frame)
    else:
      continue
  src.release()
  return out_dir


def get_image_paths(path):
  path = pathlib.Path(path)
  video_paths = list(path.glob('*/*.mp4'))

  print(f'{path.name} frames:')
  for f in tqdm.tqdm(video_paths):
    image_dir = write_frames_from_file(f)
  return pathlib.Path(path, 'images')

def convert_to_tfrecord(image_string, image_path):
  image_shape = tf.io.decode_jpeg(image_string).shape
  label = get_class(pathlib.Path(image_path))

  class_names = ['Neg', 'Pos']
  class_ids_for_name = dict((name, idx) for idx, name in enumerate(class_names))

  label = class_ids_for_name[label]

  feature = {
      'height': int64_feature(image_shape[0]),
      'width': int64_feature(image_shape[1]),
      'depth': int64_feature(image_shape[2]),
      'label': int64_feature(label),
      'image': bytes_feature(image_string)

  }

  return tf.train.Example(features=tf.train.Features(feature=feature))


def write_tfrecords(image_dir):
  write_dir = pathlib.Path(image_dir).parent
  record_file = f'{image_dir}/images.tfrecords'
  with tf.io.TFRecordWriter(record_file) as w:
    for image in pathlib.Path(image_dir).glob('*/*.jpg'):
      image_string = open(image, 'rb').read()
      tf_example = convert_to_tfrecord(image_string, image)
      w.write(tf_example.SerializeToString())
  return record_file

def _parse_fn(example, image_size:tuple=(256, 256)):
  example = tf.io.parse_single_example(example, image_features)

  image = tf.io.decode_jpeg(example['image'], channels=3)
  image = format_frames(image, output_size=image_size)

  label = tf.cast(example['label'], tf.int32)

  return image, label

def get_tfrecords(records_file, training:bool=False,
                  image_size:tuple=(256, 256)):

  AUTOTUNE = tf.data.AUTOTUNE

  ds = tf.data.TFRecordDataset(records_file)

  preproc = [
      tf.keras.layers.Rescaling(255)
  ]

  if training:

    preproc.extend([
        tf.keras.layers.RandomZoom((0.1, 0.3)),
        tf.keras.layers.RandomRotation(0.9),
        tf.keras.layers.RandomFlip('horizontal_and_vertical')
    ])

    augmentation = tf.keras.Sequential(preproc)

    ds = (
        ds
        .map(lambda x: _parse_fn(x, image_size=image_size),
             num_parallel_calls=AUTOTUNE)
        .cache()
        .shuffle(ds.cardinality())
        .batch(32)
        .map(lambda x, y: (augmentation(x, training=True), y),
             num_parallel_calls=AUTOTUNE)
        .prefetch(AUTOTUNE)

    )
    return ds

  preproc = tf.keras.Sequential(preproc)

  ds = (
      ds
      .map(lambda x: _parse_fn(x, image_size=image_size),
           num_parallel_calls=AUTOTUNE)
      .batch(32)
      .map(lambda x, y: (preproc(x), y),
           num_parallel_calls = AUTOTUNE)
      .cache()
      .prefetch(AUTOTUNE)
  )

  return ds
def get_datasets(train_size:float|int=1., val_size:float=0.9,
                  resample:bool=True, image_size:tuple=(256, 256)):

  paths, eval_paths = get_data_paths(train_size=train_size,
                                     val_size=val_size,
                                     resample=resample)

  image_path = get_image_paths(paths['train'])

  eval_image_path = get_image_paths(eval_paths['val'])

  train_records = write_tfrecords(image_path)

  val_records = write_tfrecords(eval_image_path)

  train_ds = get_tfrecords(train_records, training=True,
                           image_size=image_size)

  val_ds = get_tfrecords(val_records, training=False,
                         image_size = image_size)

  return train_ds, val_ds