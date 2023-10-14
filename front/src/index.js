import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './App';
import ErrorPage from './Error'
import reportWebVitals from './reportWebVitals';
import Library from './components/Library';
import Window from './components/Window';
import CloudsLoader from './components/CloudsLoader';
import CloudLoader from './components/CloudLoader';
import NoCloudsFound from './components/NoCloudsFound';
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from 'react-router-dom'
import YoutubeUploader from './components/YoutubeUploader';

console.log(window.innerWidth, window.innerHeight)
const router = createBrowserRouter([
  {
    path:'/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: () => {
      const code =  new URLSearchParams(window.location.hash).get('access_token')
      if (code !== null) {
        window.history.pushState({}, null, '/')
        console.log(code) 
      }
      return code
    },
    children: [{
      path: 'extract',
      element:<Window many={false}/>,
    }, 
    {
      path: 'extract-many',
      element: <Window many={true}/>,
    },
    {
      path: 'library',
      element: <Library />
    },
    {
      path: 'clouds/:cloudsId',
      element: <CloudsLoader/>,
      loader: ({ params }) => {
        return params.cloudsId
    },
  },
  {
    path: 'cloud/:cloudId',
    element: <CloudLoader />,
    loader: async ({ params }) => {

      const cloudId = params.cloudId
      return cloudId
    },
  },
  {
    path: 'no-clouds',
    element: <NoCloudsFound />,
    loader: () => {
      if (JSON.parse(localStorage.getItem('showTata') === true)) {
        return redirect('/')
      } 
      return null
    }
  },
  {
    path: 'yt',
    children: [
      { index: true, element: <div>Hey Youtube</div>},
    {
      path: 'send',
      element: <YoutubeUploader />,
      action: async ({ request }) => {
        const formData = await request.formData()
        console.log(formData, 'from action')
        return formData
      }
    },
    
  ]
  }
]}
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
