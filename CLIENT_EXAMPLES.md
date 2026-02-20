# API Client Examples - Multi-Language Support

Complete code examples for integrating with the Spensit API in various programming languages.

## ⚠️ Important Security Note

**Checkout API Pricing:** The `/api/checkout` endpoint **ALWAYS calculates prices server-side** from the product database for security. Any client-supplied `subtotal`, `total_price`, or `vat` parameters are **ignored**. Only `product_ids` and `currency` are accepted.

## Base Configuration

All examples use these environment variables:
- `API_URL`: Your API endpoint (e.g., `https://api.yoursite.com/api/products`)
- `API_KEY`: Your API key
- `DOMAIN`: Your authorized domain
- `BRAND_ID`: Your brand UUID

## API Endpoints

1. **GET /api/products** - Fetch products with filtering
2. **GET /api/products/[id]** - Fetch single product
3. **POST /api/checkout** - Create checkout session
4. **POST /api/customers** - Create customer account
5. **GET /api/customers** - Get customers list
6. **POST /api/customers/login** - Customer login
7. **GET /api/customers/[customerId]/orders** - Get customer orders
8. **PATCH /api/customers/[customerId]/orders/[orderId]** - Cancel customer order (NEW)

---

## cURL

### Basic Request

```bash
#!/bin/bash

API_URL="https://api.yoursite.com/api/products"
API_KEY="sk_live_your_api_key_here"
DOMAIN="example.com"
BRAND_ID="your-brand-uuid-here"

# Get all products
curl -X GET "${API_URL}?page=1&limit=20" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-domain: ${DOMAIN}" \
  -H "x-brand-id: ${BRAND_ID}" \
  -H "Content-Type: application/json"

# Get single product
curl -X GET "${API_URL}/product-uuid-here" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-domain: ${DOMAIN}" \
  -H "x-brand-id: ${BRAND_ID}" \
  -H "Content-Type: application/json"

# Search products
curl -X GET "${API_URL}?search=shirt&category=T-Shirts&gender=Men" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-domain: ${DOMAIN}" \
  -H "x-brand-id: ${BRAND_ID}" \
  -H "Content-Type: application/json"

# Create checkout session
CHECKOUT_URL="https://api.yoursite.com/api/checkout"
curl -X POST "${CHECKOUT_URL}" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-domain: ${DOMAIN}" \
  -H "x-brand-id: ${BRAND_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": ["uuid1", "uuid2", "uuid3"]
  }'

# Create checkout with custom currency
curl -X POST "${CHECKOUT_URL}" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-domain: ${DOMAIN}" \
  -H "x-brand-id: ${BRAND_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": ["uuid1", "uuid2"],
    "currency": "USD"
  }'
```
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

### Advanced with Error Handling

```bash
#!/bin/bash

API_URL="https://api.yoursite.com/api/products"
API_KEY="${API_KEY}"
DOMAIN="${DOMAIN}"
BRAND_ID="${BRAND_ID}"

response=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-domain: ${DOMAIN}" \
  -H "x-brand-id: ${BRAND_ID}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
  echo "$body" | jq '.'
else
  echo "Error: HTTP $http_code"
  echo "$body" | jq '.'
fi
```

---

## Python

### Using requests library

