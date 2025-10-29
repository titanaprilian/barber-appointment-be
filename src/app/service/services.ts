import { ServiceNotExistsError } from './errors.js';
import ServiceRepository from './repositories.js';
import { ServiceBody, ServiceResponse, UpdateServiceBody } from './types.js';

class ServiceService {
  private repository: ServiceRepository;

  constructor(repository: ServiceRepository) {
    this.repository = repository;
  }

  /**
   * Creates a new service
   */
  public async create(serviceData: ServiceBody): Promise<ServiceResponse> {
    return this.repository.create(serviceData);
  }

  /**
   * Retrieves a list of all available services.
   */
  public async getAll(): Promise<ServiceResponse[]> {
    return this.repository.getAll();
  }

  /**
   * Retrieves a single service by its ID.
   * If not founds, throw error
   */
  public async getById(serviceId: number): Promise<ServiceResponse> {
    // find the service by its id, if not found throw error
    const service = await this.repository.findById(serviceId);
    if (!service) {
      throw new ServiceNotExistsError('Service is not found');
    }

    return service;
  }

  /**
   * Updates an existing service, including checking for duplicate names.
   */
  public async update(serviceId: number, updates: UpdateServiceBody): Promise<ServiceResponse | undefined> {
    // First, find the current service
    const currentService = await this.getById(serviceId);

    // check if the service data is actually being updated
    // if not, return the current service
    if (
      (!updates.name || updates.name === currentService.name) &&
      (!updates.price || updates.price === currentService.price) &&
      (!updates.duration || updates.duration === currentService.duration) &&
      (!updates.description || updates.description === currentService.description)
    ) {
      return currentService;
    }

    return this.repository.update(serviceId, updates);
  }

  /**
   * Deletes a service by ID.
   */
  public async delete(serviceId: number): Promise<boolean> {
    // First, check the service exist or not
    await this.getById(serviceId);

    return this.repository.delete(serviceId);
  }
}

export default ServiceService;
