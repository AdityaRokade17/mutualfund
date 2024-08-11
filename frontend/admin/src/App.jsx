import './App.css'
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 

import Login from './components/Login';
import DashBoard from './components/DashBoard';

import TestingDashBoard from "./TestingComponents/TestingDashBoard"
import RegisterSubprofile from './components/RegisterSubprofile';
import PrivateRoute from './components/PrivateRoute';
import SubprofileList from "./components/SubprofileList"

import withLoader from './components/withLoader';

const TestingDashBoardWithLoader = withLoader(TestingDashBoard);
const RegisterSubprofileWithLoader = withLoader(RegisterSubprofile);
const SubprofileListWithLoader = withLoader(SubprofileList);
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute element={<TestingDashBoardWithLoader />} />} />
      <Route path="/register-subprofile" element={<PrivateRoute element={<RegisterSubprofileWithLoader />} />} />
      <Route path="/subprofiles" element={<PrivateRoute element={<SubprofileListWithLoader />} />} />
    </Routes>
    <ToastContainer />
    </>
  )
}

export default App
