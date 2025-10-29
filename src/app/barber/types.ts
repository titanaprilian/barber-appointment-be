import type { Static } from '@sinclair/typebox';
import type { Data } from './schemas.js';

export type BarberBody = Static<typeof Data.postBarberBody>;
export type BarberUpdateBody = Static<typeof Data.updateBarberBody>;
export type BarberResponse = Static<typeof Data.getBarberResponse>;
