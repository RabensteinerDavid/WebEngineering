import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../db/client.js';
import { env } from '../config/env.js';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const PgStore = connectPgSimple(session);
const sessionDurationMs = 86_400_000;
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  path: '/',
};

export const sessionMiddleware = session({
  name: 'bears.sid',
  secret: env.SESSION_SECRET,
  store: new PgStore({ pool, tableName: 'sessions' }),
  resave: false,
  saveUninitialized: false,
  cookie: { ...cookieOptions, maxAge: sessionDurationMs },
});
