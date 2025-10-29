import bcrypt from 'bcryptjs';
import BarberRepository from './repositories.js';
import { BarberBody, BarberResponse, BarberUpdateBody } from './types.js';
import { UserNotExistsError } from '@app/user/errors.js';
import { UserExistsError } from '@app/auth/errors.js';

class BarberService {
  private repository: BarberRepository;

  constructor(repository: BarberRepository) {
    this.repository = repository;
  }

  /**
   * Creates a new barber
   */
  public async create(barberData: BarberBody): Promise<BarberResponse> {
    const [existingEmail, existingName, existingPhone] = await Promise.all([
      this.repository.findByEmail(barberData.email),
      this.repository.findByName(barberData.name),
      this.repository.findByPhone(barberData.phone),
    ]);

    if (existingEmail) throw new UserExistsError('Barber with this email already exists.');
    if (existingName) throw new UserExistsError('Barber with this name already exists.');
    if (existingPhone) throw new UserExistsError('Barber with this phone already exists.');

    const hashedPassword = await bcrypt.hash(barberData.password, 10);

    return this.repository.create({
      ...barberData,
      password: hashedPassword,
    });
  }

  /**
   * Retrieves a list of all barber.
   */
  public async getAll(): Promise<BarberResponse[]> {
    return this.repository.getAll();
  }

  /**
   * Retrieves a single barber by its ID.
   * If not founds, throw error
   */
  public async getById(barberId: number): Promise<BarberResponse> {
    // find the service by its id, if not found throw error
    const service = await this.repository.findById(barberId);
    if (!service) {
      throw new UserNotExistsError('Barber is not found');
    }

    return service;
  }

  /**
   * Updates an existing barber, including checking for duplicate name and email.
   */
  public async update(userId: number, updates: BarberUpdateBody): Promise<BarberResponse | undefined> {
    // First, find the current user
    const currentUser = await this.repository.findById(userId);
    if (!currentUser) {
      throw new UserNotExistsError('Barber is not found');
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
   * Deletes a barber by ID.
   */
  public async delete(barberId: number): Promise<boolean> {
    // First, check the barber exist or not
    await this.getById(barberId);

    return this.repository.delete(barberId);
  }
}

export default BarberService;
