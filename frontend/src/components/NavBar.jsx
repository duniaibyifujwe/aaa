import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"

const NavBar = ()=>{
    const navigate = useNavigate()
    useEffect(()=>{
        if (localStorage.getItem('user') === null) {
            navigate('/login');
        }
    },[])
return (
    <nav>
          {/* You'd use <Link> components here with react-router-dom */}
          <Link to="/"> Dashboard </Link> 
          <Link to="/entry"> Park Car </Link> 
          <Link to="/exit"> Exit Car </Link> 
          <Link to="/payment"> Process Payment </Link> 
          <Link to="/history"> Parking History </Link> 
          <Link to="/create-slots"> Create Slots </Link> 
          <Link to="/logout"> Logout </Link> 
        </nav>
)
}
export default NavBar