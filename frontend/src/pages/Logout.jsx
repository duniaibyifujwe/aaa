import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { logoutUser as apiLogoutUser } from '../api/authApi'; // Import the API logout function

const Logout = () => {
  const navigate = useNavigate(); // Call useNavigate at the top level of the component

  useEffect(() => {
    // Perform client-side logout actions
    localStorage.removeItem('token'); // Clear specific items for safety
    localStorage.removeItem('user');  // Clear specific items for safety
    // localStorage.clear(); // You can use this if you want to clear EVERYTHING in localStorage

    // Optionally call your backend logout endpoint (if it does anything server-side)
    // apiLogoutUser(); // This just sends a request, no real effect on stateless JWT

    // Redirect to the login page
    navigate('/login');

    // The empty dependency array ensures this effect runs only once on mount
  }, [navigate]); // Add navigate to dependency array for best practice (though it's stable)

  // This component doesn't render any UI, it just performs an action and redirects.
  // Returning null is appropriate here. You could also return a loading message.
  return null;
  // Or, if you want a message while it redirects:
  // return (
  //   <div style={{ textAlign: 'center', marginTop: '50px' }}>
  //     <p>Logging out...</p>
  //   </div>
  // );
};

export default Logout;