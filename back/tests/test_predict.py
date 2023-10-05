import pytest 
import back.scripts.predict as predict
import pathlib
import cv2
import numpy as np
import os

@pytest.mark.parametrize(
  'video, new_size, output_dir',
  [
    ('back/tests/testing_clips/negative_clip.mp4', (256, 256), 'back/tests/testing_clips/downsampled')
  ]
)
def test_downsample(video, new_size, output_dir):
  
  downsampled_vid = predict.downsample(video, new_size=new_size, output_dir=output_dir)
  
  video_name = pathlib.Path(video).name
  
  cap = cv2.VideoCapture(f'{output_dir}/{video_name}')
  height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
  width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
  
  assert pathlib.Path(downsampled_vid).is_file()
  assert (height, width) == new_size
  
@pytest.mark.parametrize(
  'video, output_filename, output_dir, n_frames_to_extract, toxic, write_size',
  [
    (
      'back/tests/testing_clips/negative_clip.mp4', 'on_negative_clip', 
      'tests/testing_clips/predictions/', 8, False, (28, 28) 
    ),
    (
      'back/tests/testing_clips/positive_clip.mp4', 'on_positive_clip', 
      'back/tests/testing_clips/predictions/', 10, True, (512, 512)
    ),
    (
      'back/tests/testing_clips/prediction_clip.mp4', 'on_predict_clip', 
      'back/tests/testing_clips/predictions', 7, None, (32, 32)
    )
  ]
)
def test_predict_on_video(video, output_filename, output_dir, 
                          n_frames_to_extract, toxic, write_size):
  
  result = predict.predict_on_video(video, model_name='mobilevit_xxs_best_so_far',
                                    n_frames_to_extract=n_frames_to_extract, write_size=write_size,
                                    output_dir=output_dir, output_filename=output_filename)
  if result['captured']:
    assert pathlib.Path(output_dir).is_dir()
    assert len(os.listdir(output_dir)) > 0
    pred_clip = predict.frames_from_prediction_file(f'{output_dir}/{output_filename}_{result["n_captured"]}.mp4')
    assert len(pred_clip) == n_frames_to_extract
    assert pred_clip.shape[1:-1] == write_size
  
  if toxic:
    assert result['captured'] == True
  elif not toxic:
    assert result['captured'] == False

@pytest.mark.parametrize(
  'video_path, output_size',
  [('back/tests/testing_clips/predictions/on_positive_clip_1.mp4', (28, 28))]
)
def test_frames_from_prediction_file(video_path, output_size):
  
  frames = predict.frames_from_prediction_file(video_path=video_path, output_size=output_size)
  assert isinstance(frames, np.ndarray)
  assert frames.shape[1:-1] == (28, 28)

@pytest.mark.usefixtures('remove_test_gif')
def test_capture_to_mpeg():
  out_file = 'test.mp4'
  img = np.random.rand(28, 28, 3)
  img = np.expand_dims(img, 0)
  predict.capture_to_mpeg(img, output_file=out_file, fps=15)
  assert pathlib.Path(out_file).is_file()
