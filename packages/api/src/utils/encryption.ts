import crypto from 'crypto';
import { logger } from './logger';

// Get encryption key from environment, ensuring it's properly set up
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    logger.error('ENCRYPTION_KEY environment variable is not set!');
    throw new Error('Encryption key is missing');
  }
  
  // Use SHA-256 to get a consistent length key for AES
  return crypto.createHash('sha256').update(String(key)).digest();
};

// Encrypt data using AES-256-GCM
export const encrypt = (text: string): { encryptedData: string; iv: string } => {
  try {
    const iv = crypto.randomBytes(16); // Initialization vector
    const key = getEncryptionKey();
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag for integrity verification
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return the encrypted data, IV, and auth tag
    return {
      encryptedData: encrypted + ':' + authTag,
      iv: iv.toString('hex')
    };
  } catch (error) {
    logger.error('Encryption failed', { error });
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data using AES-256-GCM
export const decrypt = (encryptedData: string, ivHex: string): string => {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    
    // Split the encrypted data and auth tag
    const [encrypted, authTag] = encryptedData.split(':');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', { error });
    throw new Error('Failed to decrypt data');
  }
};