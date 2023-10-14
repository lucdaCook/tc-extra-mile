import { useActionData } from 'react-router-dom'

export default function YoutubeUploader() { 

  let uploadInfo = useActionData()
  uploadInfo = JSON.parse(uploadInfo.get('upload'))

  const getDefaultName = (name) => {

    const idx = name.lastIndexOf('_')
    const before = name.slice(0, idx)

    const after = name.slice(idx + 2, name.length)
    
    return before + after
  }
  console.log(uploadInfo)

  const uploadLink = undefined

  return (
    <>
    <form action={uploadLink}>
      <input type='text'
      name='title'
      // defaultValue={getDefaultName(captureInfo.written[0])}
      />
    </form>
    <div className='video-preview upload-video'>
      <video src={`${process.env.REACT_APP_SERVER}/model/${uploadInfo.written[0]}`} controls>
      </video>
    </div>
  </>
  )
}