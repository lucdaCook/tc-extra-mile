import { Outlet } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import MainView from './components/MainView';
import Topbar from './components/Topbar';

function Root() {
  console.log(process.env.REACT_APP_SERVER)

  const [ ctaFocus, setCtaFocus ] = useState(false)

  return (
    <div className='_Root'>
          <div className='root main-grid'>
            <Topbar ctaFocus={ctaFocus} setCtaFocus={setCtaFocus}>
            </Topbar>
            <MainView setCtaFocus={setCtaFocus}>
            </MainView>
            <div 
              className='outlet-refresh'>
              <Outlet />
            </div>
          </div>
        </div>
  );
}

export default Root; 
