const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { clientUrl } = require('./config/env');
const { errorMiddleware, notFound } = require('./middlewares/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const officeRoutes = require('./modules/office/office.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');

const app = express();

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
