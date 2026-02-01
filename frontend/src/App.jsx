import DeshBoard from "./DashBoard";
import Login from "./Login";
import Signup from "./Signup";
import Otp from "./Otp";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import ResetPassword from "./ResetPassword"
import NavBar from "./NavBar";
import VerifyResetOtp from "./VerifyResetOtp";
import ForgotPassword from "./ForgotPassword";

function App() {
  

  return (
    <>
     <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/otp" element={<Otp/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/verify-reset-otp" element={<VerifyResetOtp/>}/>
      <Route path="/reset-password" element={<ResetPassword/>}/>
      <Route path="/dashboard" element={<DeshBoard />} />
    </Routes>
    </BrowserRouter>  
    
   
    </>
  )
}

export default App;
