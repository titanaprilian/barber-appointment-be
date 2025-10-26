import type { Static } from '@sinclair/typebox';
import type { Data } from './schemas.js';

export type User = Static<typeof Data.userBody>;
export type UserLogin = Static<typeof Data.userLoginBody>;
export type UserRegister = Static<typeof Data.userRegisterBody>;
