import pytest
import back.scripts.utils as utils
import numpy as np
import tensorflow as tf

@pytest.mark.parametrize(
  'frame, out_size',
  [
    (np.random.rand(28, 28, 3), (32, 32)),
  ]
)
def test_format_frames(frame, out_size):
  image = utils.format_frames(frame, output_size=out_size) 
  
  assert tf.is_tensor(image)
  assert image.shape == out_size + (3,) 
  
@pytest.mark.parametrize(
  'video, n_frames, out_shape',
  [
    ('back/tests/testing_clips/negative_clip.mp4', 4, (28, 28)),
    ('back/tests/testing_clips/positive_clip.mp4', None, (32, 32))
  ]
)
def test_frames_from_video_file(video, n_frames, out_shape):
  
  frames = utils.frames_from_video_file(video, n_frames, output_size=out_shape)
  
  if n_frames is None:
    assert len(frames) >= 8
  elif n_frames:
    assert len(frames) == n_frames - 2
     
  
  assert isinstance(frames, np.ndarray)
  assert frames.shape[1:] == out_shape + (3,)
  assert frames.dtype == np.float32
  
  