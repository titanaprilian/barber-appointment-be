import bcrypt from 'bcryptjs';
import AuthRepository from './repositories.js';
import { User, UserLogin, UserRegister } from './types.js';
import { InvalidCredentialsError, InvalidTokenError, UserExistsError } from './errors.js';

export interface LoginServiceResponse {
  user: Omit<User, 'password'>;
  refreshToken: string;
}

class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  /**
   * Register a new user.
   */
  public async register(user: UserRegister): Promise<Omit<User, 'password'>> {
    const [existingEmailUser, existingNameUser, existingPhoneUser] = await Promise.all([
      this.repository.findByEmail(user.email),
      this.repository.findByName(user.name),
      this.repository.findByPhone(user.phone),
    ]);

    // Check for conflicts and throw specific errors
    if (existingEmailUser) {
      throw new UserExistsError('User with this email already exists.');
    }

    if (existingNameUser) {
      throw new UserExistsError('User with this username already exists.');
    }

    if (existingPhoneUser) {
      throw new UserExistsError('User with this phone number already exists.');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await this.repository.create({
      email: user.email,
      name: user.name,
      password: hashedPassword,
      phone: user.phone,
    });

    const { password, ...userWithoutPassword } = createdUser;

    return userWithoutPassword;
  }

  /**
   *  Login a user.
   */
  public async login(user: UserLogin): Promise<LoginServiceResponse> {
    const existingUser = await this.repository.findByEmail(user.email);
    if (!existingUser) {
      throw new InvalidCredentialsError('Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(user.password, existingUser.password);
    if (!passwordMatch) {
      throw new InvalidCredentialsError('Invalid email or password.');
    }

    const refreshToken = await this.repository.createRefreshToken(existingUser.id);
    const { password, ...userWithoutPassword } = existingUser;
    return {
      user: userWithoutPassword,
      refreshToken: refreshToken,
    };
  }

  /**
   *  Logout a user.
   */
  public async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      throw new InvalidTokenError('Refresh token is missing.');
    }

    const wasDeleted = await this.repository.deleteRefreshToken(refreshToken);
    if (!wasDeleted) {
      throw new InvalidTokenError('Refresh token is not valid.');
    }
  }

  /**
   * Refreshes tokens: validates the old refresh token, deletes it, and creates a new pair.
   */
  public async refresh(oldRefreshTokenValue: string): Promise<LoginServiceResponse> {
    const oldTokenRecord = await this.repository.findValidRefreshToken(oldRefreshTokenValue);
    if (!oldTokenRecord) {
      // Token is missing, expired, or invalid.
      throw new InvalidTokenError('Invalid or expired refresh token.');
    }

    await this.repository.deleteRefreshToken(oldRefreshTokenValue);
    const user = await this.repository.findById(oldTokenRecord.user_id);
    if (!user) {
      throw new InvalidTokenError('User associated with token not found.');
    }

    const refreshToken = await this.repository.createRefreshToken(user.id);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      refreshToken: refreshToken,
    };
  }
}

export default AuthService;
