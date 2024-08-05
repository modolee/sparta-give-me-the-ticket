export const SERVER = {
  PORT: process.env.SERVER_PORT,
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DATABASE: process.env.DB_NAME,
};

export const REDIS = {
  PORT: process.env.REDIS_HOST,
  HOST: process.env.REDIS_PORT,
  USER: process.env.REDIS_USERNAME,
  PASSWORD: process.env.REDIS_PASSWORD,
  DATABASE: process.env.REDIS_DBNAME,
};
