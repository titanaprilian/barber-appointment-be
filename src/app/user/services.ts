import { InvalidCredentialsError, UserExistsError } from '@app/auth/errors.js';
import UserRepository from './repositories.js';
import { UserProfileResponse, UserUpdateProfileBody } from './types.js';
import { UserNotExistsError } from './errors.js';
import bcrypt from 'bcryptjs';

class UserService {
  private repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

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
    // First, find the current user
    const currentUser = await this.repository.findById(userId);
    if (!currentUser) {
      throw new UserNotExistsError('User is not found');
    }

    // Check email update
    if (updates.email && updates.email !== currentUser.email) {
      const userWithEmail = await this.repository.findByEmail(updates.email);
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new UserExistsError('User with this email already exists.');
      }
    }

    // Check name update
    if (updates.name && updates.name !== currentUser.name) {
      const userWithName = await this.repository.findByName(updates.name);
      if (userWithName && userWithName.id !== userId) {
        throw new UserExistsError('User with this name already exists.');
      }
    }

    // Check phone update
    if (updates.phone && updates.phone !== currentUser.phone) {
      const userWithPhone = await this.repository.findByPhone(updates.phone);
      if (userWithPhone && userWithPhone.id !== userId) {
        throw new UserExistsError('User with this phone already exists.');
      }
    }

    // check if the name, email, or phone is actually being updated
    // if not, return the current user
    if (
      (!updates.name || updates.name === currentUser.name) &&
      (!updates.email || updates.email === currentUser.email) &&
      (!updates.phone || updates.phone === currentUser.phone)
    ) {
      return currentUser;
    }

    return await this.repository.update(userId, updates);
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
