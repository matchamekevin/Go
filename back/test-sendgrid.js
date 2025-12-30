const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configure SendGrid with API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Log config (sans la clé complète pour la sécurité)
console.log('Configuration SendGrid:');
console.log('API Key (first 10 chars):', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...');
console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);

// Create email message
const msg = {
  to: 'hafizinovus@gmail.com',
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Test SendGrid - GoSOTRAL',
  text: 'Si vous recevez cet email, la configuration SendGrid fonctionne correctement !',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #4F46E5; text-align: center;">Test SendGrid</h1>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.5;">
          Bonjour,<br><br>
          Si vous recevez cet email, cela signifie que :<br>
          ✅ La configuration SendGrid est correcte<br>
          ✅ L'expéditeur est bien vérifié<br>
          ✅ Les permissions API sont bonnes<br>
        </p>
        <div style="text-align: center; margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 8px; color: white;">
          Test réussi ! 🎉
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px;">
        Envoyé depuis le système GoSOTRAL
      </div>
    </div>
  `
};

// Send email
console.log('\n📧 Envoi du mail test...');

sgMail.send(msg)
  .then(() => {
    console.log('✅ Email envoyé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'envoi :', error.response ? error.response.body : error);
    process.exit(1);
  });
