# Node.js Implementation Guide - Spensit E-Commerce API

Complete step-by-step guide for implementing a full e-commerce website using Node.js with the Spensit API.

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Project Structure](#project-structure)
3. [API Client Setup](#api-client-setup)
4. [Implementation Flow](#implementation-flow)
5. [Product Listing Page](#product-listing-page)
6. [Product Detail Page](#product-detail-page)
7. [Shopping Cart](#shopping-cart)
8. [Checkout Flow](#checkout-flow)
9. [Customer Authentication](#customer-authentication)
10. [Order Management](#order-management)
11. [Complete Code Examples](#complete-code-examples)
12. [Deployment Guide](#deployment-guide)

---

## Prerequisites & Setup

### Required Tools
- Node.js 18+ (for native fetch support)
- npm or yarn
- Code editor (VS Code recommended)

### Environment Variables

Create a `.env` file in your project root:

```env
# API Configuration
API_URL=https://api.yoursite.com
API_KEY=sk_live_your_api_key_here
DOMAIN=yourdomain.com
BRAND_ID=your-brand-uuid-here

# Application Configuration
PORT=3000
SESSION_SECRET=your-session-secret-here
NODE_ENV=development
```

### Install Dependencies

```bash
npm init -y
npm install express dotenv cookie-parser express-session
npm install ejs  # or your preferred template engine
npm install --save-dev nodemon
```

---

## Project Structure

```
your-ecommerce-site/
├── .env
├── .gitignore
├── package.json
├── server.js
├── config/
│   └── api.js
├── lib/
│   └── spensit-client.js
├── routes/
│   ├── products.js
│   ├── cart.js
│   ├── checkout.js
│   ├── auth.js
│   └── orders.js
├── middleware/
│   ├── auth.js
│   └── cart.js
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── cart.js
│       └── products.js
└── views/
    ├── layout.ejs
    ├── products/
    │   ├── list.ejs
    │   └── detail.ejs
    ├── cart/
    │   └── index.ejs
    ├── checkout/
    │   └── index.ejs
    ├── auth/
    │   ├── login.ejs
    │   └── register.ejs
    └── orders/
        └── list.ejs
```

---

## API Client Setup

### Create API Configuration (`config/api.js`)

```javascript
require('dotenv').config();

module.exports = {
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  domain: process.env.DOMAIN,
  brandId: process.env.BRAND_ID,
};
```

### Create Spensit API Client (`lib/spensit-client.js`)

```javascript
class SpensitAPIClient {
  constructor(config) {
    this.baseUrl = config.apiUrl;
    this.headers = {
      'x-api-key': config.apiKey,
      'x-domain': config.domain,
      'x-brand-id': config.brandId,
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getProduct(productId) {
    return this.request(`/api/products/${productId}`);
  }

  // Checkout
  async createCheckout(productIds, currency = null) {
    const payload = { product_ids: productIds };
    if (currency) payload.currency = currency;

    return this.request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Customers
  async createCustomer(customerData) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async loginCustomer(emailAddress, password) {
    return this.request('/api/customers/login', {
      method: 'POST',
      body: JSON.stringify({ email_address: emailAddress, password })
    });
  }

  async getCustomers(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return this.request(`/api/customers${queryString ? `?${queryString}` : ''}`);
  }

  // Orders
  async getCustomerOrders(customerId, filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return this.request(
      `/api/customers/${customerId}/orders${queryString ? `?${queryString}` : ''}`
    );
  }

  async cancelOrder(customerId, orderId) {
    return this.request(`/api/customers/${customerId}/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel' })
    });
  }
}

module.exports = SpensitAPIClient;
```

---

## Implementation Flow

### Complete User Journey

```
1. Browse Products → 2. View Product Details → 3. Add to Cart → 
4. Review Cart → 5. Checkout → 6. View Orders → 7. Manage Orders
```

### Data Flow Architecture

```
Frontend (Browser)
    ↓
Express Routes (Server)
    ↓
Spensit API Client
    ↓
Spensit API (External)
    ↓
Database (Managed by API)
```

---

## Product Listing Page

### Route Handler (`routes/products.js`)

```javascript
const express = require('express');
const router = express.Router();
const SpensitAPIClient = require('../lib/spensit-client');
const config = require('../config/api');

const apiClient = new SpensitAPIClient(config);

// GET /products - List all products with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      category: req.query.category,
      gender: req.query.gender,
      search: req.query.search,
      is_featured: req.query.featured,
      is_on_sale: req.query.sale,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      colors: req.query.colors, // comma-separated
      sizes: req.query.sizes    // comma-separated
    };

    const result = await apiClient.getProducts(filters);

    res.render('products/list', {
      products: result.data,
      pagination: result.pagination,
      filters: req.query,
      title: 'Shop Products'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).render('error', { 
      message: 'Failed to load products',
      error: error.message 
    });
  }
});

// GET /products/:id - Single product detail
router.get('/:id', async (req, res) => {
  try {
    const result = await apiClient.getProduct(req.params.id);

    res.render('products/detail', {
      product: result.data,
      title: result.data.name
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(404).render('error', { 
      message: 'Product not found',
      error: error.message 
    });
  }
});

module.exports = router;
```

### View Template (`views/products/list.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <h1>Products</h1>

    <!-- Filters -->
    <div class="filters">
      <form method="GET" action="/products">
        <input type="text" name="search" placeholder="Search products..." 
               value="<%= filters.search || '' %>">
        
        <select name="category">
          <option value="">All Categories</option>
          <option value="T-Shirts" <%= filters.category === 'T-Shirts' ? 'selected' : '' %>>T-Shirts</option>
          <option value="Tops" <%= filters.category === 'Tops' ? 'selected' : '' %>>Tops</option>
          <option value="Bottoms" <%= filters.category === 'Bottoms' ? 'selected' : '' %>>Bottoms</option>
        </select>

        <select name="gender">
          <option value="">All Genders</option>
          <option value="Men" <%= filters.gender === 'Men' ? 'selected' : '' %>>Men</option>
          <option value="Women" <%= filters.gender === 'Women' ? 'selected' : '' %>>Women</option>
          <option value="Unisex" <%= filters.gender === 'Unisex' ? 'selected' : '' %>>Unisex</option>
        </select>

        <input type="number" name="price_min" placeholder="Min Price" 
               value="<%= filters.price_min || '' %>">
        <input type="number" name="price_max" placeholder="Max Price" 
               value="<%= filters.price_max || '' %>">

        <label>
          <input type="checkbox" name="sale" value="true" 
                 <%= filters.sale ? 'checked' : '' %>>
          On Sale
        </label>

        <button type="submit">Filter</button>
      </form>
    </div>

    <!-- Product Grid -->
    <div class="product-grid">
      <% products.forEach(product => { %>
        <div class="product-card">
          <a href="/products/<%= product.id %>">
            <img src="<%= product.image_url || product.images[0] %>" 
                 alt="<%= product.name %>">
            <h3><%= product.name %></h3>
            
            <div class="price">
              <% if (product.is_on_sale) { %>
                <span class="original-price">$<%= product.original_price %></span>
                <span class="sale-price">$<%= product.price %></span>
                <span class="discount">-<%= product.discount_percentage %>%</span>
              <% } else { %>
                <span class="price">$<%= product.price %></span>
              <% } %>
            </div>

            <% if (product.is_featured) { %>
              <span class="badge featured">Featured</span>
            <% } %>
            <% if (product.is_new) { %>
              <span class="badge new">New</span>
            <% } %>
          </a>
        </div>
      <% }); %>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <% if (pagination.hasPreviousPage) { %>
        <a href="?page=<%= pagination.page - 1 %>&<%= new URLSearchParams(filters).toString() %>">
          Previous
        </a>
      <% } %>

      <span>Page <%= pagination.page %> of <%= pagination.totalPages %></span>

      <% if (pagination.hasNextPage) { %>
        <a href="?page=<%= pagination.page + 1 %>&<%= new URLSearchParams(filters).toString() %>">
          Next
        </a>
      <% } %>
    </div>
  </div>
</body>
</html>
```

---

## Product Detail Page

### View Template (`views/products/detail.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= product.name %></title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <div class="product-detail">
      <!-- Image Gallery -->
      <div class="product-images">
        <div class="main-image">
          <img id="mainImage" src="<%= product.images[0] %>" alt="<%= product.name %>">
        </div>
        <div class="thumbnail-gallery">
          <% product.images.forEach((image, index) => { %>
            <img src="<%= image %>" 
                 onclick="changeImage('<%= image %>')"
                 class="thumbnail <%= index === 0 ? 'active' : '' %>">
          <% }); %>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1><%= product.name %></h1>
        <p class="sku">SKU: <%= product.sku %></p>

        <div class="price-section">
          <% if (product.is_on_sale) { %>
            <span class="original-price">$<%= product.original_price %></span>
            <span class="sale-price">$<%= product.price %></span>
            <span class="discount-badge">Save <%= product.discount_percentage %>%</span>
          <% } else { %>
            <span class="price">$<%= product.price %></span>
          <% } %>
        </div>

        <div class="description">
          <% if (product.html_description) { %>
            <%- product.html_description %>
          <% } else { %>
            <p><%= product.description %></p>
          <% } %>
        </div>

        <!-- Color Selection -->
        <% if (product.colors && product.colors.length > 0) { %>
          <div class="color-selector">
            <label>Color:</label>
            <div class="color-options">
              <% product.colors.forEach(color => { %>
                <button class="color-btn" data-color="<%= color %>">
                  <%= color %>
                </button>
              <% }); %>
            </div>
          </div>
        <% } %>

        <!-- Size Selection -->
        <% if (product.sizes_available && product.sizes_available.length > 0) { %>
          <div class="size-selector">
            <label>Size:</label>
            <div class="size-options">
              <% product.sizes_available.forEach(size => { %>
                <% 
                  const stock = product.stock_by_size ? product.stock_by_size[size] : 0;
                  const available = stock > 0;
                %>
                <button class="size-btn <%= !available ? 'disabled' : '' %>" 
                        data-size="<%= size %>"
                        <%= !available ? 'disabled' : '' %>>
                  <%= size %>
                  <% if (!available) { %>
                    <span class="out-of-stock">Out of Stock</span>
                  <% } %>
                </button>
              <% }); %>
            </div>
          </div>
        <% } %>

        <!-- Add to Cart Form -->
        <form id="addToCartForm" class="add-to-cart-form">
          <input type="hidden" name="productId" value="<%= product.id %>">
          <input type="hidden" name="color" id="selectedColor">
          <input type="hidden" name="size" id="selectedSize">
          
          <div class="quantity-selector">
            <label>Quantity:</label>
            <input type="number" name="quantity" value="1" min="1" max="10">
          </div>

          <button type="submit" class="btn-add-to-cart">
            Add to Cart
          </button>
        </form>

        <!-- Product Details -->
        <div class="product-meta">
          <p><strong>Category:</strong> <%= product.category %></p>
          <p><strong>Gender:</strong> <%= product.gender %></p>
          <% if (product.materials && product.materials.length > 0) { %>
            <p><strong>Materials:</strong> <%= product.materials.join(', ') %></p>
          <% } %>
          <% if (product.item_weight_kg) { %>
            <p><strong>Weight:</strong> <%= product.item_weight_kg %> kg</p>
          <% } %>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/products.js"></script>
</body>
</html>
```

### Client-Side JavaScript (`public/js/products.js`)

```javascript
// Image gallery
function changeImage(imageUrl) {
  document.getElementById('mainImage').src = imageUrl;
  
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Color selection
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    document.getElementById('selectedColor').value = this.dataset.color;
  });
});

// Size selection
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.disabled) return;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    document.getElementById('selectedSize').value = this.dataset.size;
  });
});

