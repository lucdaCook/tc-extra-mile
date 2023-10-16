// import { CloudIcon } from '../svg/CloudIcon.js'
// import { Link } from 'react-router-dom'
// import { LibraryIcon } from '../svg/LibraryIcon.js'
// import { YtIcon } from '../svg/YtIcon.js'
// import { CloudSearchIcon, FactoryIcon, TwoClouds } from '../svg/clouds.js'

// export default function Sidebar() {
  
//   return (
//       <div className='sidebar controller'>
//           <div className='sidebar-list wrapper'>
//             <ul className='sidebar-list'>
//               <li key='extract' className='sidebar-item'>
//                   <button className='sidebar-btn actions'>
//                       <CloudIcon />
//                       <div className='actions-after' >
//                         <div className='actions-main'>
//                         <Link  to='/extract' className='actions main-link'>
//                           <CloudSearchIcon /> 
//                         </Link>
//                         <Link className='actions main-link'>
//                           <TwoClouds />
//                         </Link>
//                         <Link className='actions main-link'>
//                           <FactoryIcon />
//                         </Link>
//                       </div>
//                         <div className='quick-actions rows'>
//                           <Link>Hey</Link>
//                           <a>Hey</a>
//                           <a>Hey</a>
//                           <a>Hey</a>
//                         </div>
//                     </div>
//                   </button>
//             </li>
//             <li key='library' className='sidebar-item'>
//               <button className='sidebar-btn'>
//                   <Link to='/library' className='sidebar-link'>
//                     <LibraryIcon>
//                     </LibraryIcon>
//                   </Link>
//                 </button>
//               </li>
//               </ul>
//           </div>
//           <div className='yt-link'>
//             <form method='get' action={`${process.env.REACT_APP_SERVER}/authorize`}>
//               <input type='submit' name='submit' className='auth-input'/>
//                 <button className='sidebar-btn actions-btn'>
//                   <YtIcon></YtIcon>
//                 </button>
//             </form>
//           </div>
//       </div>
//   )
// }