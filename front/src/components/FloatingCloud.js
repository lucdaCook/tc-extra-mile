



export default function FloatingCloud({ cloud_num }) {
  return (
      <div className='big-cloud' id={cloud_num} > 

        <div className='large-circle circle1'>
          <div className='large-circle circle1-shadow'></div>
        </div>

        <div className='mid-circle circle2'>
          <div className='mid-circle circle2-shadow'></div>
        </div>

        <div className='mid-circle circle3'>
          <div className='mid-cirlce circle3-shadow'></div>
        </div>

        <div className='small-circle circle4'></div>
        <div className='small-circle circle5'>
          <div className='small-circle circle5-shadow'></div>
        </div>

        <div className='small-circle circle6'></div>
          <div className='small-circle circle6-shadow'></div>
      </div>
  )
}