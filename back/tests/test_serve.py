import back.scripts.serve as serve
import pytest
import datetime
import back.api.model.gvar as gvar

@pytest.mark.parametrize(
  'stream, model_name, persistence, mock_abort',
  [
    ('https://www.youtube.com/watch?v=8QJfCyoXXnM',
     'mobilevit_xxs_tfr_nopreproc_vl39', 0.002, False),
    ('https://www.youtube.com/watch?v=8QJfCyoXXnM',
      'mobilevit_xxs_tfr_nopreproc_vl39', None, True)
  ]
)
def test_predict_on_stream(stream, model_name,
                           persistence, mock_abort):
  
  if persistence is not None:
    start = datetime.datetime.now()
    
    ret = serve.predict_on_stream(stream, 
                                  model_name=model_name, 
                                  persistence=persistence)
    
    delta = datetime.datetime.now() - start
    
    assert delta.total_seconds() < 30
    assert ret['status'] == 300
    
  if mock_abort: 
    gvar.abort = ['True']
    ret = serve.predict_on_stream(stream,
                                  model_name=model_name)
    assert ret['status'] == 205
    gvar.abort = ['False']
    
  
    
  
  
  