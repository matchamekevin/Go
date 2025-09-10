const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Test du service email...');
  
  try {
    // Configuration du transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '2003gnati24@gmail.com',
        pass: 'zxse tqtn lpyg qifw'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('📧 Configuration transporteur créée...');

    // Test de la connexion
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!');

    // Envoi d'un email de test
    const testEmail = {
      from: '"GoSOTRAL" <2003gnati24@gmail.com>',
      to: '2003gnati24@gmail.com', // Envoi à nous-mêmes pour test
      subject: 'Test OTP - GoSOTRAL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Votre code de vérification</h2>
          <p>Votre code OTP est :</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            123456
          </div>
          <p style="color: #6B7280; font-size: 14px;">Ce code expire dans 10 minutes.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('🎉 Email de test envoyé avec succès!');
    console.log('Message ID:', result.messageId);
    console.log('📩 Vérifiez votre boîte email: 2003gnati24@gmail.com');

  } catch (error) {
    console.error('❌ Erreur lors du test email:', error.message);
    if (error.code) {
      console.error('Code d\'erreur:', error.code);
    }
    if (error.response) {
      console.error('Réponse serveur:', error.response);
    }
  }
}

testEmail();