// Add to cart
document.getElementById('addToCartForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = {
    productId: formData.get('productId'),
    color: formData.get('color'),
    size: formData.get('size'),
    quantity: parseInt(formData.get('quantity'))
  };

  try {
    const response = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Product added to cart!');
      updateCartCount(result.cartCount);
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add product to cart');
  }
});

function updateCartCount(count) {
  const cartBadge = document.querySelector('.cart-count');
  if (cartBadge) {
    cartBadge.textContent = count;
  }
}
```

---

## Shopping Cart

### Cart Middleware (`middleware/cart.js`)

```javascript
function initCart(req, res, next) {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      count: 0
    };
  }
  res.locals.cartCount = req.session.cart.count;
  next();
}

function getCartItems(cart) {
  return cart.items || [];
}

function addToCart(cart, item) {
  const existingIndex = cart.items.findIndex(
    i => i.productId === item.productId && 
         i.color === item.color && 
         i.size === item.size
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  cart.count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

function removeFromCart(cart, index) {
  if (index >= 0 && index < cart.items.length) {
    cart.items.splice(index, 1);
    cart.count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}

function updateQuantity(cart, index, quantity) {
  if (index >= 0 && index < cart.items.length) {
    cart.items[index].quantity = quantity;
    cart.count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}

function clearCart(cart) {
  cart.items = [];
  cart.count = 0;
}

module.exports = {
  initCart,
  getCartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
};
```

### Cart Routes (`routes/cart.js`)

```javascript
const express = require('express');
const router = express.Router();
const SpensitAPIClient = require('../lib/spensit-client');
const config = require('../config/api');
const { addToCart, removeFromCart, updateQuantity, getCartItems } = require('../middleware/cart');

const apiClient = new SpensitAPIClient(config);

// POST /cart/add - Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, color, size, quantity } = req.body;

    // Fetch product details from API
    const result = await apiClient.getProduct(productId);
    const product = result.data;

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.images[0],
      color: color || null,
      size: size || null,
      quantity: quantity || 1
    };

    addToCart(req.session.cart, cartItem);

    res.json({
      success: true,
      message: 'Product added to cart',
      cartCount: req.session.cart.count
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart'
    });
  }
});

