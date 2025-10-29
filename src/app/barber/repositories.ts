import { Insertable, Kysely, Updateable } from 'kysely';
import { BarberBody, BarberResponse } from './types.js';
import { UserTable } from '@app/auth/repositories.js';

interface Database {
  User: UserTable;
}

type UpdatableBarber = Updateable<UserTable>;
type InsertableBarber = Insertable<UserTable>;

class BarberRepository {
  private db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  private readonly BARBER_SELECT_FIELDS = ['id', 'name', 'email', 'role', 'phone'] as const;

  /**
   * Create a new barber.
   */
  async create(barberData: BarberBody): Promise<BarberResponse> {
    const barberToInsert: InsertableBarber = {
      email: barberData.email,
      name: barberData.name,
      password: barberData.password,
      phone: barberData.phone,
      role: 'barber',
    };

    const result = await this.db
      .insertInto('User')
      .values(barberToInsert) // Pass the valid InsertableBarber object
      .returning(this.BARBER_SELECT_FIELDS)
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * get list of barbers
   */
  async getAll(): Promise<BarberResponse[]> {
    return await this.db.selectFrom('User').select(this.BARBER_SELECT_FIELDS).where('role', '=', 'barber').execute();
  }

  /**
   * Finds a barber by id, returns the barber if found, or undefined otherwise.
   */
  async findById(barberId: number): Promise<BarberResponse | undefined> {
    return await this.db
      .selectFrom('User')
      .select(this.BARBER_SELECT_FIELDS)
      .where('id', '=', barberId)
      .where('role', '=', 'barber')
      .executeTakeFirst();
  }

  /**
   * Finds a barber by email, returns the user if found, or undefined otherwise.
   */
  async findByEmail(email: string): Promise<BarberResponse | undefined> {
    return await this.db
      .selectFrom('User')
      .select(this.BARBER_SELECT_FIELDS)
      .where('email', '=', email)
      .where('role', '=', 'barber')
      .executeTakeFirst();
  }

  /** Finds a barber by name, returns the barber or undefined. */
  async findByName(name: string): Promise<BarberResponse | undefined> {
    return await this.db
      .selectFrom('User')
      .select(this.BARBER_SELECT_FIELDS)
      .where('name', '=', name)
      .where('role', '=', 'barber')
      .executeTakeFirst();
  }

  /** Finds a barber by phone, returns the barber or undefined. */
  async findByPhone(phone: string): Promise<BarberResponse | undefined> {
    return await this.db
      .selectFrom('User')
      .select(this.BARBER_SELECT_FIELDS)
      .where('phone', '=', phone)
      .where('role', '=', 'barber')
      .executeTakeFirst();
  }

  /**
   * Updates barber by ID.
   */
  async update(id: number, updates: UpdatableBarber): Promise<BarberResponse | undefined> {
    const updatedBarber = await this.db
      .updateTable('User')
      .set(updates)
      .where('id', '=', id)
      .where('role', '=', 'barber')
      .returning(this.BARBER_SELECT_FIELDS)
      .executeTakeFirst();

    return updatedBarber;
  }

  /**
   * Delete barber by ID.
   */
  async delete(barberId: number): Promise<boolean> {
    const result = await this.db
      .deleteFrom('User')
      .where('id', '=', barberId)
      .where('role', '=', 'barber')
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}

export default BarberRepository;
