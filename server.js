require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const optionsCors = {
  maxHttpBufferSize: 1e9,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}

if (process.env.NODE_ENV === 'dev') {
  optionsCors.cors = {
    origin: 'http://localhost:4200/',
    methods: ["GET", "POST"]
  }
} else if (process.env.NODE_ENV === 'prd') {
  optionsCors.cors = {
    origin: 'http://localhost:4200/',
    methods: ["GET", "POST"]
  }
}

const app = express();
app.use(express.json());
app.use(cors(optionsCors));

// Configurer le transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/send-mail', async (req, res) => {
  // On extrait les valeurs en fonction de l'ordre attendu
  const [name, email, phoneNumber, message] = Object.values(req.body);

  // Vérification que les valeurs nécessaires sont présentes
  if (!name || !email || !phoneNumber || !message) {
    return res.status(400).json({ error: 'Certaines valeurs nécessaires sont manquantes.' });
  }

  // Fonction pour préparer les options d'envoi d'email
  const prepareMailOptions = (from, to, subject, text) => ({
    from,
    to,
    subject,
    text,
  });

  // Préparer les emails
  const mailOptionsSSF = prepareMailOptions(
    email,
    'safesecformation@gmail.com',
    `Nouveau message de ${name}`,
    `Nom : ${name}\nEmail : ${email}\nNuméro de tél : ${phoneNumber}\n\nMessage : ${message}`
  );

  const mailOptionsConfirmation = prepareMailOptions(
    'safesecformation@gmail.com',
    email,
    `SAFESEC Formation - Réception de votre message`,
    `Bonjour !\n\nNous avons bien reçu votre message. Nous allons l'examiner et nous y répondrons dans les plus brefs délais.\nEn attendant, vous pouvez visiter le site internet ou mon Linkedin. Merci pour votre confiance !\n\nChristophe ERIBON via SAFESEC Formation`
  );

  try {
    // Envoyer le premier email
    const infoSSF = await transporter.sendMail(mailOptionsSSF);

    // Si le premier email est envoyé avec succès, envoyer le deuxième email
    const infoConfirmation = await transporter.sendMail(mailOptionsConfirmation);

    res.status(200).json({
      message: 'Emails envoyés avec succès !',
      infoSSF: infoSSF,
      infoConfirmation: infoConfirmation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/send-mail-training-request', async (req, res) => {
  let [city, postalCode, country, trainingAddress, referentName, email, phoneNumber, companyName, chosenTraining, personNumber, workTrained, trainingDate, moreInformation] = Object.values(req.body);

  // On vérifie que les valeurs nécessaires sont bien présentes
  if (!city || !postalCode || !country || !trainingAddress || !referentName || !email || !phoneNumber || !companyName || !chosenTraining || !personNumber || !workTrained || !trainingDate) {
    return res.status(400).json({ error: 'Certaines valeurs nécessaires sont manquantes.' });
  }

  // On met une valeur pour les Informations complémentaires si l'utilisateur n'a rien mis
  if (!moreInformation || moreInformation == '') {
    moreInformation = 'Aucune';
  }

  // Préparer les emails
  const mailOptionsSSF = {
    from: email,
    to: 'safesecformation@gmail.com',
    subject: `Nouvelle demande de formation de ${referentName}`,
    text: `
      Ville : ${city}
      Code postal : ${postalCode}
      Pays : ${country}
      Adresse de la formation : ${trainingAddress}
      Nom du référent : ${referentName}
      Email : ${email}
      Téléphone : ${phoneNumber}
      Entreprise : ${companyName}
      Formation choisie : ${chosenTraining}
      Nombre de personnes : ${personNumber}
      Métier formé : ${workTrained}
      Date souhaitée de la formation : ${trainingDate}
      Informations complémentaires : ${moreInformation}
    `
  };

  const mailOptionsConfirmation = {
    from: 'safesecformation@gmail.com',
    to: email,
    subject: `SAFESEC Formation - Votre demande de formation`,
    text: `Bonjour ${referentName} !\n\nNous avons bien reçu votre demande pour la formation "${chosenTraining}". Nous allons examiner votre demande et vous répondrons dans les plus brefs délais.\n\nMerci pour votre confiance ! \n\nChristophe ERIBON via SAFESEC Formation`
  };

  try {
    // Envoyer le premier email
    const infoSSF = await transporter.sendMail(mailOptionsSSF);

    // Si le premier email est envoyé avec succès, envoyer le deuxième email
    const infoConfirmation = await transporter.sendMail(mailOptionsConfirmation);

    res.status(200).json({
      message: 'Emails envoyés avec succès !',
      infoSSF: infoSSF,
      infoConfirmation: infoConfirmation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
