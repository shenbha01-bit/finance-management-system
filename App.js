import EditCustomer from "./pages/EditCustomer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddCustomer from "./pages/AddCustomer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/edit-customer/:id"element={<EditCustomer/>}/>
      </Routes>
    </Router>
  );
}

export default App;
