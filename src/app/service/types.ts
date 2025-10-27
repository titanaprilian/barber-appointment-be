import type { Static } from '@sinclair/typebox';
import type { Data } from './schemas.js';

export type ServiceBody = Static<typeof Data.postServiceBody>;
export type UpdateServiceBody = Static<typeof Data.updateServiceBody>;
export type ServiceResponse = Static<typeof Data.getServiceResponse>;
