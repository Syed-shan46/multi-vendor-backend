# Multi-Vendor Platform - API Usage & Testing Guide

This guide provides a step-by-step workflow to test the Multi-Vendor backend, including authentication, vendor onboarding, admin approval, product management, and order processing.

---

## **Workflow Overview**
1.  **Auth**: Register/Login as Vendor or User.
2.  **Vendor Setup**: Create vendor business details.
3.  **Admin Approval**: Admin approves the new vendor.
4.  **Content**: Vendor adds products/menu.
5.  **Marketplace**: User places an order.
6.  **Fulfillment**: Vendor updates order status.

---

## **Step 1: Authentication (OTP Flow)**

The platform now uses a unified **OTP-based Login/Registration**. The endpoint is the same for both tasks.

### **1.1 Send OTP**
Generate a One-Time Password for the mobile number.

**Endpoint:** `POST /auth/send-otp`

**Payload:**
```json
{
    "mobile": "9876543210"
}
```

**Response:**
*   Success (200): "OTP sent successfully..."
*   (Check your backend terminal for the MOCK OTP code)

### **1.2 Verify OTP & Register/Login**
Submit the OTP to authenticate. If the user doesn't exist, they are **automatically registered**.

**Endpoint:** `POST /auth/verify-otp`

**Payload (For Vendor):**
```json
{
    "mobile": "9876543210",
    "otp": "1234",
    "role": "vendor" 
}
```
*(Note: Passing `"role": "vendor"` is CRITICAL for creating a vendor account. Defaults to "user" otherwise.)*

**Payload (For Customer):**
```json
{
    "mobile": "1122334455",
    "otp": "1234",
    "role": "user"
}
```

**Response:**
Returns a JWT `token`. **Save this token** (use as Bearer Token).

**Response:**
Returns a JWT `token`. **Save this token** (use as Bearer Token).

### **1.3 Check Onboarding Status**
After login, check which step of the onboarding the vendor is at.

**Endpoint:** `GET /vendor/status`
*Headers: `Authorization: Bearer <TOKEN>`*

**Response:**
```json
{
    "success": true,
    "message": "Status fetched",
    "data": {
        "step": 1, // 1=Type, 2=Profile, 3=Location, 4=Submit, 5=Home
        "message": "Vendor not created"
    }
}
```

---

## **Step 2: Vendor Onboarding (Authenticated)**
*Headers: `Authorization: Bearer <TOKEN>`*

### **2.1 Initialize Vendor Business**
Link your user account to a vendor business type.

**Endpoint:** `POST /vendor/create`

**Payload:**
```json
{
    "businessType": "grocery" 
    // Options: "grocery", "restaurant", "supermarket"
}
```

### **2.2 Set Vendor Profile**
Add your business name and details.

**Endpoint:** `POST /vendor/profile`

**Payload:**
```json
{
    "businessName": "Fresh Mart",
    "businessLogo": "https://example.com/logo.png",
    "gstNumber": "22AAAAA0000A1Z5",
    "description": "Best fresh groceries in town."
}
```

### **2.3 Set Vendor Location**
Define where your store is located and your delivery info.

**Endpoint:** `POST /vendor/location`

**Payload:**
```json
{
    "address": "123 Main Street, City Center",
    "pincode": "500001",
    "latitude": 17.3850,
    "longitude": 78.4867,
    "openingTime": "09:00",
    "closingTime": "21:00",
    "deliveryRadius": 10,
    "selfPickup": true
}
```

### **2.4 Submit for Approval**
Once setup is complete, submit your profile to the admin.

**Endpoint:** `POST /vendor/submit`

**Payload:** *(Empty Body)*

---

## **Step 3: Admin Approval**
*Headers: `Authorization: Bearer <ADMIN_TOKEN>`*
*(To test this, you may need to manually update a user's role to 'admin' in MongoDB or register one if allowed)*

### **3.1 Get All Vendors**
View list of vendors to find the `_id` of the pending vendor.

**Endpoint:** `GET /admin/vendors`

### **3.2 Approve Vendor**
Activate the vendor account so they can start selling.

**Endpoint:** `PATCH /admin/vendor/<VENDOR_ID>/approve`

---

## **Step 4: Product Management (Vendor)**
*Headers: `Authorization: Bearer <VENDOR_TOKEN>`*
*(Assuming the vendor is now APPROVED)*

### **4.1 Add Product (Grocery Example)**
If you selected `grocery` as your business type:

**Endpoint:** `POST /grocery/product`

**Payload:**
```json
{
    "name": "Organic Apples",
    "category": "Fruits",
    "price": 200,
    "quantity": "1 kg", 
    "stockStatus": "In Stock",
    "image": "https://example.com/apple.jpg"
}
```

*Note: For Restaurants use `/restaurant/...` and Supermarkets use `/supermarket/...`*

---

## **Step 5: Customer Journey**

### **5.1 Login (Customer)**
Follow the same **OTP Flow** as above (Step 1.2), but use `"role": "user"`.
*(Or simply omit `"role"`, as it defaults to "user").*

**Endpoint:** `POST /auth/verify-otp`

**(Get Token)**

### **5.2 Place Order**
**Endpoint:** `POST /order/create`

**Payload:**
```json
{
    "vendorId": "<VENDOR_ID>",
    "items": [
        {
            "productId": "<PRODUCT_ID>", 
            "name": "Organic Apples",
            "quantity": 2,
            "price": 200
        }
    ],
    "totalAmount": 400,
    "orderType": "grocery"
}
```

---

## **Step 6: Order Fulfillment (Vendor)**
*Headers: `Authorization: Bearer <VENDOR_TOKEN>`*

### **6.1 Update Order Status**
Move the order through its lifecycle.

**Endpoint:** `PATCH /order/<ORDER_ID>/status`

**Payload:**
```json
{
    "status": "Accepted"
}
```

**Status Flow:**
`Pending` -> `Accepted` -> `Preparing` -> `Ready` -> `Out for Delivery` -> `Delivered`
