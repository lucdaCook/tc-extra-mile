from api.main.router import bp 

@bp.route('/')
def home():
  return 'This is the base route'
  
  
  