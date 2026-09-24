const nodeEnv = process.env.NODE_ENV || 'development';

const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => {
    if (nodeEnv !== 'production') console.log('[DEBUG]', ...args);
  },
};

module.exports = logger;
