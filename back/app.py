from flask import Flask
from flask import Blueprint

def create_app():
  app = Flask(__file__)
  
  from api.main.routes import bp as main_bp
  app.register_blueprint(main_bp)
  
  from api.model.router import bp as model_bp
  app.register_blueprint(model_bp, url_prefix='/model')
  
  @app.route('/test/')
  def test_app():
    return '<h3>Hi Scripts!</h3>'
  
  return app

bp = Blueprint('main', __name__)
