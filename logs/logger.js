// logger.js
import log4js from "log4js"

import path from 'path';
import { fileURLToPath } from "url";

// Convert import.meta.url to a file path;

//const __filename = fileURLToPath(import.meta.url);
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

log4js.configure({
  appenders: {
    everything: { type: 'file', filename: `${__dirname}/app.log` },
    emergencies: { type: 'file', filename: `${__dirname}/panic.log` },
    'just-errors': {
      type: 'logLevelFilter',
      appender: 'emergencies',
      level: 'error',
    },
  },
  categories: {
    default: { appenders: ['just-errors', 'everything'], level: 'debug' },
  },
});

const logger = log4js.getLogger();

export default logger
