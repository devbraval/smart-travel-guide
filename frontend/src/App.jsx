import DeshBoard from "./DashBoard";
import Login from "./Login";
import Signup from "./Signup";
import Otp from "./Otp";
import ResetPassword from "./ResetPassword";
import NavBar from "./NavBar";
import VerifyResetOtp from "./VerifyResetOtp";
import ForgotPassword from "./ForgotPassword";
import "leaflet/dist/leaflet.css";
import SearchPage from "./SearchPlace";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Detail from "./Detail";
import AddListing from "./AddListing";
import Edit from "./Edit";
import Comments from "./Comments";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<DeshBoard />} />
        <Route path="/place/:id" element={<Detail />}/>

        <Route path="/search" element={<SearchPage />} />
        <Route path="/add-place" element={<AddListing/>}/>
        <Route path="/edit-place/:id" element={<Edit/>}/>
        <Route path="/add-comments/:id" element={<Comments/>}/>
      </Routes>

    </BrowserRouter>
    
  );
}

export default App;