// GET /cart - View cart
router.get('/', (req, res) => {
  const items = getCartItems(req.session.cart);
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.render('cart/index', {
    items,
    subtotal,
    title: 'Shopping Cart'
  });
});

// POST /cart/remove/:index - Remove item
router.post('/remove/:index', (req, res) => {
  const index = parseInt(req.params.index);
  removeFromCart(req.session.cart, index);
  res.redirect('/cart');
});

// POST /cart/update/:index - Update quantity
router.post('/update/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const quantity = parseInt(req.body.quantity);
  updateQuantity(req.session.cart, index, quantity);
  res.redirect('/cart');
});

module.exports = router;
```

### Cart View (`views/cart/index.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Shopping Cart</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <h1>Shopping Cart</h1>

    <% if (items.length === 0) { %>
      <div class="empty-cart">
        <p>Your cart is empty</p>
        <a href="/products" class="btn">Continue Shopping</a>
      </div>
    <% } else { %>
      <div class="cart-items">
        <% items.forEach((item, index) => { %>
          <div class="cart-item">
            <img src="<%= item.image %>" alt="<%= item.name %>">
            
            <div class="item-details">
              <h3><%= item.name %></h3>
              <% if (item.color) { %>
                <p>Color: <%= item.color %></p>
              <% } %>
              <% if (item.size) { %>
                <p>Size: <%= item.size %></p>
              <% } %>
            </div>

            <div class="item-quantity">
              <form action="/cart/update/<%= index %>" method="POST">
                <input type="number" name="quantity" value="<%= item.quantity %>" 
                       min="1" max="10" onchange="this.form.submit()">
              </form>
            </div>

            <div class="item-price">
              $<%= (item.price * item.quantity).toFixed(2) %>
            </div>

            <div class="item-remove">
              <form action="/cart/remove/<%= index %>" method="POST">
                <button type="submit" class="btn-remove">Remove</button>
              </form>
            </div>
          </div>
        <% }); %>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>$<%= subtotal.toFixed(2) %></span>
        </div>
        
        <div class="cart-actions">
          <a href="/products" class="btn btn-secondary">Continue Shopping</a>
          <a href="/checkout" class="btn btn-primary">Proceed to Checkout</a>
        </div>
      </div>
    <% } %>
  </div>
