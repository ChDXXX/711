import {createBrowserRouter} from 'react-router-dom';

// Pages
import Layout from '../components/layout/Layout';

import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UnauthorizedPage from '../pages/Unauthorized';
import WhyKanavoogle from '../pages/WhyKanavoogle';

import StudentPage from "../pages/StudentPage";
import StudentHome from '../pages/StudentHome';
import StudentRequestSkill from '../pages/StudentRequestSkill';
import DigitalSkillWallet from '../pages/DigitalSkillWallet';

import SchoolPage from "../pages/SchoolPage";

import SchoolVerifySkill from '../pages/SchoolVerifySkill';

import EmployerPage from "../pages/EmployerPage";
import AdminPage from "../pages/AdminPage";
import SyncUserDocPage from "../pages/SyncUserDocPage";
import RedirectByRole from "../components/auth/RedirectByRole";

import ErrorPage from '../pages/ErrorPage';
import SchoolHome from '../pages/SchoolHome';




const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {index: true, element: <HomePage />},
      {path: "register", element: <Register />},
      {path: "login", element: <Login />},
      {path: "unauthorized", element: <UnauthorizedPage />},
      {path: "why-kanavoogle", element: <WhyKanavoogle />},

      // Role pages
      {path: "student",
      element: <StudentPage />,
      children:[
        {index: true, element: <StudentHome />},
        {path: "request-skill", element: <StudentRequestSkill />},
        {path: "digital-skill-wallet", element: <DigitalSkillWallet />}, 
      ]},      
      
      

      {path: "school",
       element: <SchoolPage />,
       children: [
        {index: true, element: <SchoolHome />},
        {path: "verify-skill", element: <SchoolVerifySkill />},
       ]},



      
      {path: "employer", element: <EmployerPage />},
      {path: "admin", element: <AdminPage />},
      {path: "sync", element: <SyncUserDocPage />},
      {path: "redirect", element: <RedirectByRole />},

      // 404 fallback
      {path: "*", element: <ErrorPage />}
    ]
  }
]);

export default AppRouter;