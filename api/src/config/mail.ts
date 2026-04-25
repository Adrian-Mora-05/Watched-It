const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const resetUrlBase = process.env.NODE_ENV === 'development'
  ? process.env.RESET_URL_DEV
  : process.env.RESET_URL_PROD;

export { sgMail, resetUrlBase }