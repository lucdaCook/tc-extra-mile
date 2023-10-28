import pytest
from back.scripts.model import models
import back.scripts.data as data
import shutil
import pathlib
    
def pytest_addoption(parser):
  parser.addoption(
    '--persist_files', default=False, action='store', 
    help='True or False: Whether or not to delete the resulting files/videos from testing'
 )
  
  parser.addoption('--model', action='store', default = None, 
                   help=f'Name of model to train. One of {[name for name in models]}')

@pytest.fixture
def remove_test_experiment():
  def _remove_test_exp(exp_dir):
    shutil.rmtree(exp_dir)
  return _remove_test_exp
  
@pytest.fixture
def model_name(request):
  return request.config.getoption('--model')

#data
@pytest.fixture
def files(tmp_path):
  def _files(zip_path):
    return data.list_files_from_zip(zip_path)
  return _files

@pytest.fixture
def files_per_class():
  def _files_per_class(path):
    files = files(path)
    return data.get_files_per_class(files)
  return _files_per_class

#cleanup
@pytest.fixture(scope="session", autouse=True)
def remove_tested_dirs(request):
  yield remove_tested_dirs
  if request.config.getoption('--persist_files') is False:
    if pathlib.Path('back/data/frissewind').is_dir() and pathlib.Path('back/data/frissewind_eval').is_dir():
      shutil.rmtree('back/data/frissewind')
      shutil.rmtree('back/data/frissewind_eval')

@pytest.fixture(scope='session', autouse=True)
def clean_files(request):
  yield clean_files
  if request.config.getoption('--persist_files') is False:
    locations = ['back/tests/testing_clips/predictions', 'back/tests/testing_clips/downsampled']
    for location in locations:
      location = pathlib.Path(location)
      if location.is_dir():
        shutil.rmtree(str(location))
      elif location.is_file():
        location.unlink()
  
  
  