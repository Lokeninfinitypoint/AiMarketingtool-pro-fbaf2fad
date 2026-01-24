import { Client, Account, Databases, Storage, Functions, ID, Query, Models, OAuthProvider } from 'react-native-appwrite';
import * as SecureStore from 'expo-secure-store';

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://api.marketingtool.pro/v1';
const APPWRITE_PROJECT_ID = '6952c8a0002d3365625d';
const APPWRITE_PLATFORM = 'pro.marketingtool.app';

// Database IDs
export const DATABASE_ID = 'marketingtool_db';
export const COLLECTIONS = {
  USERS: 'users',
  TOOLS: 'tools',
  GENERATIONS: 'generations',
  SUBSCRIPTIONS: 'subscriptions',
  CHAT_SESSIONS: 'chat_sessions',
  CHAT_MESSAGES: 'chat_messages',
  FAVORITES: 'favorites',
  USAGE: 'usage',
};

// Storage Bucket IDs
export const BUCKETS = {
  AVATARS: 'avatars',
  MEDIA: 'media',
  EXPORTS: 'exports',
};

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setPlatform(APPWRITE_PLATFORM);

// Initialize Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Session Management
const SESSION_KEY = 'appwrite_session';

export const saveSession = async (session: string): Promise<void> => {
  await SecureStore.setItemAsync(SESSION_KEY, session);
};

export const getSession = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(SESSION_KEY);
};

export const deleteSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

// Auth Functions
export const authService = {
  // Create Account
  async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    try {
      const newAccount = await account.create(ID.unique(), email, password, name);
      await this.login(email, password);
      return newAccount;
    } catch (error) {
      throw error;
    }
  },

  // Login with Email
  async login(email: string, password: string): Promise<Models.Session> {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      await saveSession(session.$id);
      return session;
    } catch (error) {
      throw error;
    }
  },

  // Login with Google
  async loginWithGoogle(): Promise<void> {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        'marketingtool://oauth',
        'marketingtool://oauth'
      );
    } catch (error) {
      throw error;
    }
  },

  // Login with Apple
  async loginWithApple(): Promise<void> {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Apple,
        'marketingtool://oauth',
        'marketingtool://oauth'
      );
    } catch (error) {
      throw error;
    }
  },

  // Login with Facebook
  async loginWithFacebook(): Promise<void> {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Facebook,
        'marketingtool://oauth',
        'marketingtool://oauth'
      );
    } catch (error) {
      throw error;
    }
  },

  // Get Current User
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      await deleteSession();
    } catch (error) {
      throw error;
    }
  },

  // Reset Password
  async resetPassword(email: string): Promise<Models.Token> {
    try {
      return await account.createRecovery(
        email,
        'https://app.marketingtool.pro/reset-password'
      );
    } catch (error) {
      throw error;
    }
  },

  // Update Password
  async updatePassword(oldPassword: string, newPassword: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      throw error;
    }
  },

  // Update Profile
  async updateProfile(name: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateName(name);
    } catch (error) {
      throw error;
    }
  },

  // Verify Email
  async verifyEmail(): Promise<Models.Token> {
    try {
      return await account.createVerification(
        'https://app.marketingtool.pro/verify-email'
      );
    } catch (error) {
      throw error;
    }
  },
};

// Database Functions
export const dbService = {
  // Create Document
  async createDocument<T extends Models.Document>(
    collectionId: string,
    data: Record<string, unknown>,
    documentId: string = ID.unique()
  ): Promise<T> {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data as any
      ) as T;
    } catch (error) {
      throw error;
    }
  },

  // Get Document
  async getDocument<T extends Models.Document>(
    collectionId: string,
    documentId: string
  ): Promise<T> {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        collectionId,
        documentId
      ) as T;
    } catch (error) {
      throw error;
    }
  },

  // List Documents
  async listDocuments<T extends Models.Document>(
    collectionId: string,
    queries: string[] = []
  ): Promise<Models.DocumentList<T>> {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        queries
      ) as Models.DocumentList<T>;
    } catch (error) {
      throw error;
    }
  },

  // Update Document
  async updateDocument<T extends Models.Document>(
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
  ): Promise<T> {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data as any
      ) as T;
    } catch (error) {
      throw error;
    }
  },

  // Delete Document
  async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
      throw error;
    }
  },
};

// Storage Functions
export const storageService = {
  // Upload File
  async uploadFile(
    bucketId: string,
    file: { uri: string; name: string; type: string; size: number }
  ): Promise<Models.File> {
    try {
      return await storage.createFile(
        bucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      throw error;
    }
  },

  // Get File URL
  getFileUrl(bucketId: string, fileId: string): string {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
  },

  // Get File Preview
  getFilePreview(bucketId: string, fileId: string, width: number = 400, height: number = 400): string {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}&width=${width}&height=${height}`;
  },

  // Delete File
  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      throw error;
    }
  },
};

// Function Execution
export const functionService = {
  async execute(functionId: string, data?: string): Promise<Models.Execution> {
    try {
      return await functions.createExecution(functionId, data);
    } catch (error) {
      throw error;
    }
  },
};

export { client, ID, Query };
export default { authService, dbService, storageService, functionService };
