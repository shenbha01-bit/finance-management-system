import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const location = useLocation();

  const username = location.state?.username || "Admin";

  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);

  // =========================
  // LOAD LATEST DATA
  // =========================
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // CUSTOMERS
        const customerResponse = await fetch(
          "http://localhost:5000/api/customers"
        );

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();

          setCustomers(
            Array.isArray(customerData) ? customerData : []
          );
        }

        // LOANS
        const loanResponse = await fetch(
          "http://localhost:5000/api/loans"
        );

        if (loanResponse.ok) {
          const loanData = await loanResponse.json();

          setLoans(
            Array.isArray(loanData) ? loanData : []
          );
        }

        // PAYMENTS
        const paymentResponse = await fetch(
          "http://localhost:5000/api/payments"
        );

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();

          setPayments(
            Array.isArray(paymentData) ? paymentData : []
          );
        }
      } catch (error) {
        console.error("Dashboard data error:", error);
      }
    };

    loadDashboardData();
  }, []);

  // =========================
  // CALCULATIONS
  // =========================

  const totalCustomers = customers.length;

  const activeLoanCount = loans.filter(
    (loan) => loan.status === "Active"
  ).length;

  const totalLoanAmount = loans.reduce(
    (total, loan) =>
      total + Number(loan.loanAmount || 0),
    0
  );

  const totalPayments = payments.reduce(
    (total, payment) =>
      total +
      Number(
        payment.amount ??
        payment.paidAmount ??
        0
      ),
    0
  );

  const totalBalance = loans.reduce(
    (total, loan) =>
      total + Number(loan.balance || 0),
    0
  );

  return (
    <div className="dashboard-page">

      {/* =========================
          TOP HEADER
      ========================= */}

      <div className="dashboard-header">

        <div className="dashboard-title">

          <div className="dashboard-logo">
            ₹
          </div>

          <div>
            <h1>Finance Management System</h1>
            <p>Manage your finance activities easily</p>
          </div>

        </div>

        <div className="welcome-box">
          <span className="welcome-small">
            Welcome back
          </span>

          <span className="welcome-name">
            {username} 👋
          </span>
        </div>

      </div>


      {/* =========================
          OVERVIEW
      ========================= */}

      <div className="overview-section">

        <div className="section-heading">
          <div>
            <h2>Financial Overview</h2>
            <p>Quick summary of your finance records</p>
          </div>
        </div>


        <div className="overview-cards">

          {/* CUSTOMER CARD */}

          <div className="overview-card customer-card">

            <div className="card-top">

              <div className="card-icon">
                👥
              </div>

              <span className="card-label">
                CUSTOMERS
              </span>

            </div>

            <h3>Total Customers</h3>

            <p className="card-value">
              {totalCustomers}
            </p>

            <span className="card-bottom">
              Registered customers
            </span>

          </div>


          {/* ACTIVE LOANS */}

          <div className="overview-card loan-card">

            <div className="card-top">

              <div className="card-icon">
                💰
              </div>

              <span className="card-label">
                LOANS
              </span>

            </div>

            <h3>Active Loans</h3>

            <p className="card-value">
              {activeLoanCount}
            </p>

            <span className="card-bottom">
              Currently active
            </span>

          </div>


          {/* PAYMENTS */}

          <div className="overview-card payment-card">

            <div className="card-top">

              <div className="card-icon">
                💳
              </div>

              <span className="card-label">
                PAYMENTS
              </span>

            </div>

            <h3>Total Payments</h3>

            <p className="card-value money">
              ₹ {totalPayments.toFixed(2)}
            </p>

            <span className="card-bottom">
              Total amount received
            </span>

          </div>


          {/* LOAN AMOUNT */}

          <div className="overview-card amount-card">

            <div className="card-top">

              <div className="card-icon">
                📊
              </div>

              <span className="card-label">
                LOAN VALUE
              </span>

            </div>

            <h3>Total Loan Amount</h3>

            <p className="card-value money">
              ₹ {totalLoanAmount.toFixed(2)}
            </p>

            <span className="card-bottom">
              Total loans issued
            </span>

          </div>


          {/* BALANCE */}

          <div className="overview-card balance-card">

            <div className="card-top">

              <div className="card-icon">
                ⚠️
              </div>

              <span className="card-label">
                BALANCE
              </span>

            </div>

            <h3>Outstanding Balance</h3>

            <p className="card-value money">
              ₹ {totalBalance.toFixed(2)}
            </p>

            <span className="card-bottom">
              Amount yet to be paid
            </span>

          </div>

        </div>

      </div>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="quick-actions">

        <div className="section-heading">

          <div>
            <h2>Quick Actions</h2>
            <p>Access your finance modules</p>
          </div>

        </div>


        <div className="action-buttons">

          {/* CUSTOMERS */}

          <Link
            to="/customers"
            className="dashboard-action-button"
          >

            <div className="action-icon">
              👤
            </div>

            <div className="action-content">
              <strong>Customers</strong>
              <span>Manage customer records</span>
            </div>

            <div className="action-arrow">
              →
            </div>

          </Link>


          {/* LOANS */}

          <Link
            to="/loans"
            className="dashboard-action-button"
          >

            <div className="action-icon">
              💰
            </div>

            <div className="action-content">
              <strong>Loans</strong>
              <span>Manage loan details</span>
            </div>

            <div className="action-arrow">
              →
            </div>

          </Link>


          {/* PAYMENTS */}

          <Link
            to="/payments"
            className="dashboard-action-button"
          >

            <div className="action-icon">
              💳
            </div>

            <div className="action-content">
              <strong>Payments</strong>
              <span>Track payment records</span>
            </div>

            <div className="action-arrow">
              →
            </div>

          </Link>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;