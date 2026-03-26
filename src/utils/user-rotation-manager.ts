import { logger } from '@utils/logger';
import { environment } from '@config/environment';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * User data interface for dynamic user generation
 */
export interface DynamicUserData {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  testScenario?: string;
  rotationFile?: string;
}

/**
 * Rotation configuration interface
 */
export interface RotationConfig {
  maxUsersPerFile: number;
  retentionDays: number;
  cleanupEnabled: boolean;
  rotationBasePath: string;
  archivePath: string;
}

/**
 * Rotation file metadata
 */
interface RotationFileMetadata {
  fileName: string;
  filePath: string;
  userCount: number;
  createdAt: Date;
  lastModified: Date;
}

/**
 * User Rotation Manager - Sistema de rotación automática de usuarios
 * Implementa la Opción 1: Sistema de Rotación Automática del análisis
 */
export class UserRotationManager {
  private static instance: UserRotationManager;
  private config: RotationConfig;
  private currentRotationFile: string | null = null;
  private rotationMetadata: RotationFileMetadata[] = [];

  private constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UserRotationManager {
    if (!UserRotationManager.instance) {
      UserRotationManager.instance = new UserRotationManager();
    }
    return UserRotationManager.instance;
  }

  /**
   * Load rotation configuration from environment
   */
  private loadConfiguration(): RotationConfig {
    const envConfig = environment.getConfig();
    const baseDataPath = envConfig.testDataPath;

    return {
      maxUsersPerFile: parseInt(process.env.MAX_USERS_PER_FILE || '50'),
      retentionDays: parseInt(process.env.USER_RETENTION_DAYS || '7'),
      cleanupEnabled: process.env.CLEANUP_ENABLED !== 'false',
      rotationBasePath: path.join(baseDataPath, 'users', 'rotation'),
      archivePath: path.join(baseDataPath, 'users', 'archived')
    };
  }

  /**
   * Initialize rotation system - create directories and load metadata
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing User Rotation Manager');

      // Create required directories
      await this.ensureDirectories();

      // Load existing rotation files metadata
      await this.loadRotationMetadata();

      // Set current rotation file
      await this.setCurrentRotationFile();

      // Perform initial cleanup if enabled
      if (this.config.cleanupEnabled) {
        await this.performCleanup();
      }

      logger.info('User Rotation Manager initialized successfully', {
        currentRotationFile: this.currentRotationFile,
        totalRotationFiles: this.rotationMetadata.length,
        config: this.config
      });

    } catch (error) {
      logger.error('Failed to initialize User Rotation Manager', { error });
      throw error;
    }
  }

  /**
   * Create a new dynamic user with rotation management
   */
  public async createDynamicUser(testScenario?: string): Promise<DynamicUserData> {
    try {
      const startTime = Date.now();
      
      // Generate user data
      const userData = await this.generateUserData(testScenario);
      
      // Store user with rotation
      await this.storeUserWithRotation(userData);
      
      const duration = Date.now() - startTime;
      logger.info('Dynamic user created successfully', {
        userId: userData.id,
        username: userData.username,
        testScenario,
        rotationFile: userData.rotationFile,
        duration: `${duration}ms`
      });

      return userData;

    } catch (error) {
      logger.error('Failed to create dynamic user', { testScenario, error });
      throw error;
    }
  }

