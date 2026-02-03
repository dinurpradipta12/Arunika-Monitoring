/**
 * Arunika Monitoring SDK
 * 
 * Mudah diintegrasikan ke aplikasi Anda untuk tracking user real-time
 * 
 * Installation:
 * Copy file ini atau install via npm (jika dipublikasikan)
 * 
 * Usage:
 * const arunika = new ArunikaSDK({
 *   apiKey: 'sk_live_your_api_key',
 *   appId: 'app-123',
 *   appName: 'Your App Name',
 *   webhookUrl: 'https://arunika-monitoring.pages.dev/api/webhooks'
 * });
 * 
 * // Register user
 * arunika.registerUser({
 *   userId: 'user-123',
 *   email: 'user@example.com',
 *   name: 'User Name',
 *   subscriptionTier: 'pro'
 * });
 * 
 * // Log activity
 * arunika.logActivity('user-123', 'login', 'User logged in');
 */

export interface ArunikaConfig {
  apiKey: string;
  appId: string;
  appName: string;
  webhookUrl: string;
  debug?: boolean;
}

export interface UserData {
  userId: string;
  email: string;
  name: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  metadata?: Record<string, any>;
}

export class ArunikaSDK {
  private config: ArunikaConfig;
  private eventQueue: any[] = [];
  private isProcessing = false;
  private batchSize = 10;
  private batchInterval = 5000; // 5 seconds

  constructor(config: ArunikaConfig) {
    this.config = config;
    this.validateConfig();
    this.startBatchProcessor();
  }

  private validateConfig(): void {
    if (!this.config.apiKey) throw new Error('apiKey is required');
    if (!this.config.appId) throw new Error('appId is required');
    if (!this.config.appName) throw new Error('appName is required');
    if (!this.config.webhookUrl) throw new Error('webhookUrl is required');

    this.log('SDK initialized with config:', {
      appId: this.config.appId,
      appName: this.config.appName,
      webhookUrl: this.config.webhookUrl
    });
  }

  /**
   * Register a new user in Arunika Monitoring
   */
  public async registerUser(user: UserData): Promise<{ success: boolean; message: string }> {
    try {
      this.log('Registering user:', user);

      const payload = {
        eventType: 'user_created',
        appId: this.config.appId,
        appName: this.config.appName,
        data: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier || 'free',
          ...user.metadata
        },
        timestamp: new Date().toISOString()
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      console.error('Failed to register user:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Update existing user data
   */
  public async updateUser(
    userId: string,
    updates: Partial<UserData>
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.log('Updating user:', userId, updates);

      const payload = {
        eventType: 'user_updated',
        appId: this.config.appId,
        appName: this.config.appName,
        data: {
          userId,
          ...updates
        },
        timestamp: new Date().toISOString()
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Delete/deactivate user
   */
  public async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      this.log('Deleting user:', userId);

      const payload = {
        eventType: 'user_deleted',
        appId: this.config.appId,
        appName: this.config.appName,
        data: { userId },
        timestamp: new Date().toISOString()
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Log user activity (login, page view, action, etc.)
   */
  public async logActivity(
    userId: string,
    activityType: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.log('Logging activity:', { userId, activityType });

      const payload = {
        eventType: 'user_activity',
        appId: this.config.appId,
        appName: this.config.appName,
        data: {
          userId,
          activityType,
          description,
          ...metadata
        },
        timestamp: new Date().toISOString()
      };

      // Queue activity instead of sending immediately for efficiency
      this.eventQueue.push(payload);

      if (this.eventQueue.length >= this.batchSize) {
        await this.flushQueue();
      }

      return { success: true, message: 'Activity queued' };
    } catch (error) {
      console.error('Failed to log activity:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Send webhook to Arunika Monitoring
   */
  private async sendWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      const signature = this.generateSignature(payload);

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Webhook-Signature': signature,
          'X-App-ID': this.config.appId
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        this.log('Webhook failed:', result);
        return { success: false, message: result.message || 'Webhook failed' };
      }

      this.log('Webhook sent successfully');
      return { success: true, message: result.message || 'Success' };
    } catch (error) {
      console.error('Webhook send error:', error);
      return { success: false, message: String(error) };
    }
  }

  /**
   * Flush queued events
   */
  private async flushQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const events = this.eventQueue.splice(0, this.batchSize);

    try {
      for (const event of events) {
        await this.sendWebhook(event);
      }
    } catch (error) {
      console.error('Error flushing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start batch processor for queued events
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushQueue();
      }
    }, this.batchInterval);
  }

  /**
   * Generate HMAC signature for webhook
   */
  private generateSignature(payload: any): string {
    // For frontend, use a simple hash (in production, use crypto library or backend)
    const message = JSON.stringify(payload);
    const arr = new TextEncoder().encode(message + this.config.apiKey);
    let hash = 0;
    for (let i = 0; i < arr.length; i++) {
      const char = arr[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify connection to Arunika Monitoring
   */
  public async verifyConnection(): Promise<boolean> {
    try {
      const payload = {
        eventType: 'user_activity',
        appId: this.config.appId,
        appName: this.config.appName,
        data: {
          userId: 'system',
          activityType: 'connection_test'
        },
        timestamp: new Date().toISOString()
      };

      const result = await this.sendWebhook(payload);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get current queue size
   */
  public getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Enable/disable debug logging
   */
  public setDebug(debug: boolean): void {
    this.config.debug = debug;
  }

  /**
   * Internal logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[ArunikaSDK]', ...args);
    }
  }
}

// Export for use in different environments
if (typeof window !== 'undefined') {
  (window as any).ArunikaSDK = ArunikaSDK;
}

export default ArunikaSDK;
