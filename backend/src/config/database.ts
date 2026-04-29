import "../bootstrap";

const dbHost = process.env.DB_HOST;
const isSocket = dbHost && dbHost.startsWith("/cloudsql");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  pool: {
    max: 3,
    min: process.env.DB_MIN_CONNECTIONS || 1,
    acquire: process.env.DB_ACQUIRE || 30000,
    idle: process.env.DB_IDLE || 10000
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: process.env.DB_TIMEZONE || "-03:00",
  host: isSocket ? undefined : dbHost,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: process.env.DB_DEBUG && console.log,
  seederStorage: "sequelize",
  dialectOptions: {
    socketPath: isSocket ? dbHost : undefined,
    ssl: (!isSocket && (process.env.NODE_ENV === "production" || process.env.DB_SSL === "true")) ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};
