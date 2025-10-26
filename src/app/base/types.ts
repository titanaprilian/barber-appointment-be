import type { Static } from '@sinclair/typebox';
import type { Data } from './schemas.js';

export type QueueBody = Static<typeof Data.queueBody>;
