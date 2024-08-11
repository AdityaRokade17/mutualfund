import './App.css'
import { Routes, Route } from 'react-router-dom';
import LeadForm from './components/LeadForm';
import { ToastContainer } from 'react-toastify'; 

function App() {

  return (
        <>
        <Routes>
                <Route path="/" element={<LeadForm/>}/>
            </Routes>
            <ToastContainer />
        </>

  )
}

export default App
