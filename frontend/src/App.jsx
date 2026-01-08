import DeshBoard from "./DeshBoard";
import Login from "./Login";
import Signup from "./Signup";
import Otp from "./Otp";
import {BrowserRouter,Routes,Route} from "react-router-dom";

function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/otp" element={<Otp/>}/>
      <Route path="/DeshBoard" element={<DeshBoard/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;
