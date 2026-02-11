import { metricsCollector } from './metricsCollector';

interface AlertConfig {
  email?: string;
  discordWebhook?: string;
  slackWebhook?: string;
}

class AlertService {
  private config: AlertConfig;
  private lastAlertTimes: Map<string, number> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  /**
   * Send alert notifications
   */
  async sendAlert(alert: { 
    metric: string; 
    currentValue: number; 
    threshold: number; 
    message: string 
  }): Promise<void> {
    // Check if we should send alert (rate limit to once per 5 minutes per metric)
    const lastAlertTime = this.lastAlertTimes.get(alert.metric) || 0;
    const currentTime = Date.now();
    
    if (currentTime - lastAlertTime < 5 * 60 * 1000) {
      return; // Skip alert, rate limited
    }
    
    this.lastAlertTimes.set(alert.metric, currentTime);
    
    const alertMessage = `
🚨 JobDone Alert 🚨
===================
Service Affected: ${alert.metric}
Metric Exceeded: ${alert.currentValue} > ${alert.threshold}
Timestamp: ${new Date().toISOString()}
Recommended Action: Investigate performance degradation in ${alert.metric}

This is an automated alert from JobDone monitoring system.
`;

    // Send to email if configured
    if (this.config.email) {
      await this.sendEmailAlert(alertMessage);
    }

    // Send to Discord if configured
    if (this.config.discordWebhook) {
      await this.sendDiscordAlert(alertMessage);
    }

    // Send to Slack if configured
    if (this.config.slackWebhook) {
      await this.sendSlackAlert(alertMessage);
    }
  }

  /**
   * Send email alert (placeholder - would integrate with free-tier SMTP)
   */
  private async sendEmailAlert(message: string): Promise<void> {
    console.log(`📧 EMAIL ALERT: ${message}`);
    // In production, integrate with free SMTP service like:
    // - Gmail SMTP (with app password)
    // - SendGrid free tier (100 emails/day)
    // - Mailgun free tier
  }

  /**
   * Send Discord alert via webhook
   */
  private async sendDiscordAlert(message: string): Promise<void> {
    console.log(`🤖 DISCORD ALERT: ${message}`);
    // In production, send to Discord webhook:
    // fetch(this.config.discordWebhook, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: message })
    // });
  }

  /**
   * Send Slack alert via webhook
   */
  private async sendSlackAlert(message: string): Promise<void> {
    console.log(`💬 SLACK ALERT: ${message}`);
    // In production, send to Slack webhook:
    // fetch(this.config.slackWebhook, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: message })
    // });
  }

  /**
   * Check metrics and send alerts
   */
  async checkAndSendAlerts(): Promise<void> {
    const alerts = metricsCollector.checkAlerts();
    
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }
}

// Initialize alert service with configuration from environment
const alertConfig: AlertConfig = {
  email: process.env.ALERT_EMAIL,
  discordWebhook: process.env.DISCORD_WEBHOOK,
  slackWebhook: process.env.SLACK_WEBHOOK
};

export const alertService = new AlertService(alertConfig);