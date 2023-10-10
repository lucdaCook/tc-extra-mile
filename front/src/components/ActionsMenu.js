import CamIcon from "../svg/CamIcon";
import { Link } from "react-router-dom"


export default function ActionsMenu() {


  return (
    <div className='actions-popup panel'>
      <div className='actions-main'>
          <Link to='/extract'>
            <div>
              <span><CamIcon/></span>
            </div>
          </Link>
        <div><span>Hey</span></div>
        <div><span>Hey</span></div>
      </div>
    <div className='actions-popup rows'></div>
  </div>
  )
}