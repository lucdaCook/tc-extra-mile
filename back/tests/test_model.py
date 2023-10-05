import back.scripts.model as model
import pytest
import numpy as np
import tensorflow as tf

def test_make_custom_model():
  input_shape = model.models['custom'].img_shape
  custom_model = model.make_custom_model(input_shape=input_shape)
  assert custom_model.name == 'custom'
  tf.debugging.assert_equal(custom_model.input.shape[1:], input_shape)
  
@pytest.mark.parametrize(
  'model_name, lr',
  [
    ('mobilevit_xxs', 1e-5),
    ('custom', None),
    ('error', 100)
  ]
)
def test_get_compiled_model(model_name, lr):
  if 'error' in model_name:
    with pytest.raises(Exception):
      model.get_compiled_model(model_name, lr)
  compiled_model = model.get_compiled_model(model_name, lr)
  if lr is None:
    lr = model.models[model_name].learning_rate
    np.testing.assert_almost_equal(compiled_model.optimizer.learning_rate.numpy(), lr)
  else:
    np.testing.assert_almost_equal(compiled_model.optimizer.learning_rate.numpy(), lr)
  
  
  assert isinstance(compiled_model, tf.keras.Model)
  
      