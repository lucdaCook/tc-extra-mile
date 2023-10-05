from flask import Blueprint

bp = Blueprint('model', __name__, template_folder='templates')

from api.model import routes