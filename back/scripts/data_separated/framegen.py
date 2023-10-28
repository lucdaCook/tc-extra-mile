from back.scripts.data.utils import set_seeds
import back.config.config as cfg
import random
from back.scripts.data.utils import format_frames, get_data_paths, frames_from_video_file
import tensorflow as tf
import pathlib

def scale(x, y):
  x = tf.keras.layers.Rescaling(255)(x)
  return x, y

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
 
  if pathlib.Path('back/data/frissewind_eval/test').is_dir():
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
  