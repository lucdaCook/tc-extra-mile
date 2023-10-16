import pytest 
import back.scripts.predict as predict
import pathlib
import numpy as np
import os

@pytest.mark.parametrize(
  'video, new_size',
  [
    ('back/tests/testing_clips/negative_clip.mp4', (256, 256))
  ]
)
def test_downsample(video, new_size):
  
  downsampled_vid, vid_info = predict.downsample(video, new_size=new_size,
                                                 n_frames_to_extract=8)
  
  assert downsampled_vid.shape[1:-1] == new_size
  assert isinstance(vid_info, dict)
  
  assert vid_info.keys() >= {'frame_step', 
                             'n_frames', 
                             'frames_slice', 
                             'n_extractable_frames'}
  

  
  
@pytest.mark.parametrize(
  'video, output_dir, n_frames_to_extract, toxic',
  [
    (
      'back/tests/testing_clips/negative_clip.mp4', 
      'tests/testing_clips/predictions/', 8, False
    ),
    (
      'back/tests/testing_clips/positive_clip.mp4', 
      'back/tests/testing_clips/predictions/', 10, True
    ),
    (
      'back/tests/testing_clips/prediction_clip.mp4', 
      'back/tests/testing_clips/predictions', 7, True,
    )
  ]
)
def test_predict_on_video(video, output_dir, 
                          n_frames_to_extract, toxic):
  
  
  result = predict.predict_on_video(video, model_name='mobilevit_xxs_vl35',
                                    n_frames_to_extract=n_frames_to_extract,
                                    out_location=output_dir)
  if result['captured']:
    output_filename = pathlib.Path(video).stem
    assert pathlib.Path(output_dir).is_dir()
    assert len(os.listdir(output_dir)) > 0
    mock_frames = list(range(26))
    mock_clip = predict.video_from_predictions(f'{output_dir}/{output_filename}_{result["n_captured"]}.mp4', 
                                                  mock_frames)
    assert len(mock_clip) >= len(mock_frames)
      
  if toxic:
    assert result['captured'] == True

def test_capture_to_mpeg():
  out_file = 'test.mp4'
  img = np.random.rand(28, 28, 3)
  img = np.expand_dims(img, 0)
  predict.capture_to_mpeg(img, output_file=out_file, fps=15)
  assert pathlib.Path(out_file).is_file()
  
  pathlib.Path(out_file).unlink()
