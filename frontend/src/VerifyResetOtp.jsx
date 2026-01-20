import "./Otp.css"
import Alert from "./Alert"
import useCooldown from "../hooks/useCooldown"
import { useState,useRef } from "react"
export default function VerifyResetOtp(){
    const [otp,setOtp] = useState(new Array(6).fill(""));
    const [message,setMessage] = useState("");
    const userRef = useRef([]);
    const [alert,setAlert] = useState({
        type:"",
        message:"",
    });
    const showAlert = (type,message)=>{
        setAlert({type,message});
        setTimeout(()=>{
            setAlert({type:"",message:""});
        },3000);
    };
    const {isDisabled,cooldown,startCooldown} = useCooldown(30);
    const handleChange = (index,value)=>{
        if(!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if(value && index<5){
            userRef.current[index+1].focus();
        }
    }
    const handleKeyDown = (e,index)=>{
        if(e.key==="Backspace" && !otp[index] && index>0){
            userRef.current[index-1].focus();
        }
    }
    const handleVerifyOtp = async()=>{
        const finalOtp = otp.join("");
        const email = localStorage.getItem("resetEmail");
        if(finalOtp.length != 6){
            showAlert("error","Enter a complete Otp");
            return;
        }
        try{
        const response = await fetch("http://localhost:8080/verify-reset-otp",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email,otp:finalOtp})
        });
        
        const data = await response.json();
        if (data.success) {
        showAlert("success", "OTP verified. Set new password.");
        setTimeout(() => {
          window.location.href = "/reset-password";
        }, 1000);
      } else {
        showAlert("error", data.message);
      }
    }catch(e){
        showAlert("error","Server Error");
    }
            
    }
    const handleResend = async()=>{
        if(isDisabled) return;
        const email = localStorage.getItem("resetEmail");
        if(!email){
            showAlert("error","Email not founded Please Login Again");
            return;
        }
        try{
            const response = await fetch("http://localhost:8080/forgot-password",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({email})
            });
            const data = await response.json();

            if(data.success){
                startCooldown();
                showAlert("success", "OTP resent to your email");
            }else{
                showAlert("error",data.message);
            }
        }catch(error){
            showAlert("error","Server not reachable");
        }
    }
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
                  ref={(el)=>(userRef.current[index]=el)}
                  onChange={(e)=>handleChange(index,e.target.value)}
                  onKeyDown={(e)=>handleKeyDown(e,index)}
                  />
                ))
              }
            </div>
            <button className="verify-btn" onClick={handleVerifyOtp}>
              Verify
            </button>
            <p className="resend">
                Don't receive the code? <span onClick={handleResend} style={{
                    color:isDisabled?"gray":"#0d6efd",
                    cursor:isDisabled?"not-allowed":"pointer",
                    pointerEvents:isDisabled?"none":"auto",
                }}>{isDisabled?`Resend in ${cooldown}s`:"Request again"}</span>
            </p>
          </div>
        </div>
        </> 
      )
}