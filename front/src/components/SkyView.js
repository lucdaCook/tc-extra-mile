import FloatingCloud from "./FloatingCloud"


export default function SkyView() {
  return (
    <div className='sky-view'>
     <FloatingCloud cloud_num={'cloud-1'}/> 
     <FloatingCloud cloud_num='cloud-2' />
    </div> 
  )
}