import tensorflow as tf
import pathlib
import cv2
import tqdm
from back.scripts.data.utils import get_data_paths, get_class
from back.scripts.data.utils import format_frames
import back.config.config as cfg

path_type = str|pathlib.PosixPath

image_features = {
    'height': tf.io.FixedLenFeature([], tf.int64),
    'width': tf.io.FixedLenFeature([], tf.int64),
    'depth': tf.io.FixedLenFeature([], tf.int64),
    'label': tf.io.FixedLenFeature([], tf.int64),
    'image': tf.io.FixedLenFeature([], tf.string)
}

def int64_feature(val:int):

  feature = tf.train.Feature(
      int64_list=tf.train.Int64List(value=[val])
  )
  return feature

def bytes_feature(val:bytes):
  if isinstance(val, type(tf.constant(0))):
    val = val.numpy()
  feature = tf.train.Feature(
      bytes_list=tf.train.BytesList(value=[val])
  )
  return feature

def write_frames_from_file(video_path:path_type):

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

  for f in range(int(n_frames) - 1):
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


def get_image_paths(path:path_type):
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


def write_tfrecords(image_dir:path_type):
  write_dir = pathlib.Path(image_dir).parent
  record_file = f'{image_dir}/images.tfrecords'
  with tf.io.TFRecordWriter(record_file) as w:
    for image in pathlib.Path(image_dir).glob('*/*.jpg'):
      image_string = open(image, 'rb').read()
      tf_example = convert_to_tfrecord(image_string, image)
      w.write(tf_example.SerializeToString())
  return record_file

def _parse_fn(example, image_size:tuple=cfg.IMAGE_SIZE):
  example = tf.io.parse_single_example(example, image_features)

  image = tf.io.decode_jpeg(example['image'], channels=3)
  image = format_frames(image, output_size=image_size)

  label = tf.cast(example['label'], tf.int32)

  return image, label

def get_tfrecords(records_file:str, training:bool=False,
                  image_size:tuple=cfg.IMAGE_SIZE):

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
def get_datasets(train_size:float|int=1., val_size:float=0.93, 
                  resample:bool=True, image_size:tuple=cfg.IMAGE_SIZE):

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
