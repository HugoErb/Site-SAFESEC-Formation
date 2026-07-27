// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config();

// Importation des modules nécessaires
const express = require('express');               // Framework web pour gérer les requêtes HTTP
const sgMail = require('@sendgrid/mail');         // SDK SendGrid pour l'envoi d'e-mails
const cors = require('cors');                     // Middleware pour gérer les CORS
const rateLimit = require('express-rate-limit');  // Middleware pour limiter le nombre de requêtes
const fs = require('fs');
const path = require('path');

// Port d'écoute du serveur (par défaut 3000)
const PORT = process.env.PORT || 3000;

// Configuration de SendGrid avec la clé API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialisation de l'application Express
const app = express();

// Analyse du corps des requêtes au format JSON avec une limite adaptée aux formulaires.
app.use(express.json({ limit: '32kb' }));

// Limitation du nombre de requêtes sur l'endpoint /send-mail et /send-mail-training-request pour prévenir les abus
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // fenêtre de 24 heures
    max: 5,                       // maximum 5 requêtes par fenêtre par adresse IP
    message: "Trop de requêtes depuis cette IP, veuillez réessayer demain." // réponse en cas de dépassement
});
app.use('/send-mail', limiter);
app.use('/send-mail-training-request', limiter);

// Configuration CORS : n'accepte que les requêtes POST depuis votre frontend
const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN || (process.env.NODE_ENV === 'dev'
        ? 'http://localhost:4200'           // en développement
        : 'https://safesec-formation.fr'),  // en production
    methods: ['POST'],                      // n'autoriser que la méthode POST
    credentials: true,
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidEmail = (value) => (
  isNonEmptyString(value)
  && value.length <= 254
  && !/[\r\n]/.test(value)
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

// Helper pour envoyer deux emails (admin et confirmation)
async function sendEmails(msgToAdmin, msgToUser, res) {
  try {
    await sgMail.send([msgToAdmin, msgToUser]);
    return res.status(200).json({ message: 'Emails envoyés avec succès.' });
  } catch (error) {
    console.error('Erreur envoi email :', error);
    return res.status(500).json({ error: 'Impossible d’envoyer les emails.' });
  }
}

// Route 1 : formulaire de contact
app.post('/send-mail', async (req, res) => {
    const {
        nometprenom: name,
        email,
        telephone: phoneNumber,
        message
    } = req.body ?? {};

    // Vérification de la présence de tous les champs requis
    if (![name, phoneNumber, message].every(isNonEmptyString) || !isValidEmail(email)) {
        return res.status(400).json({ error: 'Champs nécessaires manquants.' });
    }

    // Préparation du message à envoyer à l'administrateur
    const msgToMe = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.SENDER_EMAIL,
        replyTo: email, // l'utilisateur pourra répondre directement
        subject: `Nouveau message de ${name.replace(/[\r\n]/g, ' ')}`,
        text: `Nouveau message de ${name} :\n\nNom : ${name}\nEmail : ${email}\nNuméro de tél : ${phoneNumber}\n\nMessage : ${message}\n\nCet e-mail a été envoyé automatiquement, merci de ne pas y répondre.`
    };

    const msgToUser = {
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: `SAFESEC Formation - Réception de votre message`,
        text: `Bonjour !\n\nNous avons bien reçu votre message. Nous allons l'examiner et nous y répondrons dans les plus brefs délais.\nEn attendant, vous pouvez visiter le site internet ou mon Linkedin. Merci pour votre confiance !\n\nChristophe ERIBON via SAFESEC Formation\n\nCet e-mail a été envoyé automatiquement, merci de ne pas y répondre.`
    };

    await sendEmails(msgToMe, msgToUser, res);
});

