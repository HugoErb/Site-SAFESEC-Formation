// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config();

// Importation des modules nécessaires
const express = require('express');               // Framework web pour gérer les requêtes HTTP
const sgMail = require('@sendgrid/mail');         // SDK SendGrid pour l'envoi d'e-mails
const cors = require('cors');                     // Middleware pour gérer les CORS
const rateLimit = require('express-rate-limit');  // Middleware pour limiter le nombre de requêtes
const axios = require('axios');

// Port d'écoute du serveur (par défaut 3002)
const PORT = process.env.PORT || 3002;

// Configuration de SendGrid avec la clé API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialisation de l'application Express
const app = express();

// Analyse du corps des requêtes au format JSON
app.use(express.json());

// Limitation du nombre de requêtes sur l'endpoint /send-mail pour prévenir les abus
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // fenêtre de 24 heures
    max: 5,                       // maximum 5 requêtes par fenêtre par adresse IP
    message: "Trop de requêtes depuis cette IP, veuillez réessayer demain." // réponse en cas de dépassement
});
app.use('/send-mail', limiter);

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

// Fonction pour récupérer les coordonnées d'une ville via OpenStreetMap
async function getCoordinates(city) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'SAFESEC Formation' }
    });
    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    throw new Error('Ville non trouvée.');
  } catch (err) {
    console.error('Erreur récupération coordonnées :', err);
    return null;
  }
}

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
app.post('/send-mail', limiter, async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;
  if (!name || !email || !phoneNumber || !message) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  const msgToAdmin = {
    to: RECEIVER_EMAIL,
    from: SENDGRID_SENDER,
    replyTo: email,
    subject: `Nouveau message de ${name}`,
    text: `Nom : ${name}\nEmail : ${email}\nNuméro de tél : ${phoneNumber}\n\nMessage : ${message}`
  };

  const msgToUser = {
    to: email,
    from: SENDGRID_SENDER,
    subject: `SAFESEC Formation - Réception de votre message`,
    text: `Bonjour !\n\nNous avons bien reçu votre message. Nous allons l'examiner et nous y répondrons dans les plus brefs délais.\nEn attendant, vous pouvez visiter le site internet ou mon Linkedin. Merci pour votre confiance !\n\nChristophe ERIBON via SAFESEC Formation`
  };

  await sendEmails(msgToAdmin, msgToUser, res);
});

// Route 2 : demande de formation
app.post('/send-mail-training-request', limiter, async (req, res) => {
  let {
    city, postalCode, country, trainingAddress,
    referentName, email, phoneNumber,
    companyName, companySiret, chosenTraining,
    personNumber, workTrained, trainingDate,
    moreInformation
  } = req.body;

  if (!city || !postalCode || !country || !trainingAddress || !referentName || !email || !phoneNumber || !companyName || !companySiret || !chosenTraining || !personNumber || !workTrained || !trainingDate) {
    return res.status(400).json({ error: 'Champs nécessaires manquants.' });
  }
  if (!moreInformation) moreInformation = 'Aucune';

  const coordinates = await getCoordinates(city);
  const viaMichelinUrl = coordinates
    ? `https://www.viamichelin.fr/itineraires/resultats?from=Annezay&to=${encodeURIComponent(city)}&travelMode=CAR&isArrival=true&lat=${coordinates.lat}&lng=${coordinates.lng}`
    : 'https://www.viamichelin.fr/itineraires/';

  const msgToAdmin = {
    to: RECEIVER_EMAIL,
    from: SENDGRID_SENDER,
    subject: `Nouvelle demande de formation de ${referentName}`,
    html: `
      Ville : ${city}<br>
      Code postal : ${postalCode}<br>
      Pays : ${country}<br>
      Adresse de la formation : ${trainingAddress}<br>
      <a href="${viaMichelinUrl}" target="_blank">Voir l'itinéraire et le coût du trajet</a><br><br>

      Nom du référent : ${referentName}<br>
      Email : ${email}<br>
      Téléphone : ${phoneNumber}<br>
      Entreprise : ${companyName}<br>
      SIRET : ${companySiret}<br><br>

      Formation choisie : ${chosenTraining}<br>
      Nombre de personnes : ${personNumber}<br>
      Métier formé : ${workTrained}<br>
      Date souhaitée de la formation : ${trainingDate}<br>
      Informations complémentaires : ${moreInformation}<br>
    `
  };

  const msgToUser = {
    to: email,
    from: SENDGRID_SENDER,
    subject: `SAFESEC Formation - Votre demande de formation`,
    text: `Bonjour ${referentName} !\n\nNous avons bien reçu votre demande pour la formation "${chosenTraining}". Nous allons examiner votre demande et vous répondrons dans les plus brefs délais.\n\nMerci pour votre confiance ! \n\nChristophe ERIBON via SAFESEC Formation`
  };

  await sendEmails(msgToAdmin, msgToUser, res);
});

// Service des fichiers statiques en production
if (NODE_ENV !== 'dev') {
  const distDir = __dirname + '/dist/';
  app.use(express.static(distDir));
  app.get('*', (req, res) => res.sendFile(distDir + 'index.html'));
}

// Démarrage du serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
