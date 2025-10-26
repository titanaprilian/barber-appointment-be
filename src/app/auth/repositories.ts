import type { ColumnType, Insertable, Kysely, Selectable } from 'kysely';
import { User, UserRegister } from './types.js';
import { randomBytes } from 'crypto';
import addDays from 'add-days';

interface UserTable {
  id: ColumnType<number, never, never>;
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
}

interface RefreshTokenTable {
  id: ColumnType<number, never, never>;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

interface Database {
  User: UserTable;
  RefreshToken: RefreshTokenTable;
}

type InsertableUser = Insertable<UserTable>;
type InsertableRefreshToken = Insertable<RefreshTokenTable>;
type SelectableRefreshToken = Selectable<RefreshTokenTable>;

class AuthRepository {
  private db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  /**
   * Create a new user.
   */
  async create(userData: UserRegister): Promise<User> {
    const userToInsert: InsertableUser = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'customer',
      phone: userData.phone,
    };

    const result = await this.db
      .insertInto('User')
      .values(userToInsert) // Pass the valid InsertableUser object
      .returningAll() // Tells the database to return ALL columns, including the generated 'id'
      .executeTakeFirstOrThrow();

    // The 'result' type will now be correctly inferred as 'User'
    return result;
  }

  /**
   * Finds a user by id, returns the user if found, or undefined otherwise.
   */
  async findById(userId: number): Promise<User | undefined> {
    return await this.db.selectFrom('User').selectAll().where('id', '=', userId).executeTakeFirst();
  }

  /**
   * Finds a user by email, returns the user if found, or undefined otherwise.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return await this.db.selectFrom('User').selectAll().where('email', '=', email).executeTakeFirst();
  }

  /** Finds a user by name, returns the user or undefined. */
  async findByName(name: string): Promise<User | undefined> {
    return await this.db.selectFrom('User').selectAll().where('name', '=', name).executeTakeFirst();
  }

  /** Finds a user by phone, returns the user or undefined. */
  async findByPhone(phone: string): Promise<User | undefined> {
    return await this.db.selectFrom('User').selectAll().where('phone', '=', phone).executeTakeFirst();
  }

  /** Finds a valid refresh token and returns its record.*/
  async findValidRefreshToken(token: string): Promise<SelectableRefreshToken | undefined> {
    return await this.db
      .selectFrom('RefreshToken')
      .selectAll()
      .where('token', '=', token)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();
  }

  /**
   * Create a refresh token .
   */
  async createRefreshToken(userId: number): Promise<string> {
    const tokenValue = randomBytes(32).toString('hex');
    const createdAt = new Date();
    const expiryDate = addDays(new Date(), 30);
    const tokenToInsert: InsertableRefreshToken = {
      user_id: userId,
      token: tokenValue,
      expires_at: expiryDate,
      created_at: createdAt,
    };

    await this.db.insertInto('RefreshToken').values(tokenToInsert).execute();
    return tokenValue;
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    const result = await this.db.deleteFrom('RefreshToken').where('token', '=', token).executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}

export default AuthRepository;
