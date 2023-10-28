import pathlib
import os
from dotenv import load_dotenv
import logging
import secrets

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

BASE_DIR = pathlib.Path(__file__).parent.parent.absolute()

MODEL_REGISTRY_DIR = pathlib.Path(BASE_DIR, 'models/')
MODEL_REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
MLFLOW_TRACKING_URI = 'file://' + str(MODEL_REGISTRY_DIR.absolute())

IMAGE_SIZE = (256, 256,)
IMAGE_SHAPE = IMAGE_SIZE+(3,)

load_dotenv('.env', override=True)

 
ZIP_PATH = pathlib.Path(BASE_DIR, 'data/' + str(os.environ.get('ZIP_PATH'))) 
EVAL_ZIP_PATH = pathlib.Path(BASE_DIR, 'data/' + str(os.environ.get('EVAL_ZIP_PATH')))

#oauth 
CLIENT_SECRET_JSON = os.environ.get('CLIENT_SECRET_JSON')
CLIENT_ID = os.environ.get('CLIENT_ID')

REDIRECT_URI = os.environ.get('REDIRECT')

REDIRECT_FRONT=os.environ.get('REDIRECT_FRONT')

SECRET_KEY = secrets.token_hex()
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER')
BROKER_URL = os.environ.get('BROKER_URL')

SCOPES=os.environ.get('USER_SCOPE')
API_SERVICE_NAME = os.environ.get('API_SERVICE_NAME')
API_VERSION = os.environ.get('API_VERSION')


logging.basicConfig(level=logging.INFO)
