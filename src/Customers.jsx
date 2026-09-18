import { useEffect, useState } from "react";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    loanAmount: "",
    paidAmount: "",
  });

  // =========================
  // LOAD CUSTOMERS
  // =========================
  const loadCustomers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customers"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Customer loading error:", error);
      alert("Unable to connect to backend server");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD / UPDATE CUSTOMER
  // =========================
  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !customer.name ||
      !customer.phone ||
      !customer.loanAmount
    ) {
      alert("Please fill all required fields");
      return;
    }

    const loanAmount = Number(customer.loanAmount);
    const paidAmount = Number(customer.paidAmount) || 0;
    const balance = loanAmount - paidAmount;

    const customerData = {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      loanAmount,
      paidAmount,
      balance,
      status: balance <= 0 ? "Completed" : "Active",
    };

    try {
      let response;

      // UPDATE
      if (editId) {
        response = await fetch(
          `http://localhost:5000/api/customers/${editId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customerData),
          }
        );
      }

      // ADD
      else {
        response = await fetch(
          "http://localhost:5000/api/customers",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customerData),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Failed to save customer");
      }

      alert(
        editId
          ? "Customer updated successfully"
          : "Customer added successfully"
      );

      setCustomer({
        name: "",
        phone: "",
        address: "",
        loanAmount: "",
        paidAmount: "",
      });

      setEditId(null);
      setShowForm(false);

      loadCustomers();
    } catch (error) {
      console.error("Customer save error:", error);
      alert("Unable to save customer");
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================
  const handleEdit = (customerData) => {
    setCustomer({
      name: customerData.name || "",
      phone: customerData.phone || "",
      address: customerData.address || "",
      loanAmount: customerData.loanAmount || "",
      paidAmount: customerData.paidAmount || "",
    });

    setEditId(customerData._id);
    setShowForm(true);
  };

  // =========================
  // DELETE CUSTOMER
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      alert("Customer deleted successfully");

      loadCustomers();
    } catch (error) {
      console.error("Customer delete error:", error);
      alert("Unable to delete customer");
    }
  };

  // =========================
  // CANCEL FORM
  // =========================
  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);

    setCustomer({
      name: "",
      phone: "",
      address: "",
      loanAmount: "",
      paidAmount: "",
    });
  };

  return (
    <div className="customers-page">

      {/* HEADER */}
      <div className="customers-header">
        <div>
          <h1>Customer Management</h1>
          <p>Manage your customers</p>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setShowForm(true);
          }}
        >
          + Add Customer
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="customer-form">

          <h2>
            {editId ? "Edit Customer" : "Add Customer"}
          </h2>

          <form onSubmit={handleSave}>

            <input
              type="text"
              name="name"
              placeholder="Customer Name"
              value={customer.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleChange}
            />

            <input
              type="number"
              name="loanAmount"
              placeholder="Loan Amount"
              value={customer.loanAmount}
              onChange={handleChange}
            />

            <input
              type="number"
              name="paidAmount"
              placeholder="Paid Amount"
              value={customer.paidAmount}
              onChange={handleChange}
            />

            <div>
              <button type="submit">
                {editId ? "Update Customer" : "Save Customer"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* CUSTOMER TABLE */}
      <div className="customer-table-section">

        <h2>Customer List</h2>

        {customers.length === 0 ? (
          <p>No customers available.</p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Loan Amount</th>
                <th>Paid Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((item) => (
                <tr key={item._id}>

                  <td>{item.name}</td>

                  <td>{item.phone}</td>

                  <td>{item.address}</td>

                  <td>
                    ₹ {Number(item.loanAmount || 0).toFixed(2)}
                  </td>

                  <td>
                    ₹ {Number(item.paidAmount || 0).toFixed(2)}
                  </td>

                  <td>
                    ₹ {Number(item.balance || 0).toFixed(2)}
                  </td>

                  <td>{item.status}</td>

                  <td>
                    <button
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default Customers;