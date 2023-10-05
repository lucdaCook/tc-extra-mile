import back.config.config as cfg
from tensorflow import keras
import logging
from typing import Any
import tensorflow as tf
import tensorflow_hub as hub
from pydantic import BaseModel
import logging


METRICS = [
  keras.metrics.BinaryAccuracy(name='accuracy'),
  keras.metrics.MeanSquaredError(name='mse'),
  keras.metrics.TruePositives(name='tp'),
  keras.metrics.FalsePositives(name='fp'),
  keras.metrics.TrueNegatives(name='tn'),
  keras.metrics.FalseNegatives(name='fn'),
  keras.metrics.Precision(name='precision'),
  keras.metrics.Recall(name='recall'),
  keras.metrics.AUC(name='auc'),
  keras.metrics.AUC(name='prc', curve='PR')
]

def make_custom_model(input_shape=(cfg.IMAGE_SHAPE)) -> keras.Model:

  input = keras.Input(input_shape)

  x = keras.layers.Conv2D(32, 3, padding='same', strides=2)(input)
  x = keras.layers.ReLU()(x)
  
  x = keras.layers.Conv2D(32, 3, padding='same', strides=2)(x)
  b = keras.layers.ReLU()(x)

  x = keras.layers.Conv2D(32, 3, padding='same')(b)
  x = keras.layers.ReLU()(x)

  x = keras.layers.add([b, x])

  x = keras.layers.Conv2D(32, 3, padding='same')(x)
  b = keras.layers.ReLU()(x)

  x = keras.layers.Conv2D(32, 3, padding='same')(b)
  x = keras.layers.ReLU()(x)

  x = keras.layers.add([b, x])

  x = keras.layers.Conv2D(32, 3, padding='same', strides=2)(x)
  b = keras.layers.ReLU()(x)
  b = keras.layers.SpatialDropout2D(0.4)(b)

  x = keras.layers.Conv2D(32, 3, padding='same')(b)
  x = keras.layers.ReLU()(x)

  x = keras.layers.SpatialDropout2D(0.4)(x)
  
  x = keras.layers.add([b,x])

  x = keras.layers.Conv2D(64, 3, padding='same')(x)
  x = keras.layers.ReLU()(x)

  model = keras.Model(input, x, name='custom')
    
  return model

class ModelToken(BaseModel):
  token: Any
  img_shape: tuple
  preprocessor: Any
  pretrained: bool
  learning_rate: float

models = {
  
  'mobilevit_xxs': ModelToken(
    token=hub.KerasLayer('https://tfhub.dev/sayannath/mobilevit_xxs_1k_256_fe/1',
                         trainable = True),
    img_shape = (256, 256, 3), preprocessor = tf.keras.layers.Rescaling(1./255), 
    pretrained = True, learning_rate=1e-5
  ),
  
  'mobilenet_v2_0.5': ModelToken(
    token=tf.keras.applications.MobileNetV2(include_top=False, input_shape=(224, 224, 3), alpha=0.5),
    img_shape = (224, 224, 3), preprocessor = tf.keras.applications.mobilenet_v2.preprocess_input,
    pretrained = True, learning_rate=1e-5
  ),
  
  'custom': ModelToken(
    token = make_custom_model(),
    img_shape = cfg.IMAGE_SHAPE,
    preprocessor = tf.keras.layers.Rescaling(1./127.5, offset=-1),
    pretrained = False, learning_rate=1e-3
  ),
  
}

def compile_model(model:keras.Model, 
                  learning_rate:float=None,
                  optimizer=keras.optimizers.Adam(), 
                  metrics:list=METRICS):
  
  if learning_rate:
    optimizer.learning_rate.assign(learning_rate)
  
  model.compile(optimizer=optimizer,
                loss=keras.losses.BinaryCrossentropy(),
                metrics=METRICS)

def get_compiled_model(model_name:str='mobilevit_xxs',
                      learning_rate:float=None) -> keras.Model:
  
  if model_name not in models:
    raise KeyError(f"Unable to find a model with the name `{model_name}`. Please use one of the valid model names: {[name for name in models]}")
  
  logging.info(f'Serializing and compiling {model_name} model...')
  
  base_model_config = models[model_name]
  
  base_model = base_model_config.token
  
  input = keras.Input(base_model_config.img_shape)
  
  preprocessor = base_model_config.preprocessor
  
  x = preprocessor(input)
  
  if base_model_config.pretrained:
    x = base_model(x, training=False)
  else:
    x = base_model(x)
    
  x = keras.layers.GlobalAveragePooling2D()(x)
  x = keras.layers.Dense(1, activation='sigmoid')(x)
  
  model = keras.Model(input, x, name=model_name)
  
  if learning_rate is None:
    compile_model(model, learning_rate=base_model_config.learning_rate)
  else:
    compile_model(model, learning_rate=learning_rate)
    
  model.summary(print_fn=logging.info)
  
  return model

#TODO figure out model tracking and how to query the best model
