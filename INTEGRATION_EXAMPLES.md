# Arunika Integration Examples

Contoh implementasi integrasi Arunika Monitoring di berbagai platform.

## 📚 Daftar Contoh
1. [React App](#react-app)
2. [Next.js App](#nextjs-app)
3. [Vue.js App](#vuejs-app)
4. [Express Backend](#express-backend)
5. [Python Flask](#python-flask)
6. [PHP Application](#php-application)

---

## React App

### 1. Setup SDK

**src/services/arunika.ts**
```typescript
import ArunikaSDK from './arunikaSdk';

export const arunika = new ArunikaSDK({
  apiKey: process.env.REACT_APP_ARUNIKA_API_KEY || 'sk_live_default',
  appId: process.env.REACT_APP_ARUNIKA_APP_ID || 'app-default',
  appName: 'React App',
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks',
  debug: process.env.NODE_ENV === 'development'
});
```

**Create .env.local**
```
REACT_APP_ARUNIKA_API_KEY=sk_live_your_api_key
REACT_APP_ARUNIKA_APP_ID=app-your-app-id
```

### 2. Register User on Signup

**src/components/SignUp.tsx**
```tsx
import React, { useRef } from 'react';
import { arunika } from '../services/arunika';

export const SignUp: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Register user in your app
      const email = emailRef.current?.value || '';
      const name = nameRef.current?.value || '';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const userData = await response.json();

      // 2. Register user in Arunika Monitoring
      const arunikaResult = await arunika.registerUser({
        userId: userData.id,
        email,
        name,
        subscriptionTier: 'free'
      });

      if (arunikaResult.success) {
        setMessage('Account created successfully! Tracking enabled.');
        // Redirect or handle success
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          ref={emailRef}
          type="email"
          required
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          ref={nameRef}
          type="text"
          required
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="John Doe"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>

      {message && (
        <p className="text-sm text-center text-gray-600">{message}</p>
      )}
    </form>
  );
};
```

### 3. Track User Activity

**src/hooks/useActivityLogger.ts**
```typescript
import { useEffect } from 'react';
import { arunika } from '../services/arunika';

export const useActivityLogger = (userId: string | null) => {
  useEffect(() => {
    if (!userId) return;

    // Log page view
    arunika.logActivity(userId, 'page_view', `Visited ${window.location.pathname}`);

    // Log when user interacts
    const handleClick = () => {
      arunika.logActivity(userId, 'interaction', 'User clicked on page');
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userId]);

  return {
    logAction: (action: string, description?: string) =>
      userId && arunika.logActivity(userId, action, description)
  };
};

// Usage in component
export const Dashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { logAction } = useActivityLogger(userId);

  const handleExport = async () => {
    logAction('export', 'User exported data');
    // ... export logic
  };

  return <button onClick={handleExport}>Export Data</button>;
};
```

---

## Next.js App

### 1. API Route untuk Webhook

**pages/api/auth/register.ts**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  userId?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  try {
    // 1. Create user di database
    const user = await db.users.create({
      email,
      name,
      createdAt: new Date()
    });

    // 2. Notify Arunika Monitoring
    const arunikaResponse = await fetch(
      'https://arunika-monitoring.pages.dev/api/webhooks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ARUNIKA_API_KEY!,
          'X-App-ID': process.env.ARUNIKA_APP_ID!
        },
        body: JSON.stringify({
          eventType: 'user_created',
          appId: process.env.ARUNIKA_APP_ID,
          appName: 'Your Next.js App',
          data: {
            userId: user.id,
            email: user.email,
            name: user.name,
            subscriptionTier: 'free'
          },
          timestamp: new Date().toISOString()
        })
      }
    );

    if (!arunikaResponse.ok) {
      console.warn('Arunika notification failed:', await arunikaResponse.text());
      // Don't fail signup if monitoring fails
    }

    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
}
```

### 2. Log Activity Middleware

**pages/api/middleware/activityLogger.ts**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export const logActivity = async (
  userId: string,
  activityType: string,
  description?: string
) => {
  try {
    await fetch('https://arunika-monitoring.pages.dev/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ARUNIKA_API_KEY!
      },
      body: JSON.stringify({
        eventType: 'user_activity',
        appId: process.env.ARUNIKA_APP_ID,
        appName: 'Your Next.js App',
        data: { userId, activityType, description },
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};

// Usage in API routes
export async function withActivityLogging(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  activityType: string
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.headers['x-user-id'] as string;
    if (userId) {
      await logActivity(userId, activityType, `${req.method} ${req.url}`);
    }
    return handler(req, res);
  };
}
```

---

## Vue.js App

### 1. Create Vue Plugin

**src/plugins/arunika.ts**
```typescript
import { createApp } from 'vue';
import ArunikaSDK from '../services/arunikaSdk';

const arunika = new ArunikaSDK({
  apiKey: import.meta.env.VITE_ARUNIKA_API_KEY,
  appId: import.meta.env.VITE_ARUNIKA_APP_ID,
  appName: 'Vue App',
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks'
});

export default {
  install(app: ReturnType<typeof createApp>) {
    app.config.globalProperties.$arunika = arunika;
  }
};
```

### 2. Use in Components

**src/components/SignUp.vue**
```vue
<template>
  <form @submit.prevent="handleSignup" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input
        v-model="email"
        type="email"
        required
        class="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Name</label>
      <input
        v-model="name"
        type="text"
        required
        class="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-blue-600 text-white py-2 rounded-lg"
    >
      {{ loading ? 'Creating...' : 'Sign Up' }}
    </button>

    <p v-if="message" class="text-sm text-center">{{ message }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useArunika } from '../composables/useArunika';

const email = ref('');
const name = ref('');
const loading = ref(false);
const message = ref('');
const arunika = useArunika();

const handleSignup = async () => {
  loading.value = true;

  try {
    // Create user
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, name: name.value })
    });

    const userData = await response.json();

    // Register in Arunika
    const result = await arunika.registerUser({
      userId: userData.id,
      email: email.value,
      name: name.value
    });

    message.value = result.success ? 'Success!' : 'Signup failed';
  } catch (error) {
    message.value = `Error: ${error}`;
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## Express Backend

**routes/auth.js**
```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

const ARUNIKA_CONFIG = {
  apiKey: process.env.ARUNIKA_API_KEY,
  appId: process.env.ARUNIKA_APP_ID,
  webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks'
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Create user
    const user = await db.users.create({ email, name });

    // Notify Arunika
    await notifyArunika('user_created', {
      userId: user.id,
      email,
      name,
      subscriptionTier: 'free'
    });

    res.json({ success: true, id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { userId } = req.body;

    // Your login logic
    const user = await db.users.findById(userId);

    // Log activity
    await notifyArunika('user_activity', {
      userId: user.id,
      activityType: 'login',
      description: 'User logged in'
    });

    res.json({ success: true, token: generateToken(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
async function notifyArunika(eventType, data) {
  try {
    await axios.post(ARUNIKA_CONFIG.webhookUrl, {
      eventType,
      appId: ARUNIKA_CONFIG.appId,
      appName: 'Express App',
      data,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-API-Key': ARUNIKA_CONFIG.apiKey }
    });
  } catch (error) {
    console.warn('Arunika notification failed:', error.message);
  }
}

module.exports = router;
```

---

## Python Flask

**app.py**
```python
from flask import Flask, request, jsonify
from datetime import datetime
import requests
import os

app = Flask(__name__)

ARUNIKA_API_KEY = os.getenv('ARUNIKA_API_KEY')
ARUNIKA_APP_ID = os.getenv('ARUNIKA_APP_ID')
ARUNIKA_WEBHOOK = 'https://arunika-monitoring.pages.dev/api/webhooks'

def notify_arunika(event_type, data):
    """Send event to Arunika Monitoring"""
    try:
        payload = {
            'eventType': event_type,
            'appId': ARUNIKA_APP_ID,
            'appName': 'Flask App',
            'data': data,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        response = requests.post(
            ARUNIKA_WEBHOOK,
            json=payload,
            headers={'X-API-Key': ARUNIKA_API_KEY}
        )
        
        return response.status_code == 200
    except Exception as e:
        print(f'Arunika notification failed: {e}')
        return False

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.json
    email = data.get('email')
    name = data.get('name')
    
    try:
        # Create user in database
        user = db.create_user(email=email, name=name)
        
        # Notify Arunika
        notify_arunika('user_created', {
            'userId': user.id,
            'email': email,
            'name': name,
            'subscriptionTier': 'free'
        })
        
        return jsonify({'success': True, 'id': user.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    user_id = data.get('userId')
    
    try:
        user = db.get_user(user_id)
        
        # Log activity
        notify_arunika('user_activity', {
            'userId': user.id,
            'activityType': 'login',
            'description': 'User logged in'
        })
        
        return jsonify({'success': True, 'token': generate_token(user)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
```

**requirements.txt**
```
Flask==2.3.0
requests==2.31.0
python-dotenv==1.0.0
```

---

## PHP Application

**auth/register.php**
```php
<?php
require_once __DIR__ . '/../config/database.php';

// Configuration
$arunina_api_key = getenv('ARUNIKA_API_KEY');
$arunika_app_id = getenv('ARUNIKA_APP_ID');
$arunika_webhook = 'https://arunika-monitoring.pages.dev/api/webhooks';

function notify_arunika($event_type, $data) {
    global $arunina_api_key, $arunika_app_id, $arunika_webhook;
    
    $payload = [
        'eventType' => $event_type,
        'appId' => $arunika_app_id,
        'appName' => 'PHP App',
        'data' => $data,
        'timestamp' => date('c')
    ];
    
    $ch = curl_init($arunika_webhook);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . $arunina_api_key
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return $response !== false;
}

// Handle registration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $name = $_POST['name'] ?? '';
    
    if (empty($email) || empty($name)) {
        die('Missing required fields');
    }
    
    // Create user in database
    $user = $db->prepare('INSERT INTO users (email, name) VALUES (?, ?)');
    $user->execute([$email, $name]);
    $user_id = $db->lastInsertId();
    
    // Notify Arunika
    notify_arunika('user_created', [
        'userId' => $user_id,
        'email' => $email,
        'name' => $name,
        'subscriptionTier' => 'free'
    ]);
    
    echo json_encode(['success' => true, 'id' => $user_id]);
}
?>
```

**.env**
```
ARUNIKA_API_KEY=sk_live_your_api_key
ARUNIKA_APP_ID=app-your-app-id
```

---

## 📝 Environment Variables Reference

Semua contoh di atas memerlukan environment variables berikut:

```bash
# API Key dari Arunika (format: sk_live_xxx)
ARUNIKA_API_KEY=sk_live_your_api_key_here

# App ID dari Arunika (format: app-xxx)
ARUNIKA_APP_ID=app-your-app-id_here

# Optional: Webhook URL (default sudah di-set)
ARUNIKA_WEBHOOK_URL=https://arunika-monitoring.pages.dev/api/webhooks
```

---

## 🧪 Testing Your Integration

### cURL Test
```bash
curl -X POST https://arunika-monitoring.pages.dev/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_your_api_key" \
  -d '{
    "eventType": "user_created",
    "appId": "app-123",
    "appName": "Test App",
    "data": {
      "userId": "user-123",
      "email": "test@example.com",
      "name": "Test User"
    },
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
  }'
```

### Postman Request
```
Method: POST
URL: https://arunika-monitoring.pages.dev/api/webhooks

Headers:
- Content-Type: application/json
- X-API-Key: sk_live_your_api_key

Body (raw JSON):
{
  "eventType": "user_created",
  "appId": "app-123",
  "appName": "My App",
  "data": {
    "userId": "user-123",
    "email": "user@example.com",
    "name": "User Name"
  },
  "timestamp": "2026-02-03T10:30:00Z"
}
```

---

**Last Updated:** February 3, 2026