</body>
</html>
```

---

## Checkout Flow

### Checkout Route (`routes/checkout.js`)

```javascript
const express = require('express');
const router = express.Router();
const SpensitAPIClient = require('../lib/spensit-client');
const config = require('../config/api');
const { getCartItems, clearCart } = require('../middleware/cart');

const apiClient = new SpensitAPIClient(config);

// GET /checkout - Display checkout page
router.get('/', (req, res) => {
  const items = getCartItems(req.session.cart);

  if (items.length === 0) {
    return res.redirect('/cart');
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.render('checkout/index', {
    items,
    subtotal,
    customer: req.session.customer || null,
    title: 'Checkout'
  });
});

// POST /checkout/process - Create checkout session
router.post('/process', async (req, res) => {
  try {
    const items = getCartItems(req.session.cart);

    if (items.length === 0) {
      return res.redirect('/cart');
    }

    // Extract product IDs from cart
    const productIds = items.map(item => item.productId);

    // Create checkout session via API
    // IMPORTANT: Prices are calculated server-side by the API
    const result = await apiClient.createCheckout(productIds, req.body.currency);

    if (result.success) {
      // Clear cart after successful checkout creation
      clearCart(req.session.cart);

      // Redirect to the checkout URL provided by API
      res.redirect(result.data.checkout_url);
    } else {
      throw new Error('Checkout creation failed');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).render('error', {
      message: 'Checkout failed',
      error: error.message
    });
  }
});

module.exports = router;
```

### Checkout View (`views/checkout/index.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Checkout</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <h1>Checkout</h1>

    <div class="checkout-container">
      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Order Summary</h2>
        
        <div class="summary-items">
          <% items.forEach(item => { %>
            <div class="summary-item">
              <img src="<%= item.image %>" alt="<%= item.name %>">
              <div class="item-info">
                <h4><%= item.name %></h4>
                <% if (item.color) { %><p>Color: <%= item.color %></p><% } %>
                <% if (item.size) { %><p>Size: <%= item.size %></p><% } %>
                <p>Qty: <%= item.quantity %></p>
              </div>
              <div class="item-price">
                $<%= (item.price * item.quantity).toFixed(2) %>
              </div>
            </div>
          <% }); %>
        </div>

        <div class="summary-total">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$<%= subtotal.toFixed(2) %></span>
          </div>
          <p class="note">
            * Final prices including VAT and shipping will be calculated on the checkout page
          </p>
        </div>
      </div>

      <!-- Checkout Form -->
      <div class="checkout-form">
        <h2>Proceed to Payment</h2>
        
        <form action="/checkout/process" method="POST">
          <div class="form-group">
            <label>Currency (Optional):</label>
            <select name="currency">
              <option value="">Default Currency</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          <div class="important-notice">
            <h3>⚠️ Important</h3>
            <p>
              Prices are calculated securely on our server. 
              You will be redirected to a secure checkout page to complete your purchase.
            </p>
          </div>

          <button type="submit" class="btn btn-primary btn-large">
            Continue to Secure Checkout
          </button>
        </form>

        <div class="security-badges">
          <p>🔒 Secure Checkout</p>
          <p>💳 Multiple Payment Methods</p>
          <p>✓ Price Protection</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## Customer Authentication

### Auth Middleware (`middleware/auth.js`)

```javascript
function requireAuth(req, res, next) {
  if (!req.session.customer) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function attachCustomer(req, res, next) {
  res.locals.customer = req.session.customer || null;
  next();
}

module.exports = {
  requireAuth,
  attachCustomer
};
```

### Auth Routes (`routes/auth.js`)

```javascript
const express = require('express');
const router = express.Router();
const SpensitAPIClient = require('../lib/spensit-client');
const config = require('../config/api');

const apiClient = new SpensitAPIClient(config);

// GET /auth/register - Registration page
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

// POST /auth/register - Handle registration
router.post('/register', async (req, res) => {
  try {
    const {
      customer_name,
      email_address,
      password,
      phone_number,
      billing_address,
      delivery_address
    } = req.body;

    const result = await apiClient.createCustomer({
      customer_name,
      email_address,
      password,
      phone_number,
      billing_address,
      delivery_address
    });

    if (result.success) {
      // Auto-login after registration
      req.session.customer = {
        id: result.data.customer_id,
        name: result.data.customer_name,
        email: result.data.email_address
      };

      res.redirect('/products');
    } else {
      throw new Error('Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register',
      error: error.message || 'Registration failed'
    });
  }
});

// GET /auth/login - Login page
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    redirect: req.query.redirect || '/products'
  });
});

// POST /auth/login - Handle login
router.post('/login', async (req, res) => {
  try {
    const { email_address, password } = req.body;
    const redirect = req.body.redirect || '/products';

    const result = await apiClient.loginCustomer(email_address, password);

    if (result.success) {
      req.session.customer = {
        id: result.data.customer_id,
        name: result.data.customer_name,
        email: result.data.email_address
      };

      res.redirect(redirect);
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      redirect: req.body.redirect || '/products',
      error: 'Invalid email or password'
    });
  }
});

// GET /auth/logout - Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/products');
});

module.exports = router;
```

### Login View (`views/auth/login.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <div class="auth-form">
      <h1>Login</h1>

      <% if (typeof error !== 'undefined') { %>
        <div class="error-message"><%= error %></div>
      <% } %>

      <form method="POST" action="/auth/login">
        <input type="hidden" name="redirect" value="<%= redirect %>">

        <div class="form-group">
          <label for="email_address">Email Address:</label>
          <input type="email" id="email_address" name="email_address" required>
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required>
        </div>

        <button type="submit" class="btn btn-primary">Login</button>
      </form>

      <p class="auth-link">
        Don't have an account? <a href="/auth/register">Register here</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### Register View (`views/auth/register.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Register</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <div class="auth-form">
      <h1>Create Account</h1>

      <% if (typeof error !== 'undefined') { %>
        <div class="error-message"><%= error %></div>
      <% } %>

      <form method="POST" action="/auth/register">
        <div class="form-group">
          <label for="customer_name">Full Name:</label>
          <input type="text" id="customer_name" name="customer_name" required>
        </div>

        <div class="form-group">
          <label for="email_address">Email Address:</label>
          <input type="email" id="email_address" name="email_address" required>
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required minlength="8">
        </div>

        <div class="form-group">
          <label for="phone_number">Phone Number (Optional):</label>
          <input type="tel" id="phone_number" name="phone_number">
        </div>

        <div class="form-group">
          <label for="billing_address">Billing Address (Optional):</label>
          <textarea id="billing_address" name="billing_address" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label for="delivery_address">Delivery Address (Optional):</label>
          <textarea id="delivery_address" name="delivery_address" rows="3"></textarea>
        </div>

        <button type="submit" class="btn btn-primary">Register</button>
      </form>

      <p class="auth-link">
        Already have an account? <a href="/auth/login">Login here</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Order Management

### Orders Route (`routes/orders.js`)

```javascript
const express = require('express');
const router = express.Router();
const SpensitAPIClient = require('../lib/spensit-client');
const config = require('../config/api');
const { requireAuth } = require('../middleware/auth');

const apiClient = new SpensitAPIClient(config);

// GET /orders - List customer orders (requires authentication)
router.get('/', requireAuth, async (req, res) => {
  try {
    const customerId = req.session.customer.id;
    
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      status: req.query.status,
      payment_status: req.query.payment_status
    };

    const result = await apiClient.getCustomerOrders(customerId, filters);

    res.render('orders/list', {
      orders: result.data,
      pagination: result.pagination,
      filters: req.query,
      title: 'My Orders'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).render('error', {
      message: 'Failed to load orders',
      error: error.message
    });
  }
});

// POST /orders/:orderId/cancel - Cancel an order
router.post('/:orderId/cancel', requireAuth, async (req, res) => {
  try {
    const customerId = req.session.customer.id;
    const orderId = req.params.orderId;

    const result = await apiClient.cancelOrder(customerId, orderId);

    if (result.success) {
      res.redirect('/orders?message=Order cancelled successfully');
    } else {
      throw new Error('Failed to cancel order');
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.redirect('/orders?error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;
```

### Orders View (`views/orders/list.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Orders</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container">
    <h1>My Orders</h1>

    <!-- Filters -->
    <div class="filters">
      <form method="GET" action="/orders">
        <select name="status">
          <option value="">All Statuses</option>
          <option value="pending" <%= filters.status === 'pending' ? 'selected' : '' %>>Pending</option>
          <option value="processing" <%= filters.status === 'processing' ? 'selected' : '' %>>Processing</option>
          <option value="shipped" <%= filters.status === 'shipped' ? 'selected' : '' %>>Shipped</option>
          <option value="delivered" <%= filters.status === 'delivered' ? 'selected' : '' %>>Delivered</option>
          <option value="cancelled" <%= filters.status === 'cancelled' ? 'selected' : '' %>>Cancelled</option>
        </select>

        <select name="payment_status">
          <option value="">All Payment Statuses</option>
          <option value="pending" <%= filters.payment_status === 'pending' ? 'selected' : '' %>>Pending</option>
          <option value="paid" <%= filters.payment_status === 'paid' ? 'selected' : '' %>>Paid</option>
          <option value="failed" <%= filters.payment_status === 'failed' ? 'selected' : '' %>>Failed</option>
        </select>

        <button type="submit">Filter</button>
      </form>
    </div>

    <!-- Orders List -->
    <% if (orders.length === 0) { %>
      <div class="no-orders">
        <p>You haven't placed any orders yet.</p>
        <a href="/products" class="btn">Start Shopping</a>
      </div>
    <% } else { %>
      <div class="orders-list">
        <% orders.forEach(order => { %>
          <div class="order-card">
            <div class="order-header">
              <div>
                <h3>Order #<%= order.id.substring(0, 8) %></h3>
                <p class="order-date">
                  Placed on <%= new Date(order.created_at).toLocaleDateString() %>
                </p>
              </div>
              <div class="order-status">
                <span class="badge status-<%= order.order_status %>">
                  <%= order.order_status %>
                </span>
                <span class="badge payment-<%= order.payment_status %>">
                  Payment: <%= order.payment_status %>
                </span>
              </div>
            </div>

            <div class="order-details">
              <p><strong>Total:</strong> <%= order.currency %> <%= order.total_price %></p>
              <p><strong>Items:</strong> <%= order.items ? order.items.length : 'N/A' %></p>
              
              <% if (order.delivery_address) { %>
                <p><strong>Delivery Address:</strong> <%= order.delivery_address %></p>
              <% } %>
            </div>

            <div class="order-actions">
              <a href="/orders/<%= order.id %>" class="btn btn-secondary">View Details</a>
              
              <% if (order.order_status !== 'cancelled' && order.order_status !== 'delivered') { %>
                <form action="/orders/<%= order.id %>/cancel" method="POST" 
                      onsubmit="return confirm('Are you sure you want to cancel this order?')">
                  <button type="submit" class="btn btn-danger">Cancel Order</button>
                </form>
              <% } %>
            </div>
          </div>
        <% }); %>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <% if (pagination.hasPreviousPage) { %>
          <a href="?page=<%= pagination.page - 1 %>&<%= new URLSearchParams(filters).toString() %>">
            Previous
          </a>
        <% } %>

        <span>Page <%= pagination.page %> of <%= pagination.totalPages %></span>

        <% if (pagination.hasNextPage) { %>
          <a href="?page=<%= pagination.page + 1 %>&<%= new URLSearchParams(filters).toString() %>">
            Next
          </a>
        <% } %>
      </div>
    <% } %>
  </div>
</body>
</html>
```

---

## Complete Server Setup (`server.js`)

```javascript
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const { initCart } = require('./middleware/cart');
const { attachCustomer } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Custom middleware
app.use(initCart);
app.use(attachCustomer);

// Routes
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));
app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders'));

