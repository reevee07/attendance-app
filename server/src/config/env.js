require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'production',
  clientUrl: process.env.CLIENT_URL || 'https://attendance-app-9jty-reevee07s-projects.vercel.app',

  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseBucket: process.env.SUPABASE_BUCKET || 'attendance-photos',

  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL,
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'Attendance App',
};
