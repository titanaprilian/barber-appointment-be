import { InvalidCredentialsError, UserExistsError } from '@app/auth/errors.js';
import UserRepository, { UpdatableUser } from './repositories.js';
import { UserProfileResponse, UserUpdateProfileBody } from './types.js';
import { UserNotExistsError } from './errors.js';
import bcrypt from 'bcryptjs';

class UserService {
  private repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  private ALLOWED_UPDATE_FIELDS = ['name', 'email', 'phone'];

  /**
   * Retrieves the profile data for the currently logged-in user.
   */
  public async getProfile(userId: number): Promise<UserProfileResponse | undefined> {
    const existingUser = await this.repository.findById(userId);
    if (!existingUser) {
      throw new UserNotExistsError('User is not found');
    }

    const { password, ...userWithoutPassword } = existingUser;
    return userWithoutPassword;
  }

  /**
   * Updates the profile data for the currently logged-in user.
   */
  public async updateProfile(userId: number, updates: UserUpdateProfileBody): Promise<UserProfileResponse | undefined> {
    const checks = [];

    if (updates.email) {
      checks.push(this.repository.findByEmail(updates.email));
    }
    if (updates.name) {
      checks.push(this.repository.findByName(updates.name));
    }
    if (updates.phone) {
      checks.push(this.repository.findByPhone(updates.phone));
    }

    const existingUsers = await Promise.all(checks);

    // CHECK FOR CONFLICTS (Specific Error Messages) ---
    let checkIndex = 0;

    if (updates.email) {
      const existingUser = existingUsers[checkIndex++];
      if (existingUser && existingUser.id !== userId) {
        throw new UserExistsError('User with this email already exists.');
      }
    }
    if (updates.name) {
      const existingUser = existingUsers[checkIndex++];
      if (existingUser && existingUser.id !== userId) {
        throw new UserExistsError('User with this name already exists.');
      }
    }
    if (updates.phone) {
      const existingUser = existingUsers[checkIndex++];
      if (existingUser && existingUser.id !== userId) {
        throw new UserExistsError('User with this phone already exists.');
      }
    }

    // APPLY SECURITY FILTER (Prevent updating sensitive fields like password) ---
    const cleanUpdates: UpdatableUser = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => this.ALLOWED_UPDATE_FIELDS.includes(key) && value !== undefined)
    );

    // Ensure we have something left to update after filtering
    if (Object.keys(cleanUpdates).length === 0) {
      return this.repository.findById(userId) as Promise<UserProfileResponse | undefined>;
    }

    return this.repository.update(userId, cleanUpdates) as Promise<UserProfileResponse | undefined>;
  }

  /**
   * Updates the password for the currently logged-in user.
   */
  public async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const userWithHash = await this.repository.findById(userId);

    if (!userWithHash) {
      throw new UserNotExistsError('User is not found');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, userWithHash.password);
    if (!passwordMatch) {
      throw new InvalidCredentialsError('Incorrect old password.');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(userId, newHashedPassword);
  }
}

export default UserService;
