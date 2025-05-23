const NavBar = ()=>{
return (
    <nav>
          {/* You'd use <Link> components here with react-router-dom */}
          <Link to="/"> Dashboard </Link> 
          <Link to="entry"> Park Car </Link> 
          <Link to="exit"> Exit Car </Link> 
          <Link to="payment"> Process Payment </Link> 
          <Link to="history"> Parking History </Link> 
          <Link to="create-slots"> Create Slots </Link> 
        </nav>
)
}
export default NavBar