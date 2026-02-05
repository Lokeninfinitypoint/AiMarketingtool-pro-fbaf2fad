// Firebase Phone Auth Service
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface PhoneAuthResult {
  verificationId: string;
  userId?: string;
}

export const firebasePhoneAuth = {
  /**
   * Send OTP to phone number
   * @param phoneNumber - Full phone number with country code (e.g., +919571312555)
   * @returns Promise with verificationId for OTP verification
   */
  async sendOTP(phoneNumber: string): Promise<PhoneAuthResult> {
    try {
      // Format phone number if needed
      let formattedPhone = phoneNumber.replace(/[\s\-()]/g, '');
      if (formattedPhone.length === 10 && /^[6-9]\d{9}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = `+${formattedPhone}`;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);

      return {
        verificationId: confirmation.verificationId,
      };
    } catch (error: any) {
      console.error('Firebase sendOTP error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  /**
   * Verify OTP code
   * @param verificationId - From sendOTP result
   * @param code - 6-digit OTP code entered by user
   * @returns Firebase user credential
   */
  async verifyOTP(verificationId: string, code: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await auth().signInWithCredential(credential);
      return userCredential;
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
