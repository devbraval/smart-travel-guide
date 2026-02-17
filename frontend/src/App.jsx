import DeshBoard from "./DashBoard";
import Login from "./Login";
import Signup from "./Signup";
import Otp from "./Otp";
import ResetPassword from "./ResetPassword";
import NavBar from "./NavBar";
import VerifyResetOtp from "./VerifyResetOtp";
import ForgotPassword from "./ForgotPassword";
import SearchPage from "./SearchPlace";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>



      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* MAIN */}
        <Route path="/dashboard" element={<DeshBoard />} />

        {/* SEARCH PAGE */}
        <Route path="/search" element={<SearchPage />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
