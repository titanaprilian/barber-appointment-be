import { ColumnType, Insertable, Kysely, Updateable } from 'kysely';
import { ServiceBody, ServiceResponse } from './types.js';

export interface ServiceTable {
  id: ColumnType<number, never, never>;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface Database {
  Service: ServiceTable;
}

type InsertableService = Insertable<ServiceTable>;
export type UpdatableService = Updateable<ServiceTable>;

class ServiceRepository {
  private db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  /**
   * Create a new service.
   */
  async create(serviceData: ServiceBody): Promise<ServiceResponse> {
    const serviceToInsert: InsertableService = {
      name: serviceData.name,
      duration: serviceData.duration,
      price: serviceData.price,
      description: serviceData.description,
    };

    const result = await this.db
      .insertInto('Service')
      .values(serviceToInsert) // Pass the valid InsertableService object
      .returningAll() // Tells the database to return ALL columns, including the generated 'id'
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * get list of services
   */
  async getAll(): Promise<ServiceResponse[]> {
    return await this.db.selectFrom('Service').selectAll().execute();
  }

  /**
   * Finds a service by id, returns the service if found, or undefined otherwise.
   */
  async findById(serviceId: number): Promise<ServiceResponse | undefined> {
    return await this.db.selectFrom('Service').selectAll().where('id', '=', serviceId).executeTakeFirst();
  }

  /**
   * Updates service by ID.
   */
  async update(id: number, updates: UpdatableService): Promise<ServiceResponse | undefined> {
    const updatedService = await this.db
      .updateTable('Service')
      .set(updates)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedService;
  }

  /**
   * Delete service by ID.
   */
  async delete(serviceId: number): Promise<boolean> {
    const result = await this.db.deleteFrom('Service').where('id', '=', serviceId).executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}

export default ServiceRepository;
