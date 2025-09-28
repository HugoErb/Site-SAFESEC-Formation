// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config();

// Importation des modules nécessaires
const express = require('express');               // Framework web pour gérer les requêtes HTTP
const sgMail = require('@sendgrid/mail');         // SDK SendGrid pour l'envoi d'e-mails
const cors = require('cors');                     // Middleware pour gérer les CORS
const rateLimit = require('express-rate-limit');  // Middleware pour limiter le nombre de requêtes
const axios = require('axios');

// Port d'écoute du serveur (par défaut 3000)
const PORT = process.env.PORT || 3000;

// Configuration de SendGrid avec la clé API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialisation de l'application Express
const app = express();

// Analyse du corps des requêtes au format JSON
app.use(express.json());

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
    origin: process.env.NODE_ENV === 'dev'
        ? 'http://localhost:4200'           // en développement
        : 'https://safesec-formation.fr/',  // en production
    methods: ['POST'],                      // n'autoriser que la méthode POST
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Helper pour envoyer deux emails (admin et confirmation)
async function sendEmails(msgToAdmin, msgToUser, res) {
  try {
    await sgMail.send([msgToAdmin, msgToUser]);
    return res.status(200).json({ message: 'Emails envoyés avec succès.' });
  } catch (error) {
    console.error('Erreur envoi email :', error);
    return res.status(500).json({ error: error.message });
  }
}

// Route 1 : formulaire de contact
app.post('/send-mail', async (req, res) => {
    // Récupération des données envoyées depuis le formulaire
    const [name, email, phoneNumber, message] = Object.values(req.body);

    // Vérification de la présence de tous les champs requis
    if (!name || !email || !phoneNumber || !message) {
        return res.status(400).json({ error: 'Champs nécessaires manquants.' });
    }

    // Préparation du message à envoyer à l'administrateur
    const msgToMe = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.SENDER_EMAIL,
        replyTo: email, // l'utilisateur pourra répondre directement
        subject: `Nouveau message de ${name}`,
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
    const [
        city, postalCode, country, trainingAddress,
        referentName, email, phoneNumber,
        companyName, companySiret, chosenTraining,
        personNumber, workTrained, trainingDate,
        moreInformation
    ] = Object.values(req.body);

    if (!city || !postalCode || !country || !trainingAddress || !referentName || !email || !phoneNumber || !companyName || !companySiret || !chosenTraining || !personNumber || !workTrained || !trainingDate) {
        return res.status(400).json({ error: 'Champs nécessaires manquants.' });
    }
    if (!moreInformation) moreInformation = 'Aucune';

    const msgToMe = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.SENDER_EMAIL,
        subject: `Nouvelle demande de formation de ${referentName}`,
        html: `
        Nouvelle demande de formation de ${referentName} pour ${companyName}.<br><br>

        Ville : ${city}<br>
        Code postal : ${postalCode}<br>
        Pays : ${country}<br>
        Adresse de la formation : ${trainingAddress}<br>
        <a href="https://www.viamichelin.fr/itineraires/" target="_blank">Voir l'itinéraire et le coût du trajet</a><br><br>

        Nom du référent : ${referentName}<br>
        Email : ${email}<br>
        Téléphone : ${phoneNumber}<br>
        Entreprise : ${companyName}<br>
        SIRET : ${companySiret}<br><br>

        Formation choisie : ${chosenTraining}<br>
        Nombre de personnes : ${personNumber}<br>
        Métier formé : ${workTrained}<br>
        Date souhaitée de la formation : ${trainingDate}<br>
        Informations complémentaires : ${moreInformation}<br><br>

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
  const distDir = __dirname + '/dist/';
  app.use(express.static(distDir));
  app.get('*', (req, res) => res.sendFile(distDir + 'index.html'));
}

// Démarrage du serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
