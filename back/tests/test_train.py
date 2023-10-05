import pytest
from back.scripts.train import train
import pathlib
import tensorflow as tf
import back.config.config as cfg

@pytest.mark.usefixtures('remove_test_experiment')
@pytest.mark.skipif(
  not tf.config.list_physical_devices('GPU'),
  reason="GPU needed in order to test Trainer"
)
@pytest.mark.training
@pytest.mark.parametrize(
  'model_name, experiment_name, max_loss, min_acc, save_model',
  [
    ('mobilevit_xxs', 'testing', 0.46, 0.8, True),
  #  ('mobilenet_v2_0.5', 0.51, 0.8),
  #  ('custom', 0.51, 0.75)
   ]
)
def test_train(model_name, experiment_name, max_loss, min_acc, save_model):
  history = train(model_name=model_name, n_epochs=15, save_model=True)
  
  assert history 
  
  assert history.history['val_loss'][1] < history.history['val_loss'][0] # loss decreases after 1 epoch
  
  assert min(history.history['val_loss']) <= max_loss
  assert max(history.history['val_accuracy']) >= min_acc
  
  if save_model:
    assert pathlib.Path(f'{cfg.MODEL_REGISTRY_DIR}/{model_name}/{experiment_name}').is_dir()
  
