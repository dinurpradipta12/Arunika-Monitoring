# 🚀 Arunika Integration Quick Start

Panduan cepat 5 menit untuk mengintegrasikan aplikasi Anda dengan Arunika Monitoring.

## ⚡ Quick Setup

### Step 1: Get Your Credentials
```
API Key: sk_live_your_api_key_here
App ID: app-your-app-id
Webhook URL: https://arunika-monitoring.pages.dev/api/webhooks
```

### Step 2: Copy SDK File
Salin `src/services/arunikaSdk.ts` ke project Anda.

### Step 3: Initialize (Choose Your Platform)

#### React/TypeScript
```typescript
import ArunikaSDK from './arunikaSdk';

const arunika = new ArunikaSDK({
  apiKey: process.env.REACT_APP_API_KEY || 'sk_live_...',
  appId: process.env.REACT_APP_APP_ID || 'app-...',
  appName: 'Your App Name',
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks',
  debug: true
});

export default arunika;
```

#### Node.js/Express
```javascript
const ArunikaSDK = require('./arunikaSdk.ts');

const arunika = new ArunikaSDK({
  apiKey: process.env.ARUNIKA_API_KEY,
  appId: process.env.ARUNIKA_APP_ID,
  appName: 'Your App',
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks'
});

module.exports = arunika;
```

#### Vanilla JavaScript/Browser
```html
<script src="path/to/arunikaSdk.ts"></script>
<script>
  const arunika = new ArunikaSDK({
    apiKey: 'sk_live_your_key',
    appId: 'app-your-id',
    appName: 'My Website',
    webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks'
  });
</script>
```

### Step 4: Track User Registration

#### When User Signs Up
```typescript
// After creating user in your database
const user = await createUser({ email, name });

// Register in Arunika
await arunika.registerUser({
  userId: user.id,
  email: user.email,
  name: user.name,
  subscriptionTier: 'free' // or 'pro', 'enterprise'
});
```

### Step 5: Log Activities
```typescript
// Login
arunika.logActivity(userId, 'login', 'User logged in');

// Page view
arunika.logActivity(userId, 'page_view', `Viewed /dashboard`);

// Purchase
arunika.logActivity(userId, 'purchase', 'User upgraded to Pro plan');

// Custom event
arunika.logActivity(userId, 'export', 'User exported data', {
  format: 'CSV',
  records: 1000
});
```

### Step 6: Verify Connection
```typescript
const isConnected = await arunika.verifyConnection();
console.log('Connected to Arunika:', isConnected);
```

---

## 📊 What You Get

✅ Real-time user tracking  
✅ User registration monitoring  
✅ Activity logging  
✅ Dashboard analytics  
✅ User status management  

---

## 🔗 Direct API (Without SDK)

Jika SDK tidak sesuai dengan platform Anda, gunakan direct HTTP request:

```bash
curl -X POST https://arunika-monitoring.pages.dev/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_your_api_key" \
  -d '{
    "eventType": "user_created",
    "appId": "app-123",
    "appName": "Your App",
    "data": {
      "userId": "user-456",
      "email": "user@example.com",
      "name": "User Name",
      "subscriptionTier": "free"
    },
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
  }'
```

---

## 📚 Event Types

| Event | Usage | Example |
|-------|-------|---------|
| `user_created` | User sign up | New user registered |
| `user_updated` | Profile change | Plan upgrade |
| `user_deleted` | Account delete | User removed |
| `user_activity` | Any action | Login, page view, purchase |

---

## 🎯 Common Use Cases

### 1️⃣ Track New Users
```typescript
// Register user
arunika.registerUser({
  userId: user.id,
  email,
  name,
  subscriptionTier: subscription
});
```

### 2️⃣ Monitor Login Activity
```typescript
// On successful login
arunika.logActivity(userId, 'login', 'User logged in');
```

### 3️⃣ Track Feature Usage
```typescript
// When user uses a feature
arunika.logActivity(userId, 'feature_used', 'Exported report', {
  feature: 'export',
  format: 'PDF'
});
```

### 4️⃣ Monitor Plan Upgrades
```typescript
// When user upgrades
arunika.updateUser(userId, {
  subscriptionTier: 'pro'
});

arunika.logActivity(userId, 'upgrade', 'Upgraded to Pro plan');
```

### 5️⃣ Track User Churn
```typescript
// When user cancels
arunika.logActivity(userId, 'cancelled', 'User cancelled subscription');
arunika.updateUser(userId, { status: 'inactive' });
```

---

## 🐛 Troubleshooting

### "API Key not found"
✅ Check that API key is in environment variables  
✅ Verify key format (should start with `sk_live_`)  

### "Webhook failed"
✅ Check internet connection  
✅ Verify webhook URL is correct  
✅ Check Arunika server status  

### "User not showing in dashboard"
✅ Wait 1-2 seconds for real-time update  
✅ Refresh the page  
✅ Check browser console for errors  

### "Connection timeout"
✅ Check if Arunika URL is accessible  
✅ Check firewall/network settings  
✅ Try test webhook first  

---

## 📖 Learn More

- **Full Documentation**: [INTEGRATION.md](./INTEGRATION.md)
- **Code Examples**: [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)
- **API Reference**: [API Endpoints](./INTEGRATION.md#api-endpoints)

---

## 💡 Pro Tips

1. **Batch Events**: SDK otomatis batch activities untuk efisiensi
2. **Queue Management**: Events di-queue jika connection offline
3. **Debug Mode**: Enable `debug: true` untuk verbose logging
4. **Error Handling**: SDK tidak block aplikasi jika connection fails

---

## 🆘 Need Help?

- Check [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) for your platform
- Review [INTEGRATION.md](./INTEGRATION.md) for detailed docs
- Test with cURL first to verify credentials
- Contact support@arunika-monitoring.dev

---

**Get started in 5 minutes!** 🎉

1. Get credentials from dashboard
2. Copy SDK file
3. Initialize with your keys
4. Call `registerUser()` on signup
5. Call `logActivity()` to track events

That's it! Users are now being tracked in real-time.
