import Root from './App';
import ErrorPage from './Error'
import Library from './components/Library';
import Window from './components/Window';
import CloudsLoader from './components/CloudsLoader';
import CloudLoader from './components/CloudLoader';
import NoCloudsFound from './components/NoCloudsFound';
import {
  redirect,
} from 'react-router-dom'
import YoutubeUploader from './components/YoutubeUploader';
import YoutubeWindow from './components/YoutubeWindow';
import YoutubeAuthorizer from './components/YoutubeAuth';

const routerConf = [
  {
    path:'/',
    element: <Root />,
    errorElement: <ErrorPage notFound={true} />,
    children: [{
      path: 'extract',
      element:<Window many={false}/>,
    }, 
    {
      path: 'extract-many',
      element: <Window many={true}/>,
    },
    {
      path: 'extract-live',
      element: <YoutubeWindow />,
    },
    {
      path: 'library',
      element: <Library />
    },
    {
      path: 'clouds/:cloudsId',
      element: <CloudsLoader />,
      loader: ({ params }) => {
        if (params.cloudId === 'error') {
          return redirect('/error')
        }

        return params.cloudsId
    },
  },
  {
    path: 'cloud/:cloudId',
    element: <CloudLoader />,
    loader: async ({ params }) => {
      const cloudId = await params.cloudId
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
        path: 'auth',
        element: <YoutubeAuthorizer />,
        loader: () => {
          const code =  new URLSearchParams(window.location.hash).get('access_token')
          if (code !== null) {
            window.history.pushState({}, null, '/')
            return code
        } return null
      },
    },
      {
        path: 'send',
        element: <YoutubeUploader />,
        action: async ({ request }) => {
          const formData = await request.formData()
          console.log(formData, 'from action')
          return formData
        },
      },
  ]
  },
  {
    path: 'error',
    element: <ErrorPage notFound={false}/>
  }
]}
]

export default routerConf