// Home route
app.get('/', (req, res) => {
  res.redirect('/products');
});

// Error handling
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: 'The page you are looking for does not exist.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## Package.json Configuration

```json
{
  "name": "spensit-ecommerce-site",
  "version": "1.0.0",
  "description": "E-commerce website using Spensit API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["ecommerce", "spensit", "nodejs", "express"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-session": "^1.17.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Basic CSS Styling (`public/css/styles.css`)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f4f4;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.product-card h3 {
  padding: 15px;
  font-size: 1.1rem;
}

.product-card .price {
  padding: 0 15px 15px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 10px;
}

.sale-price {
  color: #e74c3c;
}

.discount {
  background: #e74c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin: 5px;
}

.badge.featured {
  background: #3498db;
  color: white;
}

.badge.new {
  background: #2ecc71;
  color: white;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: #2980b9;
}

.btn-primary {
  background: #3498db;
}

.btn-secondary {
  background: #95a5a6;
}

.btn-danger {
  background: #e74c3c;
}

.btn-large {
  padding: 15px 30px;
  font-size: 1.1rem;
}

/* Forms */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

/* Cart */
.cart-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.item-details {
  flex: 1;
}

.cart-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
}

.pagination a {
  padding: 8px 15px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .cart-item {
    flex-direction: column;
    text-align: center;
  }
}
```

