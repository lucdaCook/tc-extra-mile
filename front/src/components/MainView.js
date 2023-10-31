import React from 'react';
import { CloudsContext } from "../contexts/CloudsContext";
import { TataBackground, Trees } from "../svg/clouds";
import SkyView from "./SkyView";
import { useCallback, useContext, useEffect } from 'react';
import { useBeforeUnload, useLocation } from 'react-router-dom';
import backgroundImage from '../svg/background.png';
import './MainView.css'; // Import your CSS file if needed

function MainView({ setCtaFocus }) {

  const loc = useLocation()
  const { tata, setTata } = useContext(CloudsContext);
  
  useEffect(() => {
    console.log(loc)
  }, [loc])

  useBeforeUnload(
    useCallback(() => {
      if (tata === true) {
        localStorage.setItem('showTata', true);
      } else {
        localStorage.setItem('showTata', false);
      }
    }, [tata])
  );

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('showTata')) === true) {
      setTata(true);
    } else {
      setTata(false);
    }
  }, []);

  return (
      <main className='main-view'>
             <div style={{ 
                backgroundImage: `url(${backgroundImage})`, 
                backgroundSize: 'cover', 
                backgroundRepeat: 'no-repeat',
                height: '100v%', 
                width: '100vw'     
              }}>    
            { loc.pathname === '/' &&
          <div style={{'display': 'grid'}}>
            <div className="center-container">
              <h1 className="greenpeace-header">Help Us Detect Toxic Clouds</h1>
              <p className="greenpeace-paragraph">Join Greenpeace, FrisseWind.nu, and FruitPunch AI in the 'Spot the Poison Cloud' initiative. Help us use cutting-edge artificial intelligence to identify toxic emissions from Tata Steel and make the world a safer place.</p>
              <button 
              className="cta-button" 
              onClick={() => setCtaFocus(true)}
              style={{'pointerEvents': 'all', zIndex: '11'}}
              >Join the Mission!</button>
            </div>
          </div>
          }
          <div className='bottom-panel'>
          </div>
        </div>
      </main>
  )
}

export default MainView;
