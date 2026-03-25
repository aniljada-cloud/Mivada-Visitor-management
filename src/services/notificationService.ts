import { toast } from "sonner";
import { settingsService } from "./settingsService";

export interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
  visitorName: string;
  hostName: string;
  type: 'check-in' | 'check-out';
}

class NotificationService {
  /**
   * Sends an email notification to the host.
   * In a real application, this would call a backend API or a serverless function.
   */
  async sendEmail(payload: NotificationPayload): Promise<void> {
    const smtpSettings = await settingsService.getSMTPSettings();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log the notification for debugging
    if (smtpSettings && smtpSettings.smtpHost) {
      console.log(`[Notification Service] Using SMTP Server: ${smtpSettings.smtpHost}:${smtpSettings.smtpPort}`);
      console.log(`[Notification Service] From: ${smtpSettings.smtpFrom}`);
    } else {
      console.log(`[Notification Service] No SMTP configured. Using default simulator.`);
    }

    console.log(`[Notification Service] Sending ${payload.type} email to ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body: ${payload.body}`);

    // In a real app, you'd do something like:
    // await fetch('/api/notify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });

    // Show a toast to indicate the notification was "sent"
    toast.info(`Notification sent to ${payload.hostName} (${payload.to})`);
  }

  async notifyCheckIn(visitorName: string, hostName: string, hostEmail: string) {
    const payload: NotificationPayload = {
      to: hostEmail,
      subject: `Visitor Arrival: ${visitorName}`,
      body: `Hello ${hostName},\n\nYour visitor, ${visitorName}, has just checked in and is waiting for you at the reception.\n\nRegards,\nReception Team`,
      visitorName,
      hostName,
      type: 'check-in'
    };
    return this.sendEmail(payload);
  }

  async notifyCheckOut(visitorName: string, hostName: string, hostEmail: string) {
    const payload: NotificationPayload = {
      to: hostEmail,
      subject: `Visitor Departure: ${visitorName}`,
      body: `Hello ${hostName},\n\nYour visitor, ${visitorName}, has just checked out and left the building.\n\nRegards,\nReception Team`,
      visitorName,
      hostName,
      type: 'check-out'
    };
    return this.sendEmail(payload);
  }
}

export const notificationService = new NotificationService();
