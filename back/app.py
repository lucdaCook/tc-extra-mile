from flask import Flask
from flask import Blueprint
import config.config as cfg
import pathlib

from flask_cors import CORS
def create_app():
  
  app = Flask(__file__)
  app.config['CORS_HEADERS'] = 'Content-Type'
  app.config['UPLOAD_FOLDER'] = cfg.UPLOAD_FOLDER
  pathlib.Path(cfg.UPLOAD_FOLDER).mkdir(exist_ok=True, parents=True)

  CORS(app)
  
  app.secret_key = cfg.SECRET_KEY
  
  app.add_url_rule(
    '/model/extract/<id>', endpoint='model.downlod', build_only=True
  )
  
  from api.main.routes import bp as main_bp
  app.register_blueprint(main_bp, url_prefix='/')
  
  from api.model.router import bp as model_bp
  app.register_blueprint(model_bp, url_prefix='/model')
  
  from api.youtube.router import bp as youtube_bp
  app.register_blueprint(youtube_bp, url_prefix='/yt')
  
  @app.route('/test/')
  def test_app():
    return 'hello' 
  
  return app

bp = Blueprint('main', __name__)
