import type { Static } from '@sinclair/typebox';
import type { Data } from './schemas.js';

export type UserProfileResponse = Static<typeof Data.userProfileResponse>;
export type UserUpdateProfileBody = Static<typeof Data.userUpdateProfileBody>;
export type UserUpdatePasswordBody = Static<typeof Data.userUpdatePasswordBody>;
