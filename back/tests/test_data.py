import pytest
import back.scripts.data as data
import back.config.config as cfg
import pathlib
import glob
import numpy as np
import tensorflow as tf
import shutil

@pytest.mark.parametrize(
  "input, instance", 
  [
    (cfg.ZIP_PATH, str),
    (cfg.EVAL_ZIP_PATH, str)
  ]
)
def test_list_files_from_zip(input, instance, files):
  
  result = files(input)
    
  assert all(isinstance(item, instance) for item in result)
  
@pytest.mark.parametrize(
  'input, label',
  [
    ('back/frissewind/Neg/1-juni_...', 'Neg'),
    ('back/frissewind/Pos/1-juni_..', 'Pos')
  ]
)

def test_get_class(input, label):
  labeled = data.get_class(input)
  
  assert labeled == label
  
@pytest.mark.parametrize(
  "input, classes", 
  [
    (cfg.ZIP_PATH, {'Neg', 'Pos'}),
    (cfg.EVAL_ZIP_PATH, {'Neg', 'Pos'})
  ]
)
def test_get_files_per_class(input, classes, files):
  fs = files(input)
  files_per_class = data.get_files_per_class(fs)

  assert files_per_class.keys() & classes
  
@pytest.mark.parametrize(
  'zip_path, split_info, to_dir, base_name',
  [
    (
      cfg.ZIP_PATH, {'train': 1.0}, 
      pathlib.Path('back/data/frissewind'), 'frissewind',
    ),
    (
      cfg.EVAL_ZIP_PATH, {'val': 0.8, 'test': 0.2}, 
      pathlib.Path('back/data/frissewind_eval'), 'frissewind_eval'
    ),
    ( cfg.EVAL_ZIP_PATH, {'val': 0.8, 'test': 0.2}, 
      pathlib.Path('back/data/frissewind_eval'), 'frissewind_eval'
    )
  ]
)

# @pytest.mark.parametrize(
#  'split, count',
#  [('spt', 10)]
# )
# def test_split_class_lists(split, count, files):
#   fs = files(cfg.ZIP_PATH)
#   files_for_class = data.get_files_per_class(files)
  
def test_write_data(zip_path, split_info, to_dir, base_name, files):
  
  files_for_class = data.get_files_per_class(files(zip_path))
  for split_name, split_count in split_info.items():
    split_info[split_name] = int(split_count*len(files_for_class['Neg']))
  

  paths = data.write_data(zip_path, 
                          split_info=split_info, 
                          to_dir=to_dir, base_name=base_name)

  assert to_dir.is_dir()
  for dir in glob.glob(str(to_dir)):
    assert pathlib.Path(dir).is_dir()
    for subdir in glob.glob(dir + '/*'):
      assert pathlib.Path(subdir).is_dir()
  
  

# @pytest.mark.parametrize(
#   'path, n_frames, image_size',
#   [
#     (pathlib.Path('back/data/frissewind/train'), None, (28, 28)),
#     (pathlib.Path('back/data/frissewind_eval/val'), None, (32, 32)),
#     (pathlib.Path('back/data/frissewind_eval/test'), None, (32, 32))
#   ]
# )
# def test_FrameGen(path, n_frames, image_size):
#   mock_gen = data.FrameGen(path, n_frames, image_size=image_size)
  
#   frame, label = next(mock_gen())
  
#   image_shape = image_size + (3,)
  
#   assert isinstance(frame, np.ndarray)
#   assert isinstance(label, int)
#   assert 1 >= label >= 0
#   assert frame.shape == image_shape

def test_scale():
  example = np.random.rand(28, 28, 3)
  
  scaled, y = data.scale(example, 1)
  max = np.max(scaled)
  min = np.min(scaled)
  
  assert float(min) >= 0.
  assert float(max) <= 256.
  assert y == 1
  
@pytest.mark.parametrize(
  'train_size, val_size, resample, test_fallback',
  [(1.0, 1.0, False, False), (1.0, 0.2, False, True)]
)
def test_get_data_paths(train_size, val_size, resample, test_fallback):
  
  if not resample and test_fallback:
    shutil.rmtree('back/data/frissewind')
    shutil.rmtree('back/data/frissewind_eval')
  
  paths, eval_paths = data.get_data_paths(train_size=train_size, 
                                          val_size=val_size,
                                          resample=resample)
  for ret in [eval_paths, paths]:
    for path in list(ret.values()):
      assert isinstance(path, pathlib.PosixPath)
  

# @pytest.mark.parametrize(
#   'val_size',
#   [(0.8), (1.0)]
# )
# def test_get_datasets(val_size):
  
#   train, val = None, None

#   if val_size < 1.:
#     train, val, test = data.get_datasets(train_size=0.1, val_size=val_size)
#     datasets = [train, val, test]
#   elif val_size == 1.:
#     with pytest.raises(Exception):
#       train, val, test = data.get_datasets(train_size=0.1, val_size=val_size)
      
#     train, val  = data.get_datasets(train_size=0.1, val_size=val_size)
#     datasets = [train, val]

#   for ds in datasets:
#     assert isinstance(ds, tf.data.Dataset)
    
def test_get_image_paths():
  
  image_dir = data.get_image_paths('back/data/frissewind_eval/val')
  
  assert (image_dir).is_dir() 
  assert len(list(image_dir.glob('*/*.jpg'))) > 0
  
def test_write_tfrecords():
  
  image_dir = 'back/data/frissewind_eval/val/images'
  
  record_file = data.write_tfrecords(image_dir)
  
  assert pathlib.Path(record_file).is_file()

@pytest.mark.parametrize(
  'resample, check_dir, image_size', [
    (True, 'frissewind_eval/val', (256, 256)),
    (False, 'frissewind/train', (224, 224))
  ]
)
def test_get_datasets(resample, check_dir, image_size): 
  
  train_ds, val_ds = data.get_datasets(0.01, val_size=0.02, resample=resample,
                                       image_size=image_size)
  
  data_dir = pathlib.Path('back/data')
  assert data_dir.is_dir()
  assert len(list(data_dir.glob('*/'))) > 0
  assert len(list(data_dir.glob('*/*/'))) > 0
  
  assert pathlib.Path(data_dir, check_dir, 'images', 'images.tfrecords').is_file()
  
  datasets = [train_ds, val_ds]
  
  for ds in datasets:
    assert isinstance(ds, tf.data.Dataset)
    assert ds.element_spec[0].shape == [None, image_size[0], image_size[1], 3]
  
  
  