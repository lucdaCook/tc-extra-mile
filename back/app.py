from flask import Flask
from flask import Blueprint
import config.config as cfg

from flask_cors import CORS
def create_app():
  
  app = Flask(__file__)
  app.config['CORS_HEADERS'] = 'Content-Type'
  
  CORS(app)
  
  
  app.secret_key = cfg.SECRET_KEY
  
  from api.main.routes import bp as main_bp
  app.register_blueprint(main_bp, url_prefix='/')
  
  from api.model.router import bp as model_bp
  app.register_blueprint(model_bp, url_prefix='/model')
  
  @app.route('/test/')
  def test_app():
    return '<h3>Hi Scripts!</h3>' 
  
  return app

bp = Blueprint('main', __name__)
