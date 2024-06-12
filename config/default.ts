import "dotenv/config";

const port = process.env.PORT;
const dbUri = process.env.DB_URI;
const saltWorkFactor = process.env.SALT_WORK_FACTOR;
const senderEmail = process.env.SENDER_EMAIL;
const senderPassword = process.env.SENDER_PASSWORD;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const domain = process.env.DOMAIN;
const frontDomain = process.env.FRONT_DOMAIN;
const googleCLientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const googleCLientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const googleOAuthRedirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URL;
const paymentApiKey = process.env.PAYMENT_API_KEY;
export default {
  port,
  dbUri,
  saltWorkFactor,
  senderEmail,
  senderPassword,
  accessTokenSecret,
  refreshTokenSecret,
  domain,
  googleOAuthRedirectUrl,
  googleCLientId,
  googleCLientSecret,
  frontDomain,
  paymentApiKey,
};
