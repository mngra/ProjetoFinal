const Mailjet = require("node-mailjet");

function getClient() {
  const apiKey = process.env.MJ_APIKEY_PUBLIC;
  const apiSecret = process.env.MJ_APIKEY_PRIVATE;
  if (!apiKey || !apiSecret) throw new Error("Mailjet API keys em falta no .env");

  return new Mailjet({ apiKey, apiSecret });
}

async function sendEmail({ toEmail, toName, subject, html, text }) {
  const mailjet = getClient();

  const fromEmail = process.env.MJ_SENDER_EMAIL;
  const fromName = process.env.MJ_SENDER_NAME || "Sistema";
  if (!fromEmail) throw new Error("MJ_SENDER_EMAIL em falta no .env");

  const payload = {
    Messages: [
      {
        From: { Email: fromEmail, Name: fromName },
        To: [{ Email: toEmail, Name: toName || toEmail }],
        Subject: subject,
        TextPart: text || undefined,
        HTMLPart: html || undefined,
      },
    ],
  };

  // Send API v3.1
  const result = await mailjet.post("send", { version: "v3.1" }).request(payload);
  return result.body;
}

module.exports = { sendEmail };
