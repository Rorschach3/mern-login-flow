import { Route, Routes } from  "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const App = () => {
  return (
        <Routes> 
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Dashboard" element={<Dashboard/>} />
        </Routes>
  )
}

export default App;
