import {createBrowserRouter} from 'react-router-dom';

// Pages
import Layout from '../components/layout/Layout';

import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UnauthorizedPage from '../pages/Unauthorized';
import WhyKanavoogle from '../pages/WhyKanavoogle';

import StudentPage from "../pages/student/StudentPage";
import StudentHome from '../pages/student/StudentHome';
import StudentRequestSkill from '../pages/student/StudentRequestSkill';
import DigitalSkillWallet from '../pages/student/DigitalSkillWallet';

import SchoolPage from "../pages/school/SchoolPage";
import SchoolHome from '../pages/school/SchoolHome';
import SchoolVerifySkill from '../pages/school/SchoolVerifySkill';
import SchoolCreateCourse from '../pages/school/SchoolCreateCourse';

import EmployerPage from "../pages/employer/EmployerPage";
import EmployerHome from '../pages/employer/EmployerHome';

import AdminPage from "../pages/AdminPage";
import SyncUserDocPage from "../pages/SyncUserDocPage";
import RedirectByRole from "../components/auth/RedirectByRole";

import ErrorPage from '../pages/ErrorPage';





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
         
      ]},

      {path: "digital-skill-wallet", element: <DigitalSkillWallet />},    
      
      {path: "school",
       element: <SchoolPage />,
       children: [
        {index: true, element: <SchoolHome />},
        {path: "verify-skill", element: <SchoolVerifySkill />},
        {path: "create-course", element: <SchoolCreateCourse />},
       ]},
  
      {path: "employer",
       element: <EmployerPage />,
       children:[
        {index: true, element: <EmployerHome />},
      ]},

      
      {path: "admin", element: <AdminPage />},
      {path: "sync", element: <SyncUserDocPage />},
      {path: "redirect", element: <RedirectByRole />},

      // 404 fallback
      {path: "*", element: <ErrorPage />}
    ]
  }
]);

export default AppRouter;