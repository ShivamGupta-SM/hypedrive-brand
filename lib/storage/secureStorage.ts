import * as Keychain from 'react-native-keychain';

export interface SecureStorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

class SecureStorage implements SecureStorageInterface {
  private readonly serviceName = 'HyperdriveApp';

  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(`${this.serviceName}_${key}`);
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error(`Error getting item ${key} from secure storage:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        `${this.serviceName}_${key}`,
        key,
        value
      );
    } catch (error) {
      console.error(`Error setting item ${key} in secure storage:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetInternetCredentials({ server: `${this.serviceName}_${key}` });
    } catch (error) {
      console.error(`Error removing item ${key} from secure storage:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      // Get all stored services and remove them
      const allServices = await Keychain.getAllGenericPasswordServices();
      const promises = allServices
        .filter(service => service.startsWith(this.serviceName))
        .map(service => Keychain.resetInternetCredentials({ server: service }));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  }

  // Token-specific methods
  async getAccessToken(): Promise<string | null> {
    return this.getItem('access_token');
  }

  async setAccessToken(token: string): Promise<void> {
    return this.setItem('access_token', token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem('refresh_token');
  }

  async setRefreshToken(token: string): Promise<void> {
    return this.setItem('refresh_token', token);
  }

  async removeTokens(): Promise<void> {
    await Promise.all([
      this.removeItem('access_token'),
      this.removeItem('refresh_token'),
    ]);
  }
}

export const secureStorage = new SecureStorage();