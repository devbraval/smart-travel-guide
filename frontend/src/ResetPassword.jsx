import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from './Alert';
import logo from "./assets/newhdlogo.png";
import { useState } from 'react';
import "./ResetPassword.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";



export default function ResetPassword(){
  const [showPassword,setShowPassword] = useState(false);
  const [password,setPassword] = useState("");
  const [confirmPass,setConfirmPass] = useState("");
  const [alert,setAlert] = useState({
    type:"",
    message:"",
  });
  function togglePassword(){
    setShowPassword(!showPassword);
  }
  const showAlert = (type,message)=>{
    setAlert(type,message);
    setTimeout(()=>{
      setAlert({
        type:"",
        message:"",
      });
    },3000);
  }
  const handleResetPassword = async(e)=>{
    e.preventDefault();
    if(!password || !confirmPass){
      showAlert("error","All Input Fields Are Required");
      return;
    }
    if(password!== confirmPass){
      showAlert("error","Password do not match");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    if(!email){
      showAlert("error","Session Expired.Please start again");
    }
    try{
        const respose = await fetch("http://localhost:8080/forgotpassword",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password,confirmPass}),
        });
      const data = await respose.json();
      if(data.success){
        showAlert("success",data.message);
        localStorage.removeItem("resetEmail");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }catch(e){
      showAlert("error","Server Error");
      return;
    }
    
  }
   return ( <>
    <Alert
    type={alert.type}
    message={alert.message}
    onClose={()=>setAlert({type:"",message:""})}
    />
    <div className="pass">
      <div className="left-pass">
          <img src={logo} alt="logo" />
           <h1>Smart Travel Guide 🌍</h1>
            <p>
          Discover famous places, local food, temples, museums, and hidden gems
          tailored to your district using AI-powered recommendations.
            </p>
      </div>
      <div className="right-pass">
        <div className="pass-box">
          
        <form className="pass-form" onSubmit={handleResetPassword}>
        <div className="mb-3">
          <label className="form-label">OTP</label>
          <input className="form-control" />
          <label htmlFor="email" className="form-label" >
            Enter a new password
          </label>
          <input type={showPassword?"text":"password"} className="form-control" id="email"  onClick={(e)=>setPassword()}/>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
           Confirm Password
          </label>
          <input  className="form-control" id="password" type={showPassword?"text":"password"} onClick={(e)=>setConfirmPass(e.target.value)}/>
        </div>

        <div className="mb-3 form-check">
          <FontAwesomeIcon icon={showPassword?faEye:faEyeSlash} className="icon" onClick={togglePassword}/>
          <label className="form-check-label" htmlFor="check">
            Show password
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100" >
          Change Password
        </button>
        
        
        
      </form>
      </div>
      </div>
    </div>
    </>)
}