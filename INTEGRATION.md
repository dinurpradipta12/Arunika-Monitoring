# Integration Guide - Menghubungkan Web App ke Arunika Monitoring

Dokumentasi lengkap untuk mengintegrasikan aplikasi Anda dengan sistem monitoring Arunika.

## 📋 Daftar Isi
1. [Cara Kerja Integrasi](#cara-kerja-integrasi)
2. [Setup Aplikasi Baru](#setup-aplikasi-baru)
3. [Integrasi SDK](#integrasi-sdk)
4. [API Endpoints](#api-endpoints)
5. [Event Types](#event-types)
6. [Real-time Monitoring](#real-time-monitoring)
7. [Troubleshooting](#troubleshooting)

---

## 🔄 Cara Kerja Integrasi

### Arsitektur
```
┌─────────────────────┐
│   Your Web App      │
│  (User Registers)   │
└──────────┬──────────┘
           │
           │ POST Webhook
           │ (User Data)
           │
           ▼
┌─────────────────────────────┐
│  Arunika Monitoring API     │
│  - Validate API Key         │
│  - Process User Data        │
│  - Store in Database        │
└──────────┬──────────────────┘
           │
           │ Real-time Event
           │ (WebSocket/Event)
           │
           ▼
┌─────────────────────────────┐
│  Arunika Dashboard          │
│  - Show New Users           │
│  - Track Activity           │
│  - Display Monitoring Stats │
└─────────────────────────────┘
```

### Flow Diagram
```
1. User mendaftar di aplikasi Anda
   ↓
2. Aplikasi Anda kirim data ke Arunika API
   ↓
3. Arunika Monitoring menerima & validasi
   ↓
4. Data disimpan di database
   ↓
5. Real-time event dikirim ke dashboard
   ↓
6. Dashboard menampilkan user baru secara instant
```

---

## 🚀 Setup Aplikasi Baru

### Step 1: Register Aplikasi
Hubungi admin atau gunakan API untuk register aplikasi baru:

```bash
curl -X POST https://arunika-monitoring.pages.dev/api/apps/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your App Name",
    "description": "Your App Description"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appId": "app-abc123",
    "apiKey": "sk_live_your_app_abc123xyz",
    "webhookUrl": "https://arunika-monitoring.pages.dev/api/webhooks"
  }
}
```

**Simpan credentials ini dengan aman!**

### Step 2: Pilih Integration Method
- **Method A**: Gunakan SDK (Recommended untuk React/Node.js)
- **Method B**: Direct HTTP Webhooks (Untuk semua platform)

---

## 🔗 Integrasi SDK

### Installation

#### React/TypeScript
```bash
# Copy file arunikaSdk.ts ke project Anda
cp src/services/arunikaSdk.ts your-app/src/services/
```

#### Node.js
```bash
# Copy atau import SDK
const { ArunikaSDK } = require('./arunikaSdk.ts');
```

### Usage - Contoh React App

#### 1. Initialize SDK
```tsx
// src/services/arunikanClient.ts
import { ArunikaSDK } from './arunikaSdk';

export const arunika = new ArunikaSDK({
  apiKey: process.env.REACT_APP_ARUNIKA_API_KEY || 'sk_live_your_key',
  appId: process.env.REACT_APP_ARUNIKA_APP_ID || 'app-123',
  appName: 'Your App Name',
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks',
  debug: true // Enable for development
});
```

#### 2. Register User pada Signup
```tsx
// src/pages/SignUp.tsx
import { arunika } from './services/arunikanClient';

export const SignUp: React.FC = () => {
  const handleSignup = async (email: string, name: string) => {
    // Buat user di aplikasi Anda
    const user = await createUserInYourApp({ email, name });

    // Kirim ke Arunika Monitoring
    const result = await arunika.registerUser({
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionTier: 'free'
    });

    if (result.success) {
      console.log('User tracked in Arunika');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSignup(emailRef.current?.value || '', nameRef.current?.value || '');
    }}>
      <input ref={emailRef} placeholder="Email" />
      <input ref={nameRef} placeholder="Name" />
      <button type="submit">Sign Up</button>
    </form>
  );
};
```

#### 3. Log User Activity
```tsx
// src/hooks/useActivityLogger.ts
import { arunika } from '../services/arunikanClient';

export const useActivityLogger = (userId: string) => {
  const logActivity = async (activityType: string, description?: string) => {
    await arunika.logActivity(userId, activityType, description);
  };

  return { logActivity };
};

// Usage in component
const MyComponent = ({ userId }: { userId: string }) => {
  const { logActivity } = useActivityLogger(userId);

  const handleLogin = () => {
    logActivity('login', 'User logged in');
  };

  const handlePageView = (page: string) => {
    logActivity('page_view', `Viewed ${page}`);
  };

  return (
    <button onClick={handleLogin}>Login</button>
  );
};
```

#### 4. Update User Data
```tsx
// When user upgrades plan
await arunika.updateUser(userId, {
  subscriptionTier: 'pro'
});
```

#### 5. Verify Connection
```tsx
// In useEffect or on app startup
const isConnected = await arunika.verifyConnection();
console.log('Arunika connection:', isConnected);
```

---

## 📡 API Endpoints

### Base URL
```
https://arunika-monitoring.pages.dev/api
```

### Register App
```http
POST /apps/register
Content-Type: application/json

{
  "name": "Your App Name",
  "description": "Your App Description"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "appId": "app-xxx",
    "apiKey": "sk_live_xxx",
    "webhookUrl": "https://..."
  }
}
```

### Webhooks
```http
POST /webhooks
Content-Type: application/json
X-API-Key: sk_live_your_api_key
X-Webhook-Signature: <hmac-sha256-signature>
X-App-ID: app-xxx

{
  "eventType": "user_created|user_updated|user_deleted|user_activity",
  "appId": "app-xxx",
  "appName": "Your App Name",
  "data": { ... },
  "timestamp": "2026-02-03T00:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "message": "Event processed",
  "data": { ... }
}
```

---

## 🎯 Event Types

### 1. User Created (user_created)
Dikirim saat user baru mendaftar

```json
{
  "eventType": "user_created",
  "appId": "app-123",
  "appName": "Your App",
  "data": {
    "userId": "user-456",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "free"
  },
  "timestamp": "2026-02-03T10:30:00Z"
}
```

### 2. User Updated (user_updated)
Dikirim saat profile user diubah

```json
{
  "eventType": "user_updated",
  "appId": "app-123",
  "appName": "Your App",
  "data": {
    "userId": "user-456",
    "name": "Jane Doe",
    "subscriptionTier": "pro"
  },
  "timestamp": "2026-02-03T10:35:00Z"
}
```

### 3. User Deleted (user_deleted)
Dikirim saat user dihapus

```json
{
  "eventType": "user_deleted",
  "appId": "app-123",
  "appName": "Your App",
  "data": {
    "userId": "user-456"
  },
  "timestamp": "2026-02-03T10:40:00Z"
}
```

### 4. User Activity (user_activity)
Dikirim saat user melakukan aktivitas

```json
{
  "eventType": "user_activity",
  "appId": "app-123",
  "appName": "Your App",
  "data": {
    "userId": "user-456",
    "activityType": "login|page_view|purchase|export|etc",
    "description": "User logged in from Chrome browser",
    "metadata": {
      "browser": "Chrome",
      "device": "Desktop",
      "location": "Jakarta, ID"
    }
  },
  "timestamp": "2026-02-03T10:45:00Z"
}
```

---

## ⚡ Real-time Monitoring

### WebSocket Connection (Coming Soon)
```typescript
const ws = new WebSocket('wss://arunika-monitoring.pages.dev/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Real-time event:', message);
  // Handle: user_created, user_activity, etc.
};
```

### Current: Polling Alternative
Jika WebSocket belum tersedia, polling user list:

```typescript
const pollUserUpdates = async () => {
  setInterval(async () => {
    const response = await fetch('/api/users?appId=app-123', {
      headers: { 'X-API-Key': apiKey }
    });
    const users = await response.json();
    // Update dashboard
  }, 5000); // Poll setiap 5 detik
};
```

---

## 📊 Monitoring Features

### Dashboard akan menampilkan:
- ✅ Jumlah user total per app
- ✅ User yang pending approval
- ✅ User baru (real-time)
- ✅ Activity log
- ✅ Status koneksi app

### Metrics:
- Total users registered
- Active users
- Pending approvals
- Activity timeline
- Subscription tier distribution

---

## 🔐 Security

### API Key Management
```
DO:
✅ Store API key di .env file
✅ Rotate API key secara berkala
✅ Gunakan HTTPS hanya
✅ Validate webhook signature

DON'T:
❌ Commit API key ke git
❌ Expose API key di frontend
❌ Share API key dengan pihak ketiga
```

### Webhook Signature Verification
```typescript
import crypto from 'crypto';

const verifySignature = (payload: any, signature: string, apiKey: string) => {
  const message = JSON.stringify(payload);
  const expected = crypto
    .createHmac('sha256', apiKey)
    .update(message)
    .digest('hex');
  
  return signature === expected;
};
```

---

## 🧪 Testing Integration

### 1. Test dengan cURL
```bash
curl -X POST https://arunika-monitoring.pages.dev/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_your_api_key" \
  -d '{
    "eventType": "user_created",
    "appId": "app-123",
    "appName": "Test App",
    "data": {
      "userId": "test-user-123",
      "email": "test@example.com",
      "name": "Test User",
      "subscriptionTier": "free"
    },
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
  }'
```

### 2. Test dengan Postman
1. Import collection dari `integration-postman.json`
2. Set environment variables:
   - `api_key`: sk_live_your_api_key
   - `app_id`: app-123
   - `webhook_url`: https://arunika-monitoring.pages.dev/api/webhooks
3. Run requests

### 3. Test di Application
```typescript
const arunika = new ArunikaSDK({
  apiKey: 'sk_live_your_api_key',
  appId: 'app-123',
  appName: 'Test App',
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks',
  debug: true
});

// Test connection
const isConnected = await arunika.verifyConnection();
console.log('Connected:', isConnected);

// Test register user
const result = await arunika.registerUser({
  userId: 'test-123',
  email: 'test@example.com',
  name: 'Test User'
});
console.log('Register result:', result);
```

---

## ❓ Troubleshooting

### Problem: "Invalid API Key"
**Solution:**
- Verifikasi API key benar
- Pastikan API key dimulai dengan `sk_live_` atau `sk_test_`
- Check di dashboard apakah app sudah terdaftar

### Problem: Webhook tidak diterima
**Solution:**
1. Periksa X-API-Key header
2. Verify webhook signature
3. Check timestamp (tidak boleh > 5 menit)
4. Lihat logs di Arunika dashboard

### Problem: User tidak muncul di dashboard
**Solution:**
- Tunggu 1-2 detik untuk real-time update
- Refresh page
- Check browser console untuk error messages
- Verify user data di developer tools

### Problem: Rate Limit Exceeded
**Solution:**
- Batch events sebelum send
- Gunakan SDK (sudah built-in batch processing)
- Tunggu sebelum retry

### Problem: "Connection Timeout"
**Solution:**
- Check internet connection
- Verifikasi webhook URL accessible
- Gunakan proxy jika perlu
- Contact support

---

## 📚 Example Implementations

### Example 1: Express.js Backend
```javascript
// routes/auth.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const ARUNIKA_API_KEY = process.env.ARUNIKA_API_KEY;
const ARUNIKA_WEBHOOK = 'https://arunika-monitoring.pages.dev/api/webhooks';

router.post('/register', async (req, res) => {
  const { email, name } = req.body;

  // Create user di database Anda
  const user = await db.createUser({ email, name });

  // Notify Arunika
  try {
    await axios.post(ARUNIKA_WEBHOOK, {
      eventType: 'user_created',
      appId: process.env.ARUNIKA_APP_ID,
      appName: 'Your App',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-API-Key': ARUNIKA_API_KEY }
    });
  } catch (error) {
    console.error('Arunika notification failed:', error);
    // Continue anyway, don't block user signup
  }

  res.json({ success: true, userId: user.id });
});
```

### Example 2: Next.js API Route
```typescript
// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  // Create user
  const user = await createUser({ email, name });

  // Notify Arunika
  const webhookResponse = await fetch(
    'https://arunika-monitoring.pages.dev/api/webhooks',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ARUNIKA_API_KEY!
      },
      body: JSON.stringify({
        eventType: 'user_created',
        appId: process.env.ARUNIKA_APP_ID,
        appName: 'Your App',
        data: { userId: user.id, email, name },
        timestamp: new Date().toISOString()
      })
    }
  );

  res.json({ success: true, userId: user.id });
}
```

---

## 📞 Support & Resources

- **Documentation**: https://docs.arunika-monitoring.dev
- **Status Page**: https://status.arunika-monitoring.dev
- **Contact**: support@arunika-monitoring.dev

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-03 | Initial release |

---

**Last Updated:** February 3, 2026
