import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface SMTPSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: boolean;
}

const SETTINGS_DOC_ID = "global_settings";

class SettingsService {
  async getSMTPSettings(): Promise<SMTPSettings | null> {
    try {
      const docRef = doc(db, "settings", SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as SMTPSettings;
      }
      return null;
    } catch (error) {
      console.error("Error fetching SMTP settings:", error);
      return null;
    }
  }

  async saveSMTPSettings(settings: SMTPSettings): Promise<void> {
    try {
      const docRef = doc(db, "settings", SETTINGS_DOC_ID);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      console.error("Error saving SMTP settings:", error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
