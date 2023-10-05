import os
import tensorflow as tf
from tensorflow import keras
from back.scripts.data import get_datasets
from back.scripts.model import get_compiled_model, models
import back.config.config as cfg
import mlflow
import mlflow.tensorflow
import pathlib

class MlflowLogger(keras.callbacks.Callback): #pragma: no cover, mlflow logging
  def on_epoch_end(self, epoch, logs=None):
    for m in logs:
      mlflow.log_metric(str(m), logs[m])

def train(model_name:str,
          n_epochs:int,
          resample:bool=True, 
          train_size:float=1.0, 
          val_size:float=0.8, 
          save_model:bool=True,
          reduce_lr:bool=True,
          stop_monitor:bool=True,
          lr_patience:int=5,
          stopping_patience:int=7,
          experiment_name:str=None): 
  
  image_size = models[model_name].img_shape[:-1]
  
  train_ds, val_ds,  = get_datasets(train_size=train_size, 
                                     val_size=val_size, 
                                     resample=resample,
                                     image_size=image_size)
  if save_model:
    checkpoint_dir = f'{cfg.MODEL_REGISTRY_DIR}/{model_name}/'
    
    pathlib.Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)
    
    saved_model_increment = len(os.listdir(checkpoint_dir)) + 1
    
    checkpoint_file = f'{checkpoint_dir}/{experiment_name if experiment_name else str(saved_model_increment)}'
  
  with mlflow.start_run(experiment_id=experiment_name if experiment_name\
                        else f'{model_name}_{str(saved_model_increment)}'):
    
    model = get_compiled_model(model_name=model_name)
    
    callbacks = [
      MlflowLogger()
    ]
    
    if save_model:  
      model_checkpoint = keras.callbacks.ModelCheckpoint(filepath=checkpoint_file,
                                                         monitor='val_loss', 
                                                         save_best_only=True, verbose=0)
      
      callbacks.append(model_checkpoint)
      
      mlflow.log_param('checkpoint location', checkpoint_file)
    
    if stop_monitor:
      early_stopping = keras.callbacks.EarlyStopping(patience=stopping_patience, monitor='val_loss',
                                                     restore_best_weights=True)
      callbacks.append(early_stopping)
      
    if reduce_lr:
      lr_schedule = keras.callbacks.ReduceLROnPlateau(patience=lr_patience, monitor='val_loss',
                                                      factor=0.3, cooldown=3, min_lr=1e-4)
      callbacks.append(lr_schedule)
    
    fit = model.fit(train_ds,
                    validation_data=val_ds,
                    epochs=n_epochs,
                    callbacks = callbacks)
    
  return fit
  