import { UserTable } from '@app/auth/repositories.js';
import { User } from '@app/auth/types.js';
import { Kysely, Updateable } from 'kysely';

interface Database {
  User: UserTable;
}

export type UpdatableUser = Updateable<UserTable>;

class UserRepository {
  private db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  /**
   * Finds a user by their ID, excluding the password field.
   */
  async findById(id: number): Promise<User | undefined> {
    const user = await this.db.selectFrom('User').selectAll().where('id', '=', id).executeTakeFirst();

    return user;
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

  /**
   * Updates user profile information (name, email, phone) by ID.
   */
  async update(id: number, updates: UpdatableUser): Promise<Omit<User, 'password'> | undefined> {
    const updateRecord = {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
    };

    console.log('user id: ', id);

    const updatedUser = await this.db
      .updateTable('User')
      .set(updateRecord)
      .where('id', '=', id)
      .returning(['id', 'name', 'email', 'role', 'phone'])
      .executeTakeFirst();

    return updatedUser;
  }

  /**
   * Updates only the password field for a specific user ID.
   */
  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.db.updateTable('User').set({ password: hashedPassword }).where('id', '=', id).execute();
  }
}

export default UserRepository;