```python
import requests
import os
from typing import Optional, Dict, Any

class SpensitAPI:
    def __init__(self, api_key: str, domain: str, brand_id: str, base_url: str):
        self.api_key = api_key
        self.domain = domain
        self.brand_id = brand_id
        self.base_url = base_url
        self.headers = {
            'x-api-key': api_key,
            'x-domain': domain,
            'x-brand-id': brand_id,
            'Content-Type': 'application/json'
        }
    
    def get_products(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None,
        gender: Optional[str] = None,
        featured: Optional[bool] = None,
        on_sale: Optional[bool] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """Fetch products with optional filters"""
        params = {
            'page': page,
            'limit': limit
        }
        
        if category:
            params['category'] = category
        if gender:
            params['gender'] = gender
        if featured is not None:
            params['is_featured'] = str(featured).lower()
        if on_sale is not None:
            params['is_on_sale'] = str(on_sale).lower()
        if search:
            params['search'] = search
        
        response = requests.get(
            f"{self.base_url}/api/products",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_product(self, product_id: str) -> Dict[str, Any]:
        """Fetch a single product by ID"""
        response = requests.get(
            f"{self.base_url}/api/products/{product_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def create_checkout(
        self,
        product_ids: list[str],
        currency: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a checkout session
        
        IMPORTANT: Prices are ALWAYS calculated server-side from the database.
        Client-supplied subtotal/total_price/vat are ignored for security.
        
        Args:
            product_ids: List of product UUIDs from clothes table (required)
            currency: Custom currency code (optional, uses brand default if not provided)
        
        Returns:
            Checkout session data with link_id and checkout_url for redirection
        """
        payload = {
            "product_ids": product_ids
        }
        if currency is not None:
            payload["currency"] = currency
        
        response = requests.post(
            f"{self.base_url}/api/checkout",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage - Create checkout and redirect
# Prices are ALWAYS calculated server-side from the database for security
checkout = api.create_checkout(
    product_ids=["uuid1", "uuid2", "uuid3"],
    currency="USD"  # Optional, uses brand default if not provided
)
# Redirect user to checkout page
# In web: window.location.href = checkout['data']['checkout_url']
# In backend: redirect(checkout['data']['checkout_url'])
print(f"Redirect to: {checkout['data']['checkout_url']}")

    def create_customer(
        self,
        customer_name: str,
        email_address: str,
        password: Optional[str] = None,
        phone_number: Optional[str] = None,
        billing_address: Optional[str] = None,
        delivery_address: Optional[str] = None,
        currency: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a customer account
        
        Args:
            customer_name: Customer's full name (required)
            email_address: Customer's email (required)
            password: Customer password (optional, will be hashed)
            phone_number: Customer phone number (optional)
            billing_address: Billing address (optional)
            delivery_address: Delivery address (optional)
            currency: Currency code (optional, uses brand default)
            **kwargs: Additional optional fields
        
        Returns:
            Created customer data (password excluded from response)
        """
        payload = {
            "customer_name": customer_name,
            "email_address": email_address
        }
        if password:
            payload["password"] = password
        if phone_number:
            payload["phone_number"] = phone_number
        if billing_address:
            payload["billing_address"] = billing_address
        if delivery_address:
            payload["delivery_address"] = delivery_address
        if currency:
            payload["currency"] = currency
        
        # Add any additional fields
        payload.update(kwargs)
        
        response = requests.post(
            f"{self.base_url}/api/customers",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_customers(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get customers with pagination and search
        
        Args:
            page: Page number (default: 1)
            limit: Items per page (default: 20, max: 100)
            search: Search in customer_name, email_address, phone_number
            email: Filter by exact email address
        
        Returns:
            Customers list with pagination
        """
        params = {"page": page, "limit": limit}
        if search:
            params["search"] = search
        if email:
            params["email"] = email
        
        response = requests.get(
            f"{self.base_url}/api/customers",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def login_customer(
        self,
        email_address: str,
        password: str
    ) -> Dict[str, Any]:
        """Customer login - validates email and password
        
        Args:
            email_address: Customer email address
            password: Customer password
        
        Returns:
            Customer data with customer_id for use in subsequent API calls
        """
        response = requests.post(
            f"{self.base_url}/api/customers/login",
            headers=self.headers,
            json={
                "email_address": email_address,
                "password": password
            }
        )
        response.raise_for_status()
        return response.json()
    
    def get_customer_orders(
        self,
        customer_id: str,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        payment_status: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get orders for a customer
        
        Args:
            customer_id: Customer UUID (obtained from login)
            page: Page number (default: 1)
            limit: Items per page (default: 20, max: 100)
            status: Filter by order_status (optional)
            payment_status: Filter by payment_status (optional)
        
        Returns:
            Orders list with pagination
        """
        params = {"page": page, "limit": limit}
        if status:
            params["status"] = status
        if payment_status:
            params["payment_status"] = payment_status
        
        response = requests.get(
            f"{self.base_url}/api/customers/{customer_id}/orders",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def cancel_order(
        self,
        customer_id: str,
        order_id: str
    ) -> Dict[str, Any]:
        """Cancel a customer's order
        
        Args:
            customer_id: Customer UUID (obtained from login)
            order_id: Order UUID to cancel
        
        Returns:
            Updated order data with cancelled status
        """
        response = requests.patch(
            f"{self.base_url}/api/customers/{customer_id}/orders/{order_id}",
            headers=self.headers,
            json={"action": "cancel"}
        )
        response.raise_for_status()
        return response.json()

# Usage - Create customer
customer = api.create_customer(
    customer_name="John Doe",
    email_address="john@example.com",
    password="securepassword123",
    phone_number="+1234567890",
    billing_address="123 Main St"
)
print(f"Created customer: {customer['data']['customer_name']}")

# Get customers
customers = api.get_customers(page=1, limit=20, search="john")
print(f"Found {customers['pagination']['total']} customers")
        """Fetch a single product by ID"""
        response = requests.get(
            f"{self.base_url}/api/products/{product_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
api = SpensitAPI(
    api_key=os.getenv('API_KEY'),
    domain=os.getenv('DOMAIN'),
    brand_id=os.getenv('BRAND_ID'),
    base_url=os.getenv('API_URL', 'https://api.yoursite.com')
)

# Get all products
products = api.get_products(page=1, limit=20, featured=True)

# Get single product
product = api.get_product('product-uuid-here')

# Search products
results = api.get_products(search='shirt', category='T-Shirts')
```

