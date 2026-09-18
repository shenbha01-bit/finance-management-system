import { useState, useEffect } from "react";
import "./Payments.css";

function Payments({ payments, setPayments, loans, setLoans }) {
  const emptyPayment = {
    loanId: "",
    amount: "",
    date: "",
    paymentMethod: "Cash",
    notes: "",
  };

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [payment, setPayment] = useState(emptyPayment);

  // ===============================
  // SAFE RESPONSE READER
  // ===============================
  const getResponseData = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  };

  // ===============================
  // GET PAYMENTS
  // ===============================
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/payments"
        );

        const data = await getResponseData(response);

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Failed to fetch payments"
          );
        }

        setPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Payment fetch error:", error);
        alert(
          "Unable to connect to backend server"
        );
      }
    };

    fetchPayments();
  }, [setPayments]);

  // ===============================
  // RESET FORM
  // ===============================
  const resetForm = () => {
    setPayment(emptyPayment);
    setEditingPayment(null);
    setShowForm(false);
  };

  // ===============================
  // SELECTED LOAN
  // ===============================
  const selectedLoan = payment.loanId
    ? loans.find(
        (item) =>
          String(item._id) ===
          String(payment.loanId)
      )
    : null;

  // ===============================
  // EDIT PAYMENT
  // ===============================
  const handleEdit = (item) => {
    setEditingPayment(item);

    setPayment({
      loanId: item.loanId || "",
      amount: String(item.amount || ""),
      date: item.paymentDate
        ? new Date(item.paymentDate)
            .toISOString()
            .split("T")[0]
        : "",
      paymentMethod:
        item.paymentMethod || "Cash",
      notes: item.notes || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // SAVE / UPDATE PAYMENT
  // ===============================
  const handleSave = async () => {
    if (!payment.loanId) {
      alert("Please select a loan");
      return;
    }

    if (!payment.amount) {
      alert("Please enter payment amount");
      return;
    }

    if (!payment.date) {
      alert("Please select payment date");
      return;
    }

    const paymentAmount = Number(payment.amount);

    if (
      Number.isNaN(paymentAmount) ||
      paymentAmount <= 0
    ) {
      alert(
        "Payment amount must be greater than 0"
      );
      return;
    }

    const selectedLoan = loans.find(
      (item) =>
        String(item._id) ===
        String(payment.loanId)
    );

    if (!selectedLoan) {
      alert("Loan not found");
      return;
    }

    try {
      // =====================================
      // EDIT EXISTING PAYMENT
      // =====================================
      if (editingPayment) {
        const oldAmount = Number(
          editingPayment.amount || 0
        );

        const currentPaid = Number(
          selectedLoan.paidAmount || 0
        );

        const totalPayable = Number(
          selectedLoan.totalPayable || 0
        );

        const newPaidAmount =
          currentPaid -
          oldAmount +
          paymentAmount;

        if (newPaidAmount < 0) {
          alert("Invalid payment amount");
          return;
        }

        if (newPaidAmount > totalPayable) {
          alert(
            `Payment cannot be greater than total payable amount of ₹${totalPayable.toFixed(
              2
            )}`
          );
          return;
        }

        const newBalance = Math.max(
          totalPayable - newPaidAmount,
          0
        );

        const newStatus =
          newBalance <= 0
            ? "Completed"
            : "Active";

        // UPDATE PAYMENT
        const paymentResponse = await fetch(
          `http://localhost:5000/api/payments/${editingPayment._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerName:
                selectedLoan.customerName,

              loanId: selectedLoan._id,

              amount: paymentAmount,

              paymentDate: payment.date,

              paymentMethod:
                payment.paymentMethod,

              notes: payment.notes,
            }),
          }
        );

        const paymentData =
          await getResponseData(
            paymentResponse
          );

        if (!paymentResponse.ok) {
          throw new Error(
            paymentData.error ||
              paymentData.message ||
              "Failed to update payment"
          );
        }

        // UPDATE LOAN
        const updatedLoanData = {
          customerName:
            selectedLoan.customerName,

          loanAmount: Number(
            selectedLoan.loanAmount || 0
          ),

          interestRate: Number(
            selectedLoan.interestRate || 0
          ),

          duration: Number(
            selectedLoan.duration || 0
          ),

          paidAmount: newPaidAmount,

          totalInterest: Number(
            selectedLoan.totalInterest || 0
          ),

          totalPayable: totalPayable,

          monthlyPayment: Number(
            selectedLoan.monthlyPayment || 0
          ),

          balance: newBalance,

          status: newStatus,
        };

        const loanResponse = await fetch(
          `http://localhost:5000/api/loans/${selectedLoan._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              updatedLoanData
            ),
          }
        );

        const loanData =
          await getResponseData(
            loanResponse
          );

        if (!loanResponse.ok) {
          throw new Error(
            loanData.error ||
              loanData.message ||
              "Payment updated but loan update failed"
          );
        }

        // UPDATE FRONTEND PAYMENT
        setPayments(
          payments.map((item) =>
            String(item._id) ===
            String(editingPayment._id)
              ? paymentData
              : item
          )
        );

        // UPDATE FRONTEND LOAN
        setLoans(
          loans.map((item) =>
            String(item._id) ===
            String(selectedLoan._id)
              ? loanData
              : item
          )
        );

        resetForm();

        alert("Payment updated successfully");

        return;
      }

      // =====================================
      // ADD NEW PAYMENT
      // =====================================

      const currentPaid = Number(
        selectedLoan.paidAmount || 0
      );

      const totalPayable = Number(
        selectedLoan.totalPayable || 0
      );

      const currentBalance = Math.max(
        totalPayable - currentPaid,
        0
      );

      if (paymentAmount > currentBalance) {
        alert(
          `Payment cannot be greater than remaining balance of ₹${currentBalance.toFixed(
            2
          )}`
        );
        return;
      }

      const newPaidAmount =
        currentPaid + paymentAmount;

      const newBalance = Math.max(
        totalPayable - newPaidAmount,
        0
      );

      const newStatus =
        newBalance <= 0
          ? "Completed"
          : "Active";

      // SAVE PAYMENT
      const paymentResponse = await fetch(
        "http://localhost:5000/api/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName:
              selectedLoan.customerName,

            loanId: selectedLoan._id,

            amount: paymentAmount,

            paymentDate: payment.date,

            paymentMethod:
              payment.paymentMethod,

            notes: payment.notes,
          }),
        }
      );

      const paymentData =
        await getResponseData(
          paymentResponse
        );

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.error ||
            paymentData.message ||
            "Failed to save payment"
        );
      }

      // UPDATE LOAN
      const updatedLoanData = {
        customerName:
          selectedLoan.customerName,

        loanAmount: Number(
          selectedLoan.loanAmount || 0
        ),

        interestRate: Number(
          selectedLoan.interestRate || 0
        ),

        duration: Number(
          selectedLoan.duration || 0
        ),

        paidAmount: newPaidAmount,

        totalInterest: Number(
          selectedLoan.totalInterest || 0
        ),

        totalPayable: totalPayable,

        monthlyPayment: Number(
          selectedLoan.monthlyPayment || 0
        ),

        balance: newBalance,

        status: newStatus,
      };

      const loanResponse = await fetch(
        `http://localhost:5000/api/loans/${selectedLoan._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            updatedLoanData
          ),
        }
      );

      const loanData =
        await getResponseData(
          loanResponse
        );

      if (!loanResponse.ok) {
        throw new Error(
          loanData.error ||
            loanData.message ||
            "Payment saved but loan update failed"
        );
      }

      setPayments([
        paymentData,
        ...payments,
      ]);

      setLoans(
        loans.map((item) =>
          String(item._id) ===
          String(selectedLoan._id)
            ? loanData
            : item
        )
      );

      resetForm();

      alert("Payment saved successfully");

    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        "Payment failed: " +
          error.message
      );
    }
  };

  // ===============================
  // DELETE PAYMENT
  // ===============================
  const handleDelete = async (item) => {
    const confirmDelete =
      window.confirm(
        `Delete payment of ₹${Number(
          item.amount || 0
        ).toFixed(2)}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const selectedLoan = loans.find(
        (loan) =>
          String(loan._id) ===
          String(item.loanId)
      );

      const response = await fetch(
        `http://localhost:5000/api/payments/${item._id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to delete payment"
        );
      }

      if (selectedLoan) {
        const oldAmount = Number(
          item.amount || 0
        );

        const currentPaid = Number(
          selectedLoan.paidAmount || 0
        );

        const totalPayable = Number(
          selectedLoan.totalPayable || 0
        );

        const newPaidAmount = Math.max(
          currentPaid - oldAmount,
          0
        );

        const newBalance = Math.max(
          totalPayable - newPaidAmount,
          0
        );

        const newStatus =
          newBalance <= 0
            ? "Completed"
            : "Active";

        const updatedLoanData = {
          customerName:
            selectedLoan.customerName,

          loanAmount: Number(
            selectedLoan.loanAmount || 0
          ),

          interestRate: Number(
            selectedLoan.interestRate || 0
          ),

          duration: Number(
            selectedLoan.duration || 0
          ),

          paidAmount: newPaidAmount,

          totalInterest: Number(
            selectedLoan.totalInterest || 0
          ),

          totalPayable: totalPayable,

          monthlyPayment: Number(
            selectedLoan.monthlyPayment || 0
          ),

          balance: newBalance,

          status: newStatus,
        };

        const loanResponse = await fetch(
          `http://localhost:5000/api/loans/${selectedLoan._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              updatedLoanData
            ),
          }
        );

        const loanData =
          await getResponseData(
            loanResponse
          );

        if (!loanResponse.ok) {
          throw new Error(
            loanData.error ||
              loanData.message ||
              "Payment deleted but loan update failed"
          );
        }

        setLoans(
          loans.map((loan) =>
            String(loan._id) ===
            String(selectedLoan._id)
              ? loanData
              : loan
          )
        );
      }

      setPayments(
        payments.filter(
          (paymentItem) =>
            String(paymentItem._id) !==
            String(item._id)
        )
      );

      alert("Payment deleted successfully");

    } catch (error) {
      console.error(
        "DELETE PAYMENT ERROR:",
        error
      );

      alert(
        "Failed to delete payment: " +
          error.message
      );
    }
  };

  return (
    <div className="payments-page">

      {/* HEADER */}
      <div className="payments-header">
        <div>
          <h1>Payments</h1>
          <p>
            Manage customer loan payments
          </p>
        </div>

        <button
          type="button"
          className="add-payment-btn"
          onClick={() => {
            setPayment(emptyPayment);
            setEditingPayment(null);
            setShowForm(true);
          }}
        >
          + Add Payment
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="payment-form-card">

          <h2>
            {editingPayment
              ? "Edit Payment"
              : "Add Payment"}
          </h2>

          {/* LOAN + AMOUNT */}
          <div className="payment-form-row">

            <div>
              <label>
                Select Loan
              </label>

              <select
                value={payment.loanId}
                disabled={!!editingPayment}
                onChange={(e) =>
                  setPayment({
                    ...payment,
                    loanId:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select customer loan
                </option>

                {loans
                  .filter(
                    (item) =>
                      Number(
                        item.balance || 0
                      ) > 0 ||
                      (editingPayment &&
                        String(item._id) ===
                          String(
                            editingPayment.loanId
                          ))
                  )
                  .map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.customerName} - ₹
                      {Number(
                        item.balance || 0
                      ).toFixed(2)}
                      {" remaining"}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label>
                Payment Amount
              </label>

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter payment amount"
                value={payment.amount}
                onChange={(e) =>
                  setPayment({
                    ...payment,
                    amount:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* DATE + METHOD */}
          <div className="payment-form-row">

            <div>
              <label>
                Payment Date
              </label>

              <input
                type="date"
                value={payment.date}
                onChange={(e) =>
                  setPayment({
                    ...payment,
                    date:
                      e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>
                Payment Method
              </label>

              <select
                value={
                  payment.paymentMethod
                }
                onChange={(e) =>
                  setPayment({
                    ...payment,
                    paymentMethod:
                      e.target.value,
                  })
                }
              >
                <option value="Cash">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>
              </select>
            </div>

          </div>

          {/* NOTES */}
          <div className="payment-form-row">

            <div>
              <label>
                Notes
              </label>

              <input
                type="text"
                placeholder="Optional notes"
                value={payment.notes}
                onChange={(e) =>
                  setPayment({
                    ...payment,
                    notes:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* LOAN DETAILS */}
          {selectedLoan && (
            <div className="payment-summary">

              <h3>
                Loan Details
              </h3>

              <p>
                <strong>
                  Customer:
                </strong>{" "}
                {selectedLoan.customerName}
              </p>

              <p>
                <strong>
                  Total Payable:
                </strong>{" "}
                ₹
                {Number(
                  selectedLoan.totalPayable || 0
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Already Paid:
                </strong>{" "}
                ₹
                {Number(
                  selectedLoan.paidAmount || 0
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Remaining Balance:
                </strong>{" "}
                ₹
                {Number(
                  selectedLoan.balance || 0
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Monthly Payment:
                </strong>{" "}
                ₹
                {Number(
                  selectedLoan.monthlyPayment || 0
                ).toFixed(2)}
              </p>

            </div>
          )}

          {/* BUTTONS */}
          <div className="payment-form-actions">

            <button
              type="button"
              className="save-payment-btn"
              onClick={handleSave}
            >
              {editingPayment
                ? "Update Payment"
                : "Save Payment"}
            </button>

            <button
              type="button"
              className="cancel-payment-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* PAYMENT HISTORY */}
      <div className="payment-table-card">

        <h2>
          Payment History
        </h2>

        <table>

          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Payment Amount</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No payments added
                </td>
              </tr>
            ) : (
              payments.map(
                (item, index) => {

                  const loan =
                    loans.find(
                      (loanItem) =>
                        String(
                          loanItem._id
                        ) ===
                        String(
                          item.loanId
                        )
                    );

                  return (
                    <tr
                      key={
                        item._id ||
                        index
                      }
                    >

                      <td>
                        {item.customerName}
                      </td>

                      <td>
                        ₹
                        {Number(
                          item.amount || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {item.paymentDate
                          ? new Date(
                              item.paymentDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {
                          item.paymentMethod
                        }
                      </td>

                      <td>
                        {loan &&
                        Number(
                          loan.balance || 0
                        ) <= 0
                          ? "Completed"
                          : "Paid"}
                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          style={{
                            marginLeft:
                              "8px",
                          }}
                        >
                          🗑️ Delete
                        </button>

                      </td>

                    </tr>
                  );
                }
              )
            )}

          </tbody>

        </table>

      </div>

      {/* MONTHLY PAYMENT SCHEDULE */}
      <div className="payment-table-card">

        <h2>
          Monthly Payment Schedule
        </h2>

        {loans.length === 0 ? (
          <p>
            No loans available.
          </p>
        ) : (
          loans.map((loanItem) => {

            const loanPayments =
              payments
                .filter(
                  (item) =>
                    String(
                      item.loanId
                    ) ===
                    String(
                      loanItem._id
                    )
                )
                .sort(
                  (a, b) =>
                    new Date(
                      a.paymentDate
                    ) -
                    new Date(
                      b.paymentDate
                    )
                );

            const monthlyPayment =
              Number(
                loanItem.monthlyPayment ||
                  0
              );

            const duration =
              Number(
                loanItem.duration || 0
              );

            let remainingPayment =
              loanPayments.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.amount || 0
                  ),
                0
              );

            return (
              <div
                key={loanItem._id}
                style={{
                  marginBottom: "30px",
                }}
              >

                <h3>
                  {
                    loanItem.customerName
                  }
                </h3>

                <p>
                  Monthly Payment: ₹
                  {monthlyPayment.toFixed(2)}
                </p>

                <table>

                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Due Amount</th>
                      <th>Paid Amount</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {Array.from(
                      {
                        length: duration,
                      },
                      (_, monthIndex) => {

                        const monthNumber =
                          monthIndex + 1;

                        const paidForMonth =
                          Math.min(
                            remainingPayment,
                            monthlyPayment
                          );

                        const balanceForMonth =
                          Math.max(
                            monthlyPayment -
                              paidForMonth,
                            0
                          );

                        const isPaid =
                          balanceForMonth <=
                          0;

                        remainingPayment =
                          Math.max(
                            remainingPayment -
                              paidForMonth,
                            0
                          );

                        return (
                          <tr
                            key={
                              monthNumber
                            }
                          >

                            <td>
                              Month{" "}
                              {monthNumber}
                            </td>

                            <td>
                              ₹
                              {monthlyPayment.toFixed(
                                2
                              )}
                            </td>

                            <td>
                              ₹
                              {paidForMonth.toFixed(
                                2
                              )}
                            </td>

                            <td>
                              ₹
                              {balanceForMonth.toFixed(
                                2
                              )}
                            </td>

                            <td>
                              {isPaid
                                ? "Paid"
                                : "Pending"}
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

export default Payments;