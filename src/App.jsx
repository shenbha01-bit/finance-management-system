import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Customers from "./Customers";
import Loans from "./Loans";
import Payments from "./Payments";

function App() {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);

  // =========================
  // LOAD ALL DATA FROM BACKEND
  // =========================
  useEffect(() => {
    const loadData = async () => {
      try {
        // Customers
        const customerResponse = await fetch(
          "http://localhost:5000/api/customers"
        );

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();

          setCustomers(
            Array.isArray(customerData)
              ? customerData
              : []
          );
        }

        // Loans
        const loanResponse = await fetch(
          "http://localhost:5000/api/loans"
        );

        if (loanResponse.ok) {
          const loanData = await loanResponse.json();

          setLoans(
            Array.isArray(loanData)
              ? loanData
              : []
          );
        }

        // Payments
        const paymentResponse = await fetch(
          "http://localhost:5000/api/payments"
        );

        if (paymentResponse.ok) {
          const paymentData =
            await paymentResponse.json();

          setPayments(
            Array.isArray(paymentData)
              ? paymentData
              : []
          );
        }

      } catch (error) {
        console.error(
          "Dashboard data loading error:",
          error
        );
      }
    };

    loadData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <Dashboard
              customers={customers}
              loans={loans}
              payments={payments}
            />
          }
        />

        {/* CUSTOMERS */}
        <Route
          path="/customers"
          element={
            <Customers
              customers={customers}
              setCustomers={setCustomers}
            />
          }
        />

        {/* LOANS */}
        <Route
          path="/loans"
          element={
            <Loans
              loans={loans}
              setLoans={setLoans}
            />
          }
        />

        {/* PAYMENTS */}
        <Route
          path="/payments"
          element={
            <Payments
              payments={payments}
              setPayments={setPayments}
              loans={loans}
              setLoans={setLoans}
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;