import { useState,useEffect } from "react";

export default function useCooldown(second=30){
    const [cooldown,setCooldown] = useState(0);
    const startCooldown=()=>{
        setCooldown(second);
    };
    useEffect(()=>{
        if(cooldown===0)return;
        
        const timer = setInterval(()=>{
            setCooldown(prev=>prev-1);
        },1000);
        return ()=>clearInterval(timer);
    },[cooldown]);
    return{
        isDisabled:cooldown>1,
        cooldown,
        startCooldown
    };
}