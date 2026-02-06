// Firebase Phone Auth Service with App Check
// Project: marketing-tool-484720 (same as Google OAuth + Ads)
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import appCheck from '@react-native-firebase/app-check';

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;
let appCheckInitialized = false;

/**
 * Initialize Firebase App Check (required for Auth)
 */
export const initializeAppCheck = async (): Promise<void> => {
  if (appCheckInitialized) return;

  try {
    const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider();
    rnfbProvider.configure({
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
        debugToken: __DEV__ ? 'YOUR-DEBUG-TOKEN' : undefined,
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'deviceCheck',
        debugToken: __DEV__ ? 'YOUR-DEBUG-TOKEN' : undefined,
      },
    });

    await appCheck().initializeAppCheck({
      provider: rnfbProvider,
      isTokenAutoRefreshEnabled: true,
    });

    appCheckInitialized = true;
    console.log('Firebase App Check initialized');
  } catch (error) {
    console.error('App Check initialization error:', error);
    // Continue anyway for development
    appCheckInitialized = true;
  }
};

export const firebasePhoneAuth = {
  /**
   * Send OTP to phone number
   * @param phoneNumber - Full phone number with country code (e.g., +919571312555)
   */
  async sendOTP(phoneNumber: string): Promise<string> {
    try {
      // Ensure App Check is initialized
      await initializeAppCheck();

      // Format phone number - auto add +91 for 10-digit Indian numbers
      let formattedPhone = phoneNumber.replace(/[\s\-()]/g, '');
      if (formattedPhone.length === 10 && /^[6-9]\d{9}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = `+${formattedPhone}`;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      confirmationResult = await auth().signInWithPhoneNumber(formattedPhone);
      return confirmationResult.verificationId;
    } catch (error: any) {
      console.error('Firebase sendOTP error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  /**
   * Verify OTP code
   * @param code - 6-digit OTP code entered by user
   */
  async verifyOTP(code: string): Promise<FirebaseAuthTypes.User | null> {
    try {
      if (!confirmationResult) {
        throw new Error('No OTP request found. Please request OTP first.');
      }
      const result = await confirmationResult.confirm(code);
      return result?.user || null;
    } catch (error: any) {
      console.error('Firebase verifyOTP error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid OTP code. Please try again.');
      }
      if (error.code === 'auth/session-expired') {
        throw new Error('OTP expired. Please request a new one.');
      }
      throw new Error(error.message || 'OTP verification failed');
    }
  },

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  },

  /**
   * Sign out from Firebase
   */
  async signOut(): Promise<void> {
    confirmationResult = null;
    await auth().signOut();
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  },
};

export default firebasePhoneAuth;
