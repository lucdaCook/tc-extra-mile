import pathlib
import os
from dotenv import load_dotenv
import logging

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

BASE_DIR = pathlib.Path(__file__).parent.parent.absolute()

MODEL_REGISTRY_DIR = pathlib.Path(BASE_DIR, 'models/')
MODEL_REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
MLFLOW_TRACKING_URI = 'file://' + str(MODEL_REGISTRY_DIR.absolute())

IMAGE_SIZE = (256, 256,)
IMAGE_SHAPE = IMAGE_SIZE+(3,)

load_dotenv()
 
ZIP_PATH = pathlib.Path(BASE_DIR, 'data/' + str(os.environ.get('ZIP_PATH')))
EVAL_ZIP_PATH = pathlib.Path(BASE_DIR, 'data/' + str(os.environ.get('EVAL_ZIP_PATH')))


logging.basicConfig(level=logging.INFO)
