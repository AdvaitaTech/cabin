import 'vite/modulepreload-polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/main.scss'
import Login from './Login'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Register from './Register'
import WritePage from './Writer'

const router = createBrowserRouter([
  {

    path: '/',
    element: <Register />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/write',
    element: <WritePage />
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
