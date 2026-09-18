import { useState, useEffect } from "react";
import "./Loans.css";

function Loans({ loans, setLoans }) {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [loan, setLoan] = useState({
    customerName: "",
    loanAmount: "",
    interestRate: "",
    duration: "",
    paidAmount: "",
  });

  // =========================
  // GET LOANS FROM BACKEND
  // =========================
  useEffect(() => {
    fetch("http://localhost:5000/api/loans")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch loans");
        }

        return response.json();
      })
      .then((data) => {
        setLoans(data);
      })
      .catch((error) => {
        console.error("Failed to fetch loans:", error);
        alert("Unable to connect to backend server");
      });
  }, [setLoans]);

  // =========================
  // CALCULATE LOAN
  // =========================
  const calculateLoan = () => {
    const loanAmount = Number(loan.loanAmount);
    const interestRate = Number(loan.interestRate);
    const duration = Number(loan.duration);
    const paidAmount = Number(loan.paidAmount) || 0;

    const totalInterest =
      loanAmount * (interestRate / 100) * duration;

    const totalPayable =
      loanAmount + totalInterest;

    const monthlyPayment =
      duration > 0
        ? totalPayable / duration
        : 0;

    const balance =
      totalPayable - paidAmount;

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

  // =========================
  // SAVE / UPDATE LOAN
  // =========================
  const handleSave = async () => {
    // Required field validation
    if (
      !loan.customerName ||
      !loan.loanAmount ||
      !loan.interestRate ||
      !loan.duration
    ) {
      alert("Please fill all the required fields");
      return;
    }

    const calculated = calculateLoan();

    // Loan amount validation
    if (calculated.loanAmount <= 0) {
      alert("Loan amount must be greater than 0");
      return;
    }

    // Interest validation
    if (calculated.interestRate < 0) {
      alert("Interest rate cannot be negative");
      return;
    }

    // Duration validation
    if (calculated.duration <= 0) {
      alert("Duration must be greater than 0");
      return;
    }

    // Paid amount validation
    if (calculated.paidAmount < 0) {
      alert("Paid amount cannot be negative");
      return;
    }

    // Paid amount cannot exceed total payable
    if (
      calculated.paidAmount >
      calculated.totalPayable
    ) {
      alert(
        "Paid amount cannot be greater than total payable"
      );
      return;
    }

    // Loan object
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
      status:
        calculated.balance <= 0
          ? "Completed"
          : "Active",
    };

    try {
      // =========================
      // UPDATE EXISTING LOAN
      // =========================
      if (editIndex !== null) {
        const existingLoan = loans[editIndex];

        const response = await fetch(
          `http://localhost:5000/api/loans/${existingLoan._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newLoan),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
              "Failed to update loan"
          );
        }

        const updatedLoan =
          await response.json();

        const updatedLoans = [...loans];

        updatedLoans[editIndex] =
          updatedLoan;

        setLoans(updatedLoans);

        alert("Loan updated successfully");
      }

      // =========================
      // SAVE NEW LOAN
      // =========================
      else {
        const response = await fetch(
          "http://localhost:5000/api/loans",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newLoan),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
              "Failed to save loan"
          );
        }

        const savedLoan =
          await response.json();

        setLoans([
          ...loans,
          savedLoan,
        ]);

        alert("Loan saved successfully");
      }

      // Reset form
      setLoan({
        customerName: "",
        loanAmount: "",
        interestRate: "",
        duration: "",
        paidAmount: "",
      });

      setEditIndex(null);
      setShowForm(false);

    } catch (error) {
      console.error(
        "Loan save/update error:",
        error
      );

      alert(
        "Failed to save loan: " +
          error.message
      );
    }
  };

  // =========================
  // EDIT LOAN
  // =========================
  const handleEdit = (index) => {
    const item = loans[index];

    setLoan({
      customerName:
        item.customerName || "",
      loanAmount:
        item.loanAmount ?? "",
      interestRate:
        item.interestRate ?? "",
      duration:
        item.duration ?? "",
      paidAmount:
        item.paidAmount ?? "",
    });

    setEditIndex(index);
    setShowForm(true);
  };

  // =========================
  // DELETE LOAN
  // =========================
  const handleDelete = async (index) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this loan?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const loanId = loans[index]._id;

      const response = await fetch(
        `http://localhost:5000/api/loans/${loanId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.error ||
            "Failed to delete loan"
        );
      }

      const updatedLoans =
        loans.filter(
          (_, i) => i !== index
        );

      setLoans(updatedLoans);

      alert("Loan deleted successfully");

    } catch (error) {
      console.error(
        "Delete loan error:",
        error
      );

      alert(
        "Failed to delete loan: " +
          error.message
      );
    }
  };

  // =========================
  // RESET FORM
  // =========================
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

  // =========================
  // OPEN ADD LOAN FORM
  // =========================
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

      {/* =========================
          HEADER
      ========================= */}
      <div className="loans-header">

        <div>
          <h1>Loans</h1>
          <p>Manage customer loans</p>
        </div>

        <button
          className="add-loan-btn"
          onClick={openAddLoanForm}
        >
          + Add Loan
        </button>

      </div>

      {/* =========================
          ADD / EDIT FORM
      ========================= */}
      {showForm && (
        <div className="loan-form-card">

          <h2>
            {editIndex !== null
              ? "Edit Loan"
              : "Add New Loan"}
          </h2>

          {/* Customer + Loan Amount */}
          <div className="loan-form-row">

            <div>
              <label>
                Customer Name
              </label>

              <input
                type="text"
                placeholder="Enter customer name"
                value={loan.customerName}
                onChange={(e) =>
                  setLoan({
                    ...loan,
                    customerName:
                      e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>
                Loan Amount
              </label>

              <input
                type="number"
                min="0"
                placeholder="Enter loan amount"
                value={loan.loanAmount}
                onChange={(e) =>
                  setLoan({
                    ...loan,
                    loanAmount:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* Interest + Duration */}
          <div className="loan-form-row">

            <div>
              <label>
                Interest Rate (%)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Example: 2"
                value={loan.interestRate}
                onChange={(e) =>
                  setLoan({
                    ...loan,
                    interestRate:
                      e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>
                Duration (Months)
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 10"
                value={loan.duration}
                onChange={(e) =>
                  setLoan({
                    ...loan,
                    duration:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* Paid Amount */}
          <div className="loan-form-row">

            <div>
              <label>
                Paid Amount
              </label>

              <input
                type="number"
                min="0"
                placeholder="Enter paid amount"
                value={loan.paidAmount}
                onChange={(e) =>
                  setLoan({
                    ...loan,
                    paidAmount:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* =========================
              CALCULATION PREVIEW
          ========================= */}
          {loan.loanAmount &&
            loan.interestRate &&
            loan.duration && (
              <div className="loan-calculation-preview">

                <h3>
                  Loan Calculation
                </h3>

                <p>
                  <strong>
                    Total Interest:
                  </strong>{" "}
                  ₹{" "}
                  {calculateLoan()
                    .totalInterest
                    .toFixed(2)}
                </p>

                <p>
                  <strong>
                    Total Payable:
                  </strong>{" "}
                  ₹{" "}
                  {calculateLoan()
                    .totalPayable
                    .toFixed(2)}
                </p>

                <p>
                  <strong>
                    Monthly Payment:
                  </strong>{" "}
                  ₹{" "}
                  {calculateLoan()
                    .monthlyPayment
                    .toFixed(2)}
                </p>

                <p>
                  <strong>
                    Remaining Balance:
                  </strong>{" "}
                  ₹{" "}
                  {calculateLoan()
                    .balance
                    .toFixed(2)}
                </p>

              </div>
            )}

          {/* =========================
              FORM BUTTONS
          ========================= */}
          <div className="loan-form-actions">

            <button
              className="save-loan-btn"
              onClick={handleSave}
            >
              {editIndex !== null
                ? "Update Loan"
                : "Save Loan"}
            </button>

            <button
              className="cancel-loan-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* =========================
          LOAN TABLE
      ========================= */}
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
                <td
                  colSpan="11"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No loans added
                </td>
              </tr>

            ) : (

              loans.map(
                (item, index) => (

                  <tr
                    key={
                      item._id || index
                    }
                  >

                    <td>
                      {item.customerName}
                    </td>

                    <td>
                      ₹{" "}
                      {Number(
                        item.loanAmount
                      ).toFixed(2)}
                    </td>

                    <td>
                      {
                        item.interestRate
                      }%
                    </td>

                    <td>
                      {item.duration}{" "}
                      months
                    </td>

                    <td>
                      ₹{" "}
                      {Number(
                        item.totalInterest ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹{" "}
                      {Number(
                        item.totalPayable ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹{" "}
                      {Number(
                        item.monthlyPayment ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹{" "}
                      {Number(
                        item.paidAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹{" "}
                      {Number(
                        item.balance || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {item.status}
                    </td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(
                            index
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            index
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Loans;