// Route 2 : demande de formation
app.post('/send-mail-training-request', async (req, res) => {
    const {
        ville: city,
        codepostal: postalCode,
        pays: country,
        adressedelaformation: trainingAddress,
        nom: referentName,
        email,
        telephone: phoneNumber,
        entreprise: companyName,
        numerosiret: companySiret,
        formationchoisie: chosenTraining,
        nombredepersonnes: personNumber,
        metierforme: workTrained,
        datesouhaiteedelaformation: trainingDate,
        informationscomplementaires
    } = req.body ?? {};

    const requiredFields = [
        city, postalCode, country, trainingAddress, referentName, phoneNumber,
        companyName, companySiret, chosenTraining, personNumber, workTrained, trainingDate
    ];
    if (!requiredFields.every(isNonEmptyString) || !isValidEmail(email)) {
        return res.status(400).json({ error: 'Champs nécessaires manquants.' });
    }

    const moreInformation = isNonEmptyString(informationscomplementaires)
        ? informationscomplementaires
        : 'Aucune';
    const safe = {
        city: escapeHtml(city),
        postalCode: escapeHtml(postalCode),
        country: escapeHtml(country),
        trainingAddress: escapeHtml(trainingAddress),
        referentName: escapeHtml(referentName),
        email: escapeHtml(email),
        phoneNumber: escapeHtml(phoneNumber),
        companyName: escapeHtml(companyName),
        companySiret: escapeHtml(companySiret),
        chosenTraining: escapeHtml(chosenTraining),
        personNumber: escapeHtml(personNumber),
        workTrained: escapeHtml(workTrained),
        trainingDate: escapeHtml(trainingDate),
        moreInformation: escapeHtml(moreInformation)
    };

    const msgToMe = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.SENDER_EMAIL,
        subject: `Nouvelle demande de formation de ${referentName.replace(/[\r\n]/g, ' ')}`,
        html: `
        Nouvelle demande de formation de ${safe.referentName} pour ${safe.companyName}.<br><br>

        Ville : ${safe.city}<br>
        Code postal : ${safe.postalCode}<br>
        Pays : ${safe.country}<br>
        Adresse de la formation : ${safe.trainingAddress}<br>
        <a href="https://www.viamichelin.fr/itineraires/" target="_blank">Voir l'itinéraire et le coût du trajet</a><br><br>

        Nom du référent : ${safe.referentName}<br>
        Email : ${safe.email}<br>
        Téléphone : ${safe.phoneNumber}<br>
        Entreprise : ${safe.companyName}<br>
        SIRET : ${safe.companySiret}<br><br>

        Formation choisie : ${safe.chosenTraining}<br>
        Nombre de personnes : ${safe.personNumber}<br>
        Métier formé : ${safe.workTrained}<br>
        Date souhaitée de la formation : ${safe.trainingDate}<br>
        Informations complémentaires : ${safe.moreInformation}<br><br>

        Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.
        `
    };

    const msgToUser = {
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: `SAFESEC Formation - Votre demande de formation`,
        text: `Bonjour ${referentName} !\n\nNous avons bien reçu votre demande pour la formation "${chosenTraining}". Nous allons examiner votre demande et vous répondrons dans les plus brefs délais.\n\nMerci pour votre confiance ! \n\nChristophe ERIBON via SAFESEC Formation\n\nCet e-mail a été envoyé automatiquement, merci de ne pas y répondre.`
    };

    await sendEmails(msgToMe, msgToUser, res);
});

// Service des fichiers statiques en production
if (process.env.NODE_ENV !== 'dev') {
  const legacyDistDir = path.join(__dirname, 'dist');
  const prerenderDistDir = path.join(legacyDistDir, 'browser');
  const prerenderedRoutes = new Set(['home', 'training-form', 'legal-information']);
  // Accepte le nouveau build pré-rendu ainsi que l'ancienne arborescence.
  const distDir = fs.existsSync(path.join(prerenderDistDir, 'index.html'))
    ? prerenderDistDir
    : legacyDistDir;
  app.use(express.static(distDir, {
    maxAge: '1y',
    immutable: true,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('robots.txt') || filePath.endsWith('sitemap.xml')) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }
  }));
  app.get('*', (req, res) => {
    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    const fallbackPage = path.join(distDir, 'index.html');

    if (req.path.length > 1 && req.path.endsWith('/')) {
      return res.redirect(301, `${req.path.slice(0, -1)}${req.url.includes('?') ? `?${req.url.split('?')[1]}` : ''}`);
    }

    if (prerenderedRoutes.has(cleanPath)) {
      const prerenderedPage = path.join(distDir, cleanPath, 'index.html');
      if (fs.existsSync(prerenderedPage)) {
        return res.sendFile(prerenderedPage);
      }
      // Build Angular classique : toutes les routes utilisent l'index principal.
      return res.sendFile(fallbackPage);
    }

    return res.status(cleanPath ? 404 : 200).sendFile(fallbackPage);
  });
}

// Démarrage du serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