---

## Deployment Guide

### 1. Environment Setup

Create production `.env`:
```env
NODE_ENV=production
API_URL=https://your-production-api.com
API_KEY=sk_live_your_production_key
DOMAIN=yourdomain.com
BRAND_ID=your-brand-id
PORT=3000
SESSION_SECRET=generate-strong-random-secret
```

### 2. Security Checklist

- ✅ Use HTTPS in production
- ✅ Set secure session cookies
- ✅ Never commit `.env` to git
- ✅ Use environment variables for all secrets
- ✅ Implement rate limiting
- ✅ Add CSRF protection
- ✅ Sanitize user inputs
- ✅ Keep dependencies updated

### 3. Deployment Platforms

**Heroku:**
```bash
heroku create your-app-name
heroku config:set API_KEY=your-key
heroku config:set DOMAIN=your-domain
heroku config:set BRAND_ID=your-brand-id
git push heroku main
```

**Vercel/Netlify:**
- Add environment variables in dashboard
- Configure build settings
- Deploy from Git repository

**VPS (Ubuntu):**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone your-repo
cd your-repo
npm install
pm2 start server.js --name ecommerce-site
pm2 save
pm2 startup
```

### 4. Performance Optimization

- Implement caching for product listings
- Use CDN for static assets
- Enable gzip compression
- Optimize images
- Add database connection pooling if needed

---

## Testing Your Implementation

### 1. Test Product Listing
```bash
curl http://localhost:3000/products
```

### 2. Test API Client
```javascript
// test.js
const SpensitAPIClient = require('./lib/spensit-client');
const config = require('./config/api');

const client = new SpensitAPIClient(config);

async function test() {
  const products = await client.getProducts({ limit: 5 });
  console.log('Products:', products);
}

test();
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Summary

This guide provides a complete implementation of an e-commerce website using Node.js and the Spensit API. The implementation includes:

✅ **Product browsing** with filtering and search
✅ **Shopping cart** with session management  
✅ **Secure checkout** with server-side price calculation
✅ **Customer authentication** (register/login)
✅ **Order management** with cancellation
✅ **Responsive design** with modern UI
✅ **Production-ready** deployment guide

### Key Security Features

- Server-side price calculation (prices never trusted from client)
- Session-based cart management
- Secure authentication flow
- Environment-based configuration
- HTTPS-ready for production

### Next Steps

1. Customize the UI/UX to match your brand
2. Add payment gateway integration
3. Implement email notifications
4. Add product reviews and ratings
5. Create admin dashboard
6. Add analytics tracking
7. Implement SEO optimization
8. Add automated testing

For questions or issues, refer to the main `CLIENT_EXAMPLES.md` file or API documentation.
