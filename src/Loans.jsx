import { useState, useEffect } from "react";
import "./Loans.css";

const API_URL = "https://finance-management-system001.onrender.com";

function Loans({ loans = [], setLoans }) {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loan, setLoan] = useState({
    customerName: "",
    loanAmount: "",
    interestRate: "",
    duration: "",
    paidAmount: "",
  });

  // GET LOANS
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch(`${API_URL}/api/loans`);

        if (!response.ok) {
          throw new Error("Failed to fetch loans");
        }

        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error("Fetch loans error:", error);
        alert("Unable to load loans. Please try again.");
      }
    };

    fetchLoans();
  }, [setLoans]);

  // CALCULATE LOAN
  const calculateLoan = () => {
    const loanAmount = Number(loan.loanAmount);
    const interestRate = Number(loan.interestRate);
    const duration = Number(loan.duration);
    const paidAmount = Number(loan.paidAmount) || 0;

    const totalInterest =
      loanAmount * (interestRate / 100) * duration;

    const totalPayable = loanAmount + totalInterest;

    const monthlyPayment =
      duration > 0 ? totalPayable / duration : 0;

    const balance = totalPayable - paidAmount;

    return {
      loanAmount,
      interestRate,
      duration,
      paidAmount,
      totalInterest,
      totalPayable,
      monthlyPayment,
      balance,
    };
  };

  // RESET FORM
  const resetForm = () => {
    setLoan({
      customerName: "",
      loanAmount: "",
      interestRate: "",
      duration: "",
      paidAmount: "",
    });

    setEditIndex(null);
    setShowForm(false);
  };

  // SAVE OR UPDATE LOAN
  const handleSave = async () => {
    if (
      !loan.customerName.trim() ||
      loan.loanAmount === "" ||
      loan.interestRate === "" ||
      loan.duration === ""
    ) {
      alert("Please fill all the required fields");
      return;
    }

    const calculated = calculateLoan();

    if (
      calculated.loanAmount <= 0 ||
      calculated.interestRate < 0 ||
      calculated.duration <= 0 ||
      calculated.paidAmount < 0
    ) {
      alert("Please enter valid loan details");
      return;
    }

    if (calculated.paidAmount > calculated.totalPayable) {
      alert("Paid amount cannot exceed total payable");
      return;
    }

    const newLoan = {
      customerName: loan.customerName.trim(),
      loanAmount: calculated.loanAmount,
      interestRate: calculated.interestRate,
      duration: calculated.duration,
      paidAmount: calculated.paidAmount,
      totalInterest: calculated.totalInterest,
      totalPayable: calculated.totalPayable,
      monthlyPayment: calculated.monthlyPayment,
      balance: calculated.balance,
      status: calculated.balance <= 0 ? "Completed" : "Active",
    };

    setLoading(true);

    try {
      const isEditing = editIndex !== null;
      const existingLoan = isEditing ? loans[editIndex] : null;

      const url = isEditing
        ? `${API_URL}/api/loans/${existingLoan._id}`
        : `${API_URL}/api/loans`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLoan),
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to save loan"
        );
      }

      if (isEditing) {
        setLoans((previousLoans) =>
          previousLoans.map((item) =>
            item._id === existingLoan._id ? data : item
          )
        );

        alert("Loan updated successfully");
      } else {
        setLoans((previousLoans) => [...previousLoans, data]);

        alert("Loan saved successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Loan save/update error:", error);

      alert(
        "Failed to save loan: " +
          error.message +
          "\nPlease check your internet connection and backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // EDIT LOAN
  const handleEdit = (index) => {
    const item = loans[index];

    setLoan({
      customerName: item.customerName || "",
      loanAmount: item.loanAmount ?? "",
      interestRate: item.interestRate ?? "",
      duration: item.duration ?? "",
      paidAmount: item.paidAmount ?? "",
    });

    setEditIndex(index);
    setShowForm(true);
  };

  // DELETE LOAN
  const handleDelete = async (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this loan?"
    );

    if (!confirmed) return;

    const item = loans[index];

    try {
      const response = await fetch(
        `${API_URL}/api/loans/${item._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || "Failed to delete loan");
      }

      setLoans((previousLoans) =>
        previousLoans.filter((loanItem) => loanItem._id !== item._id)
      );

      alert("Loan deleted successfully");
    } catch (error) {
      console.error("Delete loan error:", error);
      alert("Failed to delete loan: " + error.message);
    }
  };

  // OPEN ADD LOAN FORM
  const openAddLoanForm = () => {
    setLoan({
      customerName: "",
      loanAmount: "",
      interestRate: "",
      duration: "",
      paidAmount: "",
    });

    setEditIndex(null);
    setShowForm(true);
  };

  return (
    <div className="loans-page">
      <div className="loans-header">
        <div>
          <h1>Loans</h1>
          <p>Manage customer loans</p>
        </div>

        <button className="add-loan-btn" onClick={openAddLoanForm}>
          + Add Loan
        </button>
      </div>

      {showForm && (
        <div className="loan-form-card">
          <h2>{editIndex !== null ? "Edit Loan" : "Add New Loan"}</h2>

          <div className="loan-form-row">
            <div>
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={loan.customerName}
                onChange={(e) =>
                  setLoan({ ...loan, customerName: e.target.value })
                }
              />
            </div>

            <div>
              <label>Loan Amount</label>
              <input
                type="number"
                min="0"
                placeholder="Enter loan amount"
                value={loan.loanAmount}
                onChange={(e) =>
                  setLoan({ ...loan, loanAmount: e.target.value })
                }
              />
            </div>
          </div>

          <div className="loan-form-row">
            <div>
              <label>Interest Rate (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Example: 2"
                value={loan.interestRate}
                onChange={(e) =>
                  setLoan({ ...loan, interestRate: e.target.value })
                }
              />
            </div>

            <div>
              <label>Duration (Months)</label>
              <input
                type="number"
                min="1"
                placeholder="Example: 10"
                value={loan.duration}
                onChange={(e) =>
                  setLoan({ ...loan, duration: e.target.value })
                }
              />
            </div>
          </div>

          <div className="loan-form-row">
            <div>
              <label>Paid Amount</label>
              <input
                type="number"
                min="0"
                placeholder="Enter paid amount"
                value={loan.paidAmount}
                onChange={(e) =>
                  setLoan({ ...loan, paidAmount: e.target.value })
                }
              />
            </div>
          </div>

          {loan.loanAmount !== "" &&
            loan.interestRate !== "" &&
            loan.duration !== "" &&
            Number(loan.duration) > 0 && (
              <div className="loan-calculation-preview">
                <h3>Loan Calculation</h3>

                <p>
                  <strong>Total Interest:</strong>{" "}
                  ₹ {calculateLoan().totalInterest.toFixed(2)}
                </p>

                <p>
                  <strong>Total Payable:</strong>{" "}
                  ₹ {calculateLoan().totalPayable.toFixed(2)}
                </p>

                <p>
                  <strong>Monthly Payment:</strong>{" "}
                  ₹ {calculateLoan().monthlyPayment.toFixed(2)}
                </p>

                <p>
                  <strong>Remaining Balance:</strong>{" "}
                  ₹ {calculateLoan().balance.toFixed(2)}
                </p>
              </div>
            )}

          <div className="loan-form-actions">
            <button
              className="save-loan-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editIndex !== null
                ? "Update Loan"
                : "Save Loan"}
            </button>

            <button
              className="cancel-loan-btn"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="loan-table-card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Loan Amount</th>
              <th>Interest %</th>
              <th>Duration</th>
              <th>Total Interest</th>
              <th>Total Payable</th>
              <th>Monthly Payment</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No loans added
                </td>
              </tr>
            ) : (
              loans.map((item, index) => (
                <tr key={item._id || index}>
                  <td>{item.customerName}</td>
                  <td>₹ {Number(item.loanAmount || 0).toFixed(2)}</td>
                  <td>{item.interestRate}%</td>
                  <td>{item.duration} months</td>
                  <td>₹ {Number(item.totalInterest || 0).toFixed(2)}</td>
                  <td>₹ {Number(item.totalPayable || 0).toFixed(2)}</td>
                  <td>₹ {Number(item.monthlyPayment || 0).toFixed(2)}</td>
                  <td>₹ {Number(item.paidAmount || 0).toFixed(2)}</td>
                  <td>₹ {Number(item.balance || 0).toFixed(2)}</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Loans;