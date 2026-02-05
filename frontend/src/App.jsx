import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [userId] = useState("user-" + Math.random().toString(36).substr(2, 9));
  const [discountCode, setDiscountCode] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      showMessage("Failed to load products", "error");
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart/${userId}`);
      const data = await response.json();
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const addToCart = async (productId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity: 1 }),
      });
      const data = await response.json();

      if (data.success) {
        setCart(data.cart);
        showMessage("Item added to cart!", "success");
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      showMessage("Failed to add item to cart", "error");
    }
    setLoading(false);
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      const data = await response.json();

      if (data.success) {
        setCart(data.cart);
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      showMessage("Failed to update cart", "error");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/cart/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await response.json();

      if (data.success) {
        setCart(data.cart);
        showMessage("Item removed from cart", "success");
      }
    } catch (error) {
      showMessage("Failed to remove item", "error");
    }
  };

  const checkout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          discountCode: discountCode || undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        let msg = data.message;
        if (data.newDiscountCode) {
          msg += `\n\n${data.newDiscountCode.message}\nYour code: ${data.newDiscountCode.code}`;
        }
        showMessage(msg, "success");
        setCart({ items: [], totalItems: 0, subtotal: 0 });
        setDiscountCode("");
        setShowCart(false);
        fetchProducts(); // Refresh to show updated stock
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      showMessage("Checkout failed", "error");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🛒 Uniblox Store</h1>
        <div className="header-actions">
          <button onClick={() => setShowCart(!showCart)} className="cart-btn">
            Cart ({cart.totalItems})
          </button>
          <button onClick={fetchStats} className="stats-btn">
            View Stats
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {showCart ? (
        <div className="cart-view">
          <h2>Shopping Cart</h2>
          {cart.items.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p>${item.price} each</p>
                    </div>
                    <div className="item-controls">
                      <button
                        onClick={() =>
                          updateCartItem(item.productId, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartItem(item.productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="discount-input">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="subtotal">
                  <strong>Subtotal:</strong> ${cart.subtotal.toFixed(2)}
                </div>
                <button
                  onClick={checkout}
                  disabled={loading || cart.items.length === 0}
                  className="checkout-btn"
                >
                  {loading ? "Processing..." : "Checkout"}
                </button>
                <button
                  onClick={() => setShowCart(false)}
                  className="continue-btn"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
              <p className="stock">Stock: {product.stock}</p>
              <button
                onClick={() => addToCart(product.id)}
                disabled={loading || product.stock === 0}
                className="add-to-cart-btn"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="stats-modal" onClick={() => setStats(null)}>
          <div className="stats-content" onClick={(e) => e.stopPropagation()}>
            <h2>Store Statistics</h2>
            <div className="stats-grid">
              <div className="stat">
                <h3>Total Orders</h3>
                <p>{stats.totalOrders}</p>
              </div>
              <div className="stat">
                <h3>Items Purchased</h3>
                <p>{stats.totalItemsPurchased}</p>
              </div>
              <div className="stat">
                <h3>Total Revenue</h3>
                <p>${stats.totalRevenue}</p>
              </div>
              <div className="stat">
                <h3>Discount Codes</h3>
                <p>
                  {stats.discountCodes.total} total ({stats.discountCodes.used}{" "}
                  used)
                </p>
              </div>
              <div className="stat">
                <h3>Total Discounts</h3>
                <p>${stats.totalDiscountGiven}</p>
              </div>
            </div>
            <button onClick={() => setStats(null)} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="user-info">
        <small>User ID: {userId}</small>
      </div>
    </div>
  );
}

export default App;
