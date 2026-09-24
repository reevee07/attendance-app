const SibApiV3Sdk = require('sib-api-v3-sdk');
const { brevoApiKey, brevoSenderEmail, brevoSenderName } = require('../config/env');
const logger = require('./logger');

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = brevoApiKey;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a transactional email via Brevo.
 * Fails silently (logs only) so email issues never block attendance flows.
 */
async function sendEmail({ to, subject, htmlContent }) {
  try {
    await emailApi.sendTransacEmail({
      sender: { email: brevoSenderEmail, name: brevoSenderName },
      to: [{ email: to }],
      subject,
      htmlContent,
    });
  } catch (err) {
    logger.error('Brevo email failed:', err.message);
  }
}

module.exports = { sendEmail };