  /**
   * Get a previously created user from rotation storage
   */
  public async getPreviousUser(criteria?: { testScenario?: string }): Promise<DynamicUserData | null> {
    try {
      const startTime = Date.now();

      // Search across all rotation files
      for (const metadata of this.rotationMetadata) {
        const users = await this.loadUsersFromFile(metadata.filePath);
        
        let foundUser: DynamicUserData | null = null;
        
        if (criteria?.testScenario) {
          foundUser = users.find(u => u.testScenario === criteria.testScenario) || null;
        } else {
          // Return most recent user
          foundUser = users.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0] || null;
        }

        if (foundUser) {
          const duration = Date.now() - startTime;
          logger.info('User retrieved from rotation storage', {
            userId: foundUser.id,
            username: foundUser.username,
            rotationFile: path.basename(metadata.filePath),
            duration: `${duration}ms`
          });
          return foundUser;
        }
      }

      logger.warn('No matching user found in rotation storage', { criteria });
      return null;

    } catch (error) {
      logger.error('Failed to retrieve user from rotation storage', { criteria, error });
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  public async getHealthMetrics(): Promise<{
    totalUsers: number;
    rotationFiles: number;
    oldestFile: Date | null;
    newestFile: Date | null;
    systemIntegrity: boolean;
  }> {
    try {
      let totalUsers = 0;
      let systemIntegrity = true;

      // Count users across all files and verify integrity
      for (const metadata of this.rotationMetadata) {
        try {
          const users = await this.loadUsersFromFile(metadata.filePath);
          totalUsers += users.length;
        } catch (error) {
          logger.error('File integrity issue detected', { 
            file: metadata.filePath, 
            error 
          });
          systemIntegrity = false;
        }
      }

      const dates = this.rotationMetadata.map(m => m.createdAt);
      const oldestFile = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
      const newestFile = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

      return {
        totalUsers,
        rotationFiles: this.rotationMetadata.length,
        oldestFile,
        newestFile,
        systemIntegrity
      };

    } catch (error) {
      logger.error('Failed to get health metrics', { error });
      throw error;
    }
  }

  /**
   * Perform cleanup of old rotation files
   */
  public async performCleanup(): Promise<void> {
    if (!this.config.cleanupEnabled) {
      logger.info('Cleanup is disabled');
      return;
    }

    try {
      const startTime = Date.now();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      let cleanedFiles = 0;
      let archivedFiles = 0;

      for (const metadata of this.rotationMetadata) {
        if (metadata.createdAt < cutoffDate) {
          // Archive file before deletion
          await this.archiveRotationFile(metadata);
          archivedFiles++;

          // Remove from active rotation
          await fs.unlink(metadata.filePath);
          cleanedFiles++;

          logger.info('Rotation file cleaned up', {
            file: path.basename(metadata.filePath),
            age: cutoffDate.getTime() - metadata.createdAt.getTime()
          });
        }
      }

      // Reload metadata after cleanup
      await this.loadRotationMetadata();

      const duration = Date.now() - startTime;
      logger.info('Cleanup completed', {
        cleanedFiles,
        archivedFiles,
        remainingFiles: this.rotationMetadata.length,
        duration: `${duration}ms`
      });

    } catch (error) {
      logger.error('Cleanup failed', { error });
      throw error;
    }
  }

  /**
   * Generate user data with realistic values
   */
  private async generateUserData(testScenario?: string): Promise<DynamicUserData> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    return {
      id: uuidv4(),
      username: `testuser_${timestamp}_${randomId}`,
      password: this.generateSecurePassword(),
      firstName: this.generateFirstName(),
      lastName: this.generateLastName(),
      email: `test_${timestamp}_${randomId}@automation.local`,
      createdAt: new Date(),
      testScenario
    };
  }

  /**
   * Store user with automatic rotation
   */
  private async storeUserWithRotation(userData: DynamicUserData): Promise<void> {
    // Check if current file needs rotation
    if (await this.needsRotation()) {
      await this.createNewRotationFile();
    }

    // Load current users
    const currentUsers = await this.loadCurrentUsers();
    
    // Add new user
    userData.rotationFile = this.currentRotationFile || '';
    currentUsers.push(userData);

    // Save to file
    await fs.writeFile(
      path.join(this.config.rotationBasePath, this.currentRotationFile!),
      JSON.stringify(currentUsers, null, 2),
      'utf8'
    );

    // Update metadata
    await this.updateRotationMetadata();
  }

  /**
   * Check if current rotation file needs rotation
   */
  private async needsRotation(): Promise<boolean> {
    if (!this.currentRotationFile) {
      return true;
    }

    try {
      const currentUsers = await this.loadCurrentUsers();
      return currentUsers.length >= this.config.maxUsersPerFile;
    } catch (error) {
      logger.warn('Could not check rotation status, assuming rotation needed', { error });
      return true;
    }
  }

  /**
   * Create new rotation file
   */
  private async createNewRotationFile(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newFileName = `users_rotation_${timestamp}.json`;
    
    this.currentRotationFile = newFileName;
    
    const filePath = path.join(this.config.rotationBasePath, newFileName);
    await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');

    logger.info('New rotation file created', { fileName: newFileName });
  }

