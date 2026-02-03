/**
 * Integration Service
 * Handles API integration with external applications
 * Receives user data, tracks activity, and manages webhooks
 */

export interface IntegrationWebhook {
  eventType: 'user_created' | 'user_updated' | 'user_deleted' | 'user_activity';
  appId: string;
  appName: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface IntegrationRequest {
  apiKey: string;
  appId: string;
  appName: string;
  action: 'register_user' | 'update_user' | 'log_activity' | 'verify_app';
  payload: Record<string, any>;
}

export interface IntegrationResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

/**
 * Verify API Key from external app
 * In production, verify against your database
 */
export const verifyApiKey = (apiKey: string): boolean => {
  // TODO: Replace with actual API key verification from database
  // For now, basic validation
  return apiKey.startsWith('sk_live_') || apiKey.startsWith('sk_test_');
};

/**
 * Generate unique API Key for new app
 */
export const generateApiKey = (appName: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
  return `sk_${env}_${appName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}${randomStr}`;
};

/**
 * Process incoming webhook from external app
 */
export const processWebhook = async (
  webhook: IntegrationWebhook
): Promise<IntegrationResponse> => {
  try {
    // Verify app is registered
    if (!webhook.appId || !webhook.appName) {
      return {
        success: false,
        message: 'Invalid app identification'
      };
    }

    // Validate timestamp is not too old (prevent replay attacks)
    const webhookTime = new Date(webhook.timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = currentTime - webhookTime;
    
    if (timeDiff > 300000) { // 5 minutes
      return {
        success: false,
        message: 'Webhook timestamp too old'
      };
    }

    // Route based on event type
    switch (webhook.eventType) {
      case 'user_created':
        return handleUserCreated(webhook);
      case 'user_updated':
        return handleUserUpdated(webhook);
      case 'user_deleted':
        return handleUserDeleted(webhook);
      case 'user_activity':
        return handleUserActivity(webhook);
      default:
        return {
          success: false,
          message: 'Unknown event type'
        };
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      success: false,
      message: 'Internal server error'
    };
  }
};

/**
 * Handle new user registration from external app
 */
const handleUserCreated = async (
  webhook: IntegrationWebhook
): Promise<IntegrationResponse> => {
  try {
    const { userId, email, name, subscriptionTier } = webhook.data;

    if (!userId || !email || !name) {
      return {
        success: false,
        message: 'Missing required fields: userId, email, name'
      };
    }

    // TODO: Save user to database
    console.log('New user from', webhook.appName, ':', { userId, email, name });

    // Emit real-time event via WebSocket
    broadcastUserEvent('user_created', {
      id: userId,
      email,
      name,
      sourceAppId: webhook.appId,
      sourceAppName: webhook.appName,
      subscriptionTier: subscriptionTier || 'free',
      status: 'pending',
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });

    return {
      success: true,
      message: 'User registered successfully',
      data: { userId }
    };
  } catch (error) {
    console.error('Error handling user creation:', error);
    return {
      success: false,
      message: 'Failed to process user registration'
    };
  }
};

/**
 * Handle user profile updates from external app
 */
const handleUserUpdated = async (
  webhook: IntegrationWebhook
): Promise<IntegrationResponse> => {
  try {
    const { userId, ...updates } = webhook.data;

    if (!userId) {
      return {
        success: false,
        message: 'Missing required field: userId'
      };
    }

    // TODO: Update user in database
    console.log('User update from', webhook.appName, ':', { userId, updates });

    broadcastUserEvent('user_updated', {
      id: userId,
      ...updates,
      sourceAppId: webhook.appId
    });

    return {
      success: true,
      message: 'User updated successfully',
      data: { userId }
    };
  } catch (error) {
    console.error('Error handling user update:', error);
    return {
      success: false,
      message: 'Failed to process user update'
    };
  }
};

/**
 * Handle user deletion/deactivation
 */
const handleUserDeleted = async (
  webhook: IntegrationWebhook
): Promise<IntegrationResponse> => {
  try {
    const { userId } = webhook.data;

    if (!userId) {
      return {
        success: false,
        message: 'Missing required field: userId'
      };
    }

    // TODO: Mark user as deleted in database
    console.log('User deleted from', webhook.appName, ':', userId);

    broadcastUserEvent('user_deleted', {
      id: userId,
      sourceAppId: webhook.appId
    });

    return {
      success: true,
      message: 'User deleted successfully',
      data: { userId }
    };
  } catch (error) {
    console.error('Error handling user deletion:', error);
    return {
      success: false,
      message: 'Failed to process user deletion'
    };
  }
};

/**
 * Handle user activity logging (login, actions, etc.)
 */
const handleUserActivity = async (
  webhook: IntegrationWebhook
): Promise<IntegrationResponse> => {
  try {
    const { userId, activityType, description } = webhook.data;

    if (!userId || !activityType) {
      return {
        success: false,
        message: 'Missing required fields: userId, activityType'
      };
    }

    // TODO: Log activity to database
    console.log('User activity from', webhook.appName, ':', {
      userId,
      activityType,
      description
    });

    broadcastUserEvent('user_activity', {
      userId,
      activityType,
      description,
      sourceAppId: webhook.appId,
      timestamp: webhook.timestamp
    });

    return {
      success: true,
      message: 'Activity logged successfully',
      data: { userId, activityType }
    };
  } catch (error) {
    console.error('Error handling activity:', error);
    return {
      success: false,
      message: 'Failed to log activity'
    };
  }
};

/**
 * Broadcast real-time events to connected WebSocket clients
 * TODO: Implement WebSocket server
 */
const broadcastUserEvent = (eventType: string, data: any) => {
  // This would connect to your WebSocket server
  // Emit events to all connected clients
  const event = {
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  };

  console.log('Broadcasting event:', event);

  // TODO: Emit to WebSocket clients
  // wss.broadcast(JSON.stringify(event));
};

/**
 * Send test webhook to verify integration
 */
export const sendTestWebhook = async (
  appId: string,
  webhookUrl: string,
  apiKey: string
): Promise<boolean> => {
  try {
    const testPayload: IntegrationWebhook = {
      eventType: 'user_activity',
      appId,
      appName: 'Test App',
      data: {
        userId: 'test_user_123',
        activityType: 'ping',
        description: 'Test webhook'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-Webhook-Signature': generateWebhookSignature(testPayload, apiKey)
      },
      body: JSON.stringify(testPayload)
    });

    return response.ok;
  } catch (error) {
    console.error('Test webhook failed:', error);
    return false;
  }
};

/**
 * Generate HMAC signature for webhook verification
 */
export const generateWebhookSignature = (payload: any, secret: string): string => {
  const crypto = require('crypto');
  const message = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  payload: any,
  signature: string,
  secret: string
): boolean => {
  const expected = generateWebhookSignature(payload, secret);
  return signature === expected;
};
