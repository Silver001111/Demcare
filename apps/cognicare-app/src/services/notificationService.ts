import { ReminderItem, LanguageCode, getLocalizedText } from '../types';
import { audioSpeech } from './audioSpeech';

/**
 * Manages browser notifications and timed audio alerts for medication reminders.
 * 
 * Usage:
 *   1. Call requestPermission() once on app start
 *   2. Call scheduleReminder() for each active reminder
 *   3. The service will fire browser notifications + voice prompts at the scheduled times
 */
export class NotificationService {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Requests browser notification permission. Must be called from a user gesture context.
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  /**
   * Schedules a browser notification + voice prompt for a specific reminder.
   * 
   * @param reminder - The reminder item containing time and spoken prompt
   * @param lang - Current language code for the voice prompt
   */
  scheduleReminder(reminder: ReminderItem, lang: LanguageCode) {
    try {
      // Parse the time string (e.g., "08:30 AM") to get today's target time
      const now = new Date();
      const parts = reminder.time.trim().split(' ');
      if (parts.length < 2) return;
      
      const [time, period] = parts;
      const [hoursStr, minutesStr] = time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) return;

      let targetHour = hours;
      const upperPeriod = period.toUpperCase();
      if (upperPeriod === 'PM' && hours !== 12) targetHour += 12;
      if (upperPeriod === 'AM' && hours === 12) targetHour = 0;

      const target = new Date();
      target.setHours(targetHour, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();

      // Clear existing timer for this reminder ID
      if (this.timers.has(reminder.id)) {
        clearTimeout(this.timers.get(reminder.id));
      }

      const timer = setTimeout(() => {
        this.fireReminder(reminder, lang);
      }, delay);

      this.timers.set(reminder.id, timer);
      console.log(`Reminder scheduled: "${reminder.title}" in ${Math.round(delay / 60000)} minutes`);
    } catch (e) {
      console.error('Failed to schedule reminder:', e);
    }
  }

  /**
   * Fires the actual notification + voice prompt
   */
  private fireReminder(reminder: ReminderItem, lang: LanguageCode) {
    // Browser push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('CogniCare NER — Medicine Time', {
          body: getLocalizedText(reminder.title, lang),
          icon: '/pwa-192x192.png',
          tag: reminder.id,
          requireInteraction: true,
        });
      } catch (e) {
        console.warn('Could not display desktop notification:', e);
      }
    }

    // Spoken voice prompt in the patient's language
    const spokenText = reminder.spokenPrompt?.[lang] || getLocalizedText(reminder.title, lang);
    audioSpeech.speak(spokenText, lang);
    audioSpeech.playGentleChime('gentle_alert');
  }

  /**
   * Clears all scheduled timers
   */
  clearAll() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}

export const notificationService = new NotificationService();