  /**
   * Load current users from active rotation file
   */
  private async loadCurrentUsers(): Promise<DynamicUserData[]> {
    if (!this.currentRotationFile) {
      return [];
    }

    const filePath = path.join(this.config.rotationBasePath, this.currentRotationFile);
    return this.loadUsersFromFile(filePath);
  }

  /**
   * Load users from specific file
   */
  private async loadUsersFromFile(filePath: string): Promise<DynamicUserData[]> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const users = JSON.parse(content);
      
      // Convert date strings back to Date objects
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }));
      
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      if (error instanceof SyntaxError) {
        logger.warn('Malformed JSON in rotation file, skipping', { filePath, error: error.message });
        return [];
      }
      throw error;
    }
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.config.rotationBasePath, { recursive: true });
    await fs.mkdir(this.config.archivePath, { recursive: true });
  }

  /**
   * Load rotation metadata from files
   */
  private async loadRotationMetadata(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.rotationBasePath);
      const jsonFiles = files.filter(f => f.endsWith('.json') && f.startsWith('users_rotation_'));

      this.rotationMetadata = [];

      for (const fileName of jsonFiles) {
        const filePath = path.join(this.config.rotationBasePath, fileName);
        const stats = await fs.stat(filePath);
        const users = await this.loadUsersFromFile(filePath);

        this.rotationMetadata.push({
          fileName,
          filePath,
          userCount: users.length,
          createdAt: stats.birthtime,
          lastModified: stats.mtime
        });
      }

      // Sort by creation date (newest first)
      this.rotationMetadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
      this.rotationMetadata = [];
    }
  }

  /**
   * Set current rotation file (most recent or create new)
   */
  private async setCurrentRotationFile(): Promise<void> {
    if (this.rotationMetadata.length === 0) {
      await this.createNewRotationFile();
      return;
    }

    // Use most recent file if it's not full
    const latestFile = this.rotationMetadata[0];
    if (latestFile.userCount < this.config.maxUsersPerFile) {
      this.currentRotationFile = latestFile.fileName;
    } else {
      await this.createNewRotationFile();
    }
  }

  /**
   * Update rotation metadata after changes
   */
  private async updateRotationMetadata(): Promise<void> {
    if (!this.currentRotationFile) return;

    const filePath = path.join(this.config.rotationBasePath, this.currentRotationFile);
    const stats = await fs.stat(filePath);
    const users = await this.loadUsersFromFile(filePath);

    // Find and update existing metadata or add new
    const existingIndex = this.rotationMetadata.findIndex(m => m.fileName === this.currentRotationFile);
    
    const metadata: RotationFileMetadata = {
      fileName: this.currentRotationFile,
      filePath,
      userCount: users.length,
      createdAt: stats.birthtime,
      lastModified: stats.mtime
    };

    if (existingIndex >= 0) {
      this.rotationMetadata[existingIndex] = metadata;
    } else {
      this.rotationMetadata.unshift(metadata);
    }
  }

  /**
   * Archive rotation file before deletion
   */
  private async archiveRotationFile(metadata: RotationFileMetadata): Promise<void> {
    const archiveFileName = `archived_${Date.now()}_${metadata.fileName}`;
    const archivePath = path.join(this.config.archivePath, archiveFileName);
    
    await fs.copyFile(metadata.filePath, archivePath);
    
    logger.info('Rotation file archived', {
      originalFile: metadata.fileName,
      archiveFile: archiveFileName
    });
  }

  /**
   * Generate secure password
   */
  private generateSecurePassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required type
    password += 'A'; // Upper
    password += 'a'; // Lower  
    password += '1'; // Number
    password += '!'; // Special
    
    // Fill remaining length
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate realistic first names
   */
  private generateFirstName(): string {
    const names = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa',
      'Robert', 'Maria', 'William', 'Jennifer', 'Richard', 'Patricia', 'Charles',
      'Linda', 'Thomas', 'Elizabeth', 'Christopher', 'Barbara', 'Daniel', 'Susan'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generate realistic last names
   */
  private generateLastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }
}

// Export singleton instance
export const userRotationManager = UserRotationManager.getInstance();