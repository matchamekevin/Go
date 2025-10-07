import sgMail from "@sendgrid/mail";
import { Config } from "../../enviroment/env.config";
import util from "util";

// Initialisation SendGrid
console.log("[Email Service] Vérification de la configuration SendGrid:");
console.log("API Key existe:", !!Config.sendgrid.apiKey);
console.log(
  "API Key (premiers caractères):",
  Config.sendgrid.apiKey?.substring(0, 10),
);
console.log("From Email:", Config.sendgrid.fromEmail);

if (Config.sendgrid.apiKey) {
  sgMail.setApiKey(Config.sendgrid.apiKey);
  console.log("[Email Service] SendGrid configuré avec succès");

  // Vérifie que l'email expéditeur est configuré
  if (!Config.sendgrid.fromEmail) {
    console.warn(
      "[Email Service] Email expéditeur manquant - veuillez configurer SENDGRID_FROM_EMAIL",
    );
  }
} else {
  console.warn(
    "[Email Service] Clé API SendGrid manquante - emails en mode console uniquement",
  );
}

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  console.log(`\n📧 [Email Service] Tentative d'envoi email à ${to}`);
  console.log(`📄 Sujet: ${subject}`);

  if (!Config.sendgrid.apiKey || !Config.sendgrid.fromEmail) {
    console.log(`\n🔧 [MODE CONSOLE] Email pour ${to}:`);
    console.log(`📋 Sujet: ${subject}`);
    console.log(`📝 Message: ${text}`);
    if (text.includes("code")) {
      // Extraire le code OTP du message
      const codeMatch = text.match(/\d{6}/);
      if (codeMatch) {
        console.log(`\n🎯 CODE OTP: ${codeMatch[0]}`);
        console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
        console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
      }
    }
    console.log("--- FIN EMAIL ---\n");
    return;
  }

  try {
    const msg = {
      to,
      from: Config.sendgrid.fromEmail,
      subject,
      text,
      html,
    };
    console.log("[Email Service] Tentative d'envoi avec configuration:", {
      to,
      from: Config.sendgrid.fromEmail,
      subject,
    });
    const result = await sgMail.send(msg);
    console.log(
      `✅ [Email Service] Email envoyé avec succès à ${to} (ID: ${result[0]?.statusCode || "N/A"})`,
    );
    return result;
  } catch (error) {
    console.error(
      `❌ [Email Service] Erreur envoi email à ${to}:`,
      util.inspect((error as any).response?.body || error, { depth: 5 }),
    );
    // En cas d'erreur, afficher en console pour les tests
    console.log(`\n🔧 [FALLBACK CONSOLE] Email pour ${to}:`);
    console.log(`📋 Sujet: ${subject}`);
    console.log(`📝 Message: ${text}`);
    if (text.includes("code")) {
      // Extraire le code OTP du message
      const codeMatch = text.match(/\d{6}/);
      if (codeMatch) {
        console.log(`\n🎯 CODE OTP: ${codeMatch[0]}`);
        console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
        console.log(`🎯 CODE OTP: ${codeMatch[0]}`);
      }
    }
    console.log("--- FIN EMAIL ---\n");
    // Ne pas throw l'erreur pour que l'inscription continue
    return null;
  }
};