### Using httpx (async)

```python
import httpx
import asyncio
import os

async def fetch_products_async(
    api_key: str,
    domain: str,
    brand_id: str,
    base_url: str,
    page: int = 1,
    limit: int = 20
):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{base_url}/api/products",
            headers={
                'x-api-key': api_key,
                'x-domain': domain,
                'x-brand-id': brand_id
            },
            params={'page': page, 'limit': limit}
        )
        response.raise_for_status()
        return response.json()

# Usage
products = asyncio.run(fetch_products_async(
    os.getenv('API_KEY'),
    os.getenv('DOMAIN'),
    os.getenv('BRAND_ID'),
    os.getenv('API_URL')
))
```

---

## Node.js / TypeScript

### Using fetch (Node.js 18+)

```typescript
interface ApiConfig {
  apiKey: string;
  domain: string;
  brandId: string;
  baseUrl: string;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  gender?: string;
  featured?: boolean;
  onSale?: boolean;
  search?: string;
}

class SpensitAPI {
  private headers: Record<string, string>;

  constructor(config: ApiConfig) {
    this.headers = {
      'x-api-key': config.apiKey,
      'x-domain': config.domain,
      'x-brand-id': config.brandId,
      'Content-Type': 'application/json'
    };
    this.baseUrl = config.baseUrl;
  }

  async getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.featured !== undefined) params.append('is_featured', filters.featured.toString());
    if (filters.onSale !== undefined) params.append('is_on_sale', filters.onSale.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(
      `${this.baseUrl}/api/products?${params.toString()}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProduct(productId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/products/${productId}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createCheckout(
    productIds: string[],
    options?: {
      currency?: string;
    }
  ) {
    /**
     * IMPORTANT: Prices are ALWAYS calculated server-side from the database.
     * Client-supplied subtotal/total_price/vat are ignored for security.
     */
    const payload: any = { product_ids: productIds };
    
    if (options?.currency !== undefined) payload.currency = options.currency;

    const response = await fetch(
      `${this.baseUrl}/api/checkout`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createCustomer(
    customerName: string,
    emailAddress: string,
    options?: {
      password?: string;
      phoneNumber?: string;
      billingAddress?: string;
      deliveryAddress?: string;
      currency?: string;
    }
  ) {
    const payload: any = {
      customer_name: customerName,
      email_address: emailAddress
    };
    
    if (options?.password) payload.password = options.password;
    if (options?.phoneNumber) payload.phone_number = options.phoneNumber;
    if (options?.billingAddress) payload.billing_address = options.billingAddress;
    if (options?.deliveryAddress) payload.delivery_address = options.deliveryAddress;
    if (options?.currency) payload.currency = options.currency;

    const response = await fetch(
      `${this.baseUrl}/api/customers`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async loginCustomer(emailAddress: string, password: string) {
    const response = await fetch(
      `${this.baseUrl}/api/customers/login`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email_address: emailAddress,
          password: password
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCustomerOrders(
    customerId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
      paymentStatus?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.paymentStatus) params.append('payment_status', options.paymentStatus);

    const response = await fetch(
      `${this.baseUrl}/api/customers/${customerId}/orders?${params.toString()}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCustomers(options?: {
    page?: number;
    limit?: number;
    search?: string;
    email?: string;
  }) {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.email) params.append('email', options.email);

    const response = await fetch(
      `${this.baseUrl}/api/customers?${params.toString()}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async cancelOrder(customerId: string, orderId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/customers/${customerId}/orders/${orderId}`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ action: 'cancel' })
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage - Create checkout and redirect
// Prices are calculated server-side from product database
const checkout = await api.createCheckout(['uuid1', 'uuid2', 'uuid3']);
// Redirect user to checkout page
window.location.href = checkout.data.checkout_url;
// Or in server-side: res.redirect(checkout.data.checkout_url);

// Usage - Create customer
const customer = await api.createCustomer(
  'John Doe',
  'john@example.com',
  {
    password: 'securepassword123',
    phoneNumber: '+1234567890'
  }
);

// Get customers
const customers = await api.getCustomers({ page: 1, limit: 20, search: 'john' });

// Customer Login
const loginResponse = await api.loginCustomer('john@example.com', 'securepassword123');
const customerId = loginResponse.data.customer_id;
console.log(`Logged in as: ${loginResponse.data.customer_name}`);

// Get Customer Orders
const orders = await api.getCustomerOrders(customerId, { page: 1, limit: 20 });
console.log(`Found ${orders.pagination.total} orders`);

// Cancel Order
if (orders.data.length > 0) {
  const orderId = orders.data[0].id;
  const cancelResult = await api.cancelOrder(customerId, orderId);
  console.log(`Order cancelled: ${cancelResult.message}`);
}

// Usage
const api = new SpensitAPI({
  apiKey: process.env.API_KEY!,
  domain: process.env.DOMAIN!,
  brandId: process.env.BRAND_ID!,
  baseUrl: process.env.API_URL || 'https://api.yoursite.com'
});

// Get products
const { data, pagination } = await api.getProducts({
  page: 1,
  limit: 20,
  featured: true
});

// Get single product
const product = await api.getProduct('product-uuid-here');

// Create checkout and redirect user
// Prices are ALWAYS calculated server-side for security
const checkout = await api.createCheckout(
  ['uuid1', 'uuid2', 'uuid3'],
  { currency: 'USD' }
);
// Redirect user to checkout page
window.location.href = checkout.data.checkout_url;
// Server-side redirect: res.redirect(checkout.data.checkout_url);
```

### Using axios

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_URL || 'https://api.yoursite.com',
  headers: {
    'x-api-key': process.env.API_KEY,
    'x-domain': process.env.DOMAIN,
    'x-brand-id': process.env.BRAND_ID,
    'Content-Type': 'application/json'
  }
});

// Get products
async function getProducts(filters = {}) {
  try {
    const response = await api.get('/api/products', { params: filters });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
getProducts({ page: 1, limit: 20, featured: true })
  .then(({ data, pagination }) => {
    console.log(`Found ${pagination.total} products`);
    console.log(data);
  });
```

---

## Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "os"
)

type SpensitAPI struct {
    APIKey  string
    Domain  string
    BrandID string
    BaseURL string
    client  *http.Client
}

type ProductFilters struct {
    Page     int
    Limit    int
    Category string
    Gender   string
    Featured string
    OnSale   string
    Search   string
}

type ProductsResponse struct {
    Success    bool      `json:"success"`
    Data       []Product `json:"data"`
    Pagination struct {
        Page          int  `json:"page"`
        Limit         int  `json:"limit"`
        Total         int  `json:"total"`
        TotalPages    int  `json:"totalPages"`
        HasNextPage   bool `json:"hasNextPage"`
        HasPreviousPage bool `json:"hasPreviousPage"`
    } `json:"pagination"`
}

type Product struct {
    ID                string      `json:"id"`
    Name              string      `json:"name"`
    Description       string      `json:"description"`
    Price             float64     `json:"price"`
    OriginalPrice     float64     `json:"original_price"`
    Images            []string    `json:"images"`
    SizesAvailable    interface{} `json:"sizes_available"`
    StockBySize       interface{} `json:"stock_by_size"`
    StockByColorSize  interface{} `json:"stock_by_color_size"`
    Colors            []string    `json:"colors"`
    Category          string      `json:"category"`
    Gender            string      `json:"gender"`
    SKU               string      `json:"sku"`
    // Add all other fields as needed
}

func NewSpensitAPI(apiKey, domain, brandID, baseURL string) *SpensitAPI {
    return &SpensitAPI{
        APIKey:  apiKey,
        Domain:  domain,
        BrandID: brandID,
        BaseURL: baseURL,
        client:  &http.Client{},
    }
}

func (api *SpensitAPI) GetProducts(filters ProductFilters) (*ProductsResponse, error) {
    u, err := url.Parse(api.BaseURL + "/api/products")
    if err != nil {
        return nil, err
    }

    q := u.Query()
    if filters.Page > 0 {
        q.Set("page", fmt.Sprintf("%d", filters.Page))
    }
    if filters.Limit > 0 {
        q.Set("limit", fmt.Sprintf("%d", filters.Limit))
    }
    if filters.Category != "" {
        q.Set("category", filters.Category)
    }
    if filters.Gender != "" {
        q.Set("gender", filters.Gender)
    }
    if filters.Featured != "" {
        q.Set("featured", filters.Featured)
    }
    if filters.OnSale != "" {
        q.Set("on_sale", filters.OnSale)
    }
    if filters.Search != "" {
        q.Set("search", filters.Search)
    }
    u.RawQuery = q.Encode()

    req, err := http.NewRequest("GET", u.String(), nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("x-api-key", api.APIKey)
    req.Header.Set("x-domain", api.Domain)
    req.Header.Set("x-brand-id", api.BrandID)
    req.Header.Set("Content-Type", "application/json")

    resp, err := api.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
    }

    var result ProductsResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result, nil
}

func (api *SpensitAPI) GetProduct(productID string) (*Product, error) {
    req, err := http.NewRequest("GET", api.BaseURL+"/api/products/"+productID, nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("x-api-key", api.APIKey)
    req.Header.Set("x-domain", api.Domain)
    req.Header.Set("x-brand-id", api.BrandID)
    req.Header.Set("Content-Type", "application/json")

    resp, err := api.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
    }

    var result struct {
        Success bool    `json:"success"`
        Data    Product `json:"data"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result.Data, nil
}

func main() {
    api := NewSpensitAPI(
        os.Getenv("API_KEY"),
        os.Getenv("DOMAIN"),
        os.Getenv("BRAND_ID"),
        os.Getenv("API_URL"),
    )

    // Get products
    products, err := api.GetProducts(ProductFilters{
        Page:     1,
        Limit:    20,
        Featured: "true",
    })
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Found %d products\n", products.Pagination.Total)
    for _, product := range products.Data {
        fmt.Printf("- %s: $%.2f\n", product.Name, product.Price)
    }
}
```

---

## Ruby

```ruby
require 'net/http'
require 'json'
require 'uri'

class SpensitAPI
  def initialize(api_key, domain, brand_id, base_url)
    @api_key = api_key
    @domain = domain
    @brand_id = brand_id
    @base_url = base_url
  end

  def get_products(filters = {})
    uri = URI("#{@base_url}/api/products")
    params = {
      'page' => filters[:page] || 1,
      'limit' => filters[:limit] || 20
    }
    params['category'] = filters[:category] if filters[:category]
    params['gender'] = filters[:gender] if filters[:gender]
    params['featured'] = filters[:featured].to_s if filters[:featured]
    params['on_sale'] = filters[:on_sale].to_s if filters[:on_sale]
    params['search'] = filters[:search] if filters[:search]

    uri.query = URI.encode_www_form(params)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'

    request = Net::HTTP::Get.new(uri)
    request['x-api-key'] = @api_key
    request['x-domain'] = @domain
    request['x-brand-id'] = @brand_id
    request['Content-Type'] = 'application/json'

    response = http.request(request)

    if response.code == '200'
      JSON.parse(response.body)
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  end

  def get_product(product_id)
    uri = URI("#{@base_url}/api/products/#{product_id}")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'

    request = Net::HTTP::Get.new(uri)
    request['x-api-key'] = @api_key
    request['x-domain'] = @domain
    request['x-brand-id'] = @brand_id
    request['Content-Type'] = 'application/json'

    response = http.request(request)

    if response.code == '200'
      JSON.parse(response.body)
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  end
end

# Usage
api = SpensitAPI.new(
  ENV['API_KEY'],
  ENV['DOMAIN'],
  ENV['BRAND_ID'],
  ENV['API_URL'] || 'https://api.yoursite.com'
)

# Get products
result = api.get_products(page: 1, limit: 20, featured: true)
puts "Found #{result['pagination']['total']} products"
result['data'].each do |product|
  puts "- #{product['name']}: $#{product['price']}"
end

# Get single product
product = api.get_product('product-uuid-here')
puts product['data']['name']
```

---

## C#

```csharp
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;

public class SpensitAPI
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _domain;
    private readonly string _brandId;
    private readonly string _baseUrl;

    public SpensitAPI(string apiKey, string domain, string brandId, string baseUrl)
    {
        _apiKey = apiKey;
        _domain = domain;
        _brandId = brandId;
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
        _httpClient.DefaultRequestHeaders.Add("x-domain", domain);
        _httpClient.DefaultRequestHeaders.Add("x-brand-id", brandId);
        _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
    }

    public async Task<ProductsResponse> GetProductsAsync(ProductFilters filters = null)
    {
        filters ??= new ProductFilters { Page = 1, Limit = 20 };

        var queryParams = HttpUtility.ParseQueryString(string.Empty);
        queryParams.Add("page", filters.Page.ToString());
        queryParams.Add("limit", filters.Limit.ToString());
        
        if (!string.IsNullOrEmpty(filters.Category))
            queryParams.Add("category", filters.Category);
        if (!string.IsNullOrEmpty(filters.Gender))
            queryParams.Add("gender", filters.Gender);
        if (filters.Featured.HasValue)
            queryParams.Add("featured", filters.Featured.Value.ToString().ToLower());
        if (filters.OnSale.HasValue)
            queryParams.Add("on_sale", filters.OnSale.Value.ToString().ToLower());
        if (!string.IsNullOrEmpty(filters.Search))
            queryParams.Add("search", filters.Search);

        var url = $"{_baseUrl}/api/products?{queryParams}";
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ProductsResponse>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public async Task<Product> GetProductAsync(string productId)
    {
        var url = $"{_baseUrl}/api/products/{productId}";
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ProductResponse>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        return result.Data;
    }
}

public class ProductFilters
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
    public string Category { get; set; }
    public string Gender { get; set; }
    public bool? Featured { get; set; }
    public bool? OnSale { get; set; }
    public string Search { get; set; }
}

public class ProductsResponse
{
    public bool Success { get; set; }
    public List<Product> Data { get; set; }
    public PaginationInfo Pagination { get; set; }
}

public class ProductResponse
{
    public bool Success { get; set; }
    public Product Data { get; set; }
}

public class Product
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public List<string> Images { get; set; }
    public Dictionary<string, object> SizesAvailable { get; set; }
    public Dictionary<string, object> StockBySize { get; set; }
    public Dictionary<string, object> StockByColorSize { get; set; }
    public List<string> Colors { get; set; }
    public string Category { get; set; }
    public string Gender { get; set; }
    public string Sku { get; set; }
    // Add all other fields as needed
}

public class PaginationInfo
{
    public int Page { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

// Usage
class Program
{
    static async Task Main(string[] args)
    {
        var api = new SpensitAPI(
            Environment.GetEnvironmentVariable("API_KEY"),
            Environment.GetEnvironmentVariable("DOMAIN"),
            Environment.GetEnvironmentVariable("BRAND_ID"),
            Environment.GetEnvironmentVariable("API_URL") ?? "https://api.yoursite.com"
        );

        // Get products
        var products = await api.GetProductsAsync(new ProductFilters
        {
            Page = 1,
            Limit = 20,
            Featured = true
        });

        Console.WriteLine($"Found {products.Pagination.Total} products");
        foreach (var product in products.Data)
        {
            Console.WriteLine($"- {product.Name}: ${product.Price}");
        }

        // Get single product
        var product = await api.GetProductAsync("product-uuid-here");
        Console.WriteLine(product.Name);
    }
}
```

---

## PHP

```php
<?php

class SpensitAPI
{
    private $apiKey;
    private $domain;
    private $brandId;
    private $baseUrl;
    private $ch;

    public function __construct($apiKey, $domain, $brandId, $baseUrl)
    {
        $this->apiKey = $apiKey;
        $this->domain = $domain;
        $this->brandId = $brandId;
        $this->baseUrl = $baseUrl;
        $this->ch = curl_init();
    }

    public function getProducts($filters = [])
    {
        $params = [
            'page' => $filters['page'] ?? 1,
            'limit' => $filters['limit'] ?? 20
        ];

        if (isset($filters['category'])) {
            $params['category'] = $filters['category'];
        }
        if (isset($filters['gender'])) {
            $params['gender'] = $filters['gender'];
        }
        if (isset($filters['featured'])) {
            $params['featured'] = $filters['featured'] ? 'true' : 'false';
        }
        if (isset($filters['on_sale'])) {
            $params['on_sale'] = $filters['on_sale'] ? 'true' : 'false';
        }
        if (isset($filters['search'])) {
            $params['search'] = $filters['search'];
        }

        $url = $this->baseUrl . '/api/products?' . http_build_query($params);

        curl_setopt_array($this->ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'x-api-key: ' . $this->apiKey,
                'x-domain: ' . $this->domain,
                'x-brand-id: ' . $this->brandId,
                'Content-Type: application/json'
            ]
        ]);

        $response = curl_exec($this->ch);
        $httpCode = curl_getinfo($this->ch, CURLINFO_HTTP_CODE);

        if ($httpCode !== 200) {
            throw new Exception("API Error: HTTP $httpCode - $response");
        }

        return json_decode($response, true);
    }

    public function getProduct($productId)
    {
        $url = $this->baseUrl . '/api/products/' . $productId;

        curl_setopt_array($this->ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'x-api-key: ' . $this->apiKey,
                'x-domain: ' . $this->domain,
                'x-brand-id: ' . $this->brandId,
                'Content-Type: application/json'
            ]
        ]);

        $response = curl_exec($this->ch);
        $httpCode = curl_getinfo($this->ch, CURLINFO_HTTP_CODE);

        if ($httpCode !== 200) {
            throw new Exception("API Error: HTTP $httpCode - $response");
        }

        return json_decode($response, true);
    }

    public function __destruct()
    {
        curl_close($this->ch);
    }
}

// Usage
$api = new SpensitAPI(
    getenv('API_KEY'),
    getenv('DOMAIN'),
    getenv('BRAND_ID'),
    getenv('API_URL') ?: 'https://api.yoursite.com'
);

try {
    // Get products
    $result = $api->getProducts([
        'page' => 1,
        'limit' => 20,
        'featured' => true
    ]);

    echo "Found {$result['pagination']['total']} products\n";
    foreach ($result['data'] as $product) {
        echo "- {$product['name']}: \${$product['price']}\n";
    }

    // Get single product
    $product = $api->getProduct('product-uuid-here');
    echo $product['data']['name'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

---

## Java

```java
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

public class SpensitAPI {
    private String apiKey;
    private String domain;
    private String brandId;
    private String baseUrl;
    private Gson gson;

    public SpensitAPI(String apiKey, String domain, String brandId, String baseUrl) {
        this.apiKey = apiKey;
        this.domain = domain;
        this.brandId = brandId;
        this.baseUrl = baseUrl;
        this.gson = new Gson();
    }

    public JsonObject getProducts(Map<String, String> filters) throws Exception {
        StringBuilder urlBuilder = new StringBuilder(baseUrl + "/api/products?");
        
        Map<String, String> params = new HashMap<>();
        params.put("page", filters.getOrDefault("page", "1"));
        params.put("limit", filters.getOrDefault("limit", "20"));
        
        if (filters.containsKey("category")) {
            params.put("category", filters.get("category"));
        }
        if (filters.containsKey("gender")) {
            params.put("gender", filters.get("gender"));
        }
        if (filters.containsKey("featured")) {
            params.put("featured", filters.get("featured"));
        }
        if (filters.containsKey("on_sale")) {
            params.put("on_sale", filters.get("on_sale"));
        }
        if (filters.containsKey("search")) {
            params.put("search", filters.get("search"));
        }

        String queryString = params.entrySet().stream()
            .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" + 
                      URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));
        
        urlBuilder.append(queryString);

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("x-api-key", apiKey);
        conn.setRequestProperty("x-domain", domain);
        conn.setRequestProperty("x-brand-id", brandId);
        conn.setRequestProperty("Content-Type", "application/json");

        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new Exception("API Error: HTTP " + responseCode);
        }

        BufferedReader in = new BufferedReader(
            new InputStreamReader(conn.getInputStream())
        );
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        return gson.fromJson(response.toString(), JsonObject.class);
    }

    public JsonObject getProduct(String productId) throws Exception {
        URL url = new URL(baseUrl + "/api/products/" + productId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("x-api-key", apiKey);
        conn.setRequestProperty("x-domain", domain);
        conn.setRequestProperty("x-brand-id", brandId);
        conn.setRequestProperty("Content-Type", "application/json");

        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new Exception("API Error: HTTP " + responseCode);
        }

        BufferedReader in = new BufferedReader(
            new InputStreamReader(conn.getInputStream())
        );
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        return gson.fromJson(response.toString(), JsonObject.class);
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        SpensitAPI api = new SpensitAPI(
            System.getenv("API_KEY"),
            System.getenv("DOMAIN"),
            System.getenv("BRAND_ID"),
            System.getenv("API_URL") != null ? System.getenv("API_URL") : "https://api.yoursite.com"
        );

        try {
            Map<String, String> filters = new HashMap<>();
            filters.put("page", "1");
            filters.put("limit", "20");
            filters.put("featured", "true");

            JsonObject result = api.getProducts(filters);
            JsonObject pagination = result.getAsJsonObject("pagination");
            System.out.println("Found " + pagination.get("total").getAsInt() + " products");

            JsonArray products = result.getAsJsonArray("data");
            for (int i = 0; i < products.size(); i++) {
                JsonObject product = products.get(i).getAsJsonObject();
                System.out.println("- " + product.get("name").getAsString() + 
                                 ": $" + product.get("price").getAsDouble());
            }

            // Get single product
            JsonObject product = api.getProduct("product-uuid-here");
            System.out.println(product.getAsJsonObject("data").get("name").getAsString());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

---

## Comprehensive Filtering

The API supports **filtering on ANY field** in the clothes table. See **[FILTERING_GUIDE.md](./FILTERING_GUIDE.md)** for complete filtering documentation.

### Quick Filter Examples

**Tops with Red color and stock above 5:**
```bash
GET /api/products?category=Tops&color=Red&min_stock=5
```

**Featured Men's T-Shirts on sale under $100:**
```bash
GET /api/products?category=T-Shirts&gender=Men&is_featured=true&is_on_sale=true&price_max=100
```

**Products with multiple colors (Red OR Blue) and multiple sizes:**
```bash
GET /api/products?colors=Red,Blue&sizes=M,L,XL&min_stock=10
```

**Complex multi-filter query:**
```bash
GET /api/products?category=Tops&gender=Women&colors=Red,Blue,Black&price_min=50&price_max=150&is_on_sale=true&min_stock=5&sizes=S,M,L&is_featured=true
```

### Available Filters

- **Text**: `category`, `subcategory`, `gender`, `item_type`, `sku`, `brand`, `trending_type`, `vat_inclusive`, `supplier_id`
- **Text Contains**: `name_contains`, `description_contains`
- **Arrays**: `color`, `colors`, `colors_all`, `material`, `materials`, `materials_all`, `tag`, `tags`, `tags_all`
- **Booleans**: `is_featured`, `is_bestseller`, `is_new`, `is_on_sale`, `trending`, `standalone_item`
- **Price Ranges**: `price_min`, `price_max`, `original_price_min`, `original_price_max`, `selling_price_min`, `selling_price_max`, `wholesale_price_min`, `wholesale_price_max`
- **Other Numeric**: `discount_percentage_min/max`, `profit_margin_min/max`, `item_weight_kg_min/max`, `stock_standalone_min/max`, `vat`
- **Stock**: `min_stock`, `max_stock`, `has_stock`
- **Sizes**: `size`, `sizes`, `sizes_all`
- **Dates**: `created_after`, `created_before`, `updated_after`, `updated_before`
- **Search**: `search` (searches name and description)

## Response Structure

All endpoints return data in this format:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "brand_id": "uuid",
      "name": "Product Name",
      "description": "Full description",
      "item_type": "T-Shirt",
      "gender": "Men",
      "category": "T-Shirts",
      "subcategory": "Casual",
      "images": ["url1", "url2", "url3"],
      "image_url": "primary-image-url",
      "original_price": 99.99,
      "price": 79.99,
      "is_on_sale": true,
      "discount_percentage": 20,
      "selling_price": 79.99,
      "wholesale_price": 50.00,
      "profit_margin": 37.5,
      "sizes_available": ["S", "M", "L", "XL"],
      "stock_by_size": {
        "S": 10,
        "M": 15,
        "L": 8,
        "XL": 5
      },
      "stock_by_color_size": {
        "Red": {
          "S": 5,
          "M": 8,
          "L": 4
        },
        "Blue": {
          "S": 5,
          "M": 7,
          "L": 4
        }
      },
      "stock_standalone": null,
      "standalone_item": false,
      "colors": ["Red", "Blue", "Black"],
      "materials": ["Cotton", "Polyester"],
      "sku": "SKU-12345",
      "tags": ["summer", "casual", "comfortable"],
      "is_featured": true,
      "is_bestseller": false,
      "is_new": true,
      "trending": false,
      "trending_type": null,
      "vat": 15,
      "vat_inclusive": "yes",
      "html_description": "<p>Rich HTML description</p>",
      "item_weight_kg": 0.5,
      "sizeguideimageurl": "size-guide-url",
      "custom_variations": [],
      "cost_analysis": {},
      "supplier_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Error Handling

All languages should handle these HTTP status codes:

- `400` - Bad Request (missing headers)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (domain not authorized)
- `404` - Not Found (product not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message",
  "statusCode": 401
}
```
