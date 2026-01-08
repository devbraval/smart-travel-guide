import { useState,useRef } from "react";
import "./Otp.css";
import useCooldown from "../hooks/useCooldown";
import Alert from "./Alert";
export default function Otp(){
  
  const [otp,setOtp] = useState(new Array(6).fill(""));
  const [message,setMessage] = useState("");
  const inputRf = useRef([]);
  const [alert,setAlert] = useState({
    type:"",
    message:"",
  });
  const showAlert =(type,message)=>{
    setAlert({type,message});
    setTimeout(()=>{
      setAlert({type:"",message:""})
    },3000);
  }
  const {isDisabled,cooldown,startCooldown} = useCooldown(30);
  const handleChange = (value,index)=>{
    if(!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if(value && index<5){
      inputRf.current[index+1].focus();
    }
  };

  const handleKeyDown = (e,index)=>{
     
    if(e.key === "Backspace" && index>0 && !otp[index]){
      inputRf.current[index-1].focus();
    }
  };
  const handleVerifyOtp =async()=>{
    const finalOtp = otp.join("");
    const email = localStorage.getItem("otpEmail");
    if(finalOtp.length !== 6){
      setMessage("Please Enter a complete otp");
      return;
    }
    const response = await fetch("http://localhost:8080/verify-otp",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,otp:finalOtp}),
    });
    const data = await response.json();
    if (!response.ok) {
    setMessage(data.error?.message || "OTP verification failed");
    return;
}

    localStorage.removeItem("otpEmail");
     showAlert("success", "Login successful 🎉");
     setTimeout(()=>{
      window.location.href = "/dashboard";
     },1500);
    

  };
  

 const handleResend = async () => {
  if (isDisabled) return;

  const email = localStorage.getItem("otpEmail");

  if (!email) {
    showAlert("error", "Email not found. Please login again.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.success) {
      startCooldown(); // ✅ ONLY after success
      showAlert("success", "OTP resent to your email 📧");
    } else {
      showAlert("error", data.message);
    }
  } catch (err) {
    showAlert("error", "Server not reachable");
  }
};

  
  return(
    <>
     <Alert
    type={alert.type}
    message={alert.message}
    onClose={()=>setAlert({type:"",message:""})}
    />
    <div className="otp-page">
      <div className="otp-card">
        <h2>Verify</h2>
        <p className="subtitle">your code will be sent to you via E-mail</p>
        <div className="otp-input">
          {
            otp.map((digit,index)=>(
              <input
              key={index}
              type="text"
              value={digit}
              maxLength={1}
              ref={(el)=>(inputRf.current[index]=el)}
              onChange={(e)=>handleChange(e.target.value,index)}
              onKeyDown={(e)=>handleKeyDown(e,index)}
              />
            ))
          }
        </div>
        <button className="verify-btn" onClick={handleVerifyOtp}>
          Verify
        </button>
        <p className="error">{message}</p>
         <p className="resend">
          Didn’t receive code? <span onClick={handleResend} style={{
            pointerEvents:isDisabled?"none":"auto",
            color:isDisabled?"gray":"#0d6efd",
            cursor:isDisabled?"not-allowed":"pointer"
          }}>
            {isDisabled ? `Resend in ${cooldown}s` : "Request again"}
            </span>
        </p>
      </div>
    </div>
    </>
  )
}