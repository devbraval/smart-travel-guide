import "./Alert.css"
export default function Alert({type,message,onClose}){
    if(!message) return null;
    return(
        <div className={`alert-box ${type}`}>
            <span>{message}</span>
            <button onClick={onClose}>×</button>
        </div>
    )
}