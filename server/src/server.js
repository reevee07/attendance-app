const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const logger = require('./utils/logger');

connectDB().then(() => {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
});
