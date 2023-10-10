from flask import Blueprint

bp = Blueprint('yt', __name__)

from api.youtube import routes