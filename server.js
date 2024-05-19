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
    user: 'safesecformation@gmail.com',
    pass: 'mxhz eqwn iutm vcqz'
  }
});

app.post('/sendmail', async (req, res) => {
  // Extraire les valeurs en fonction de l'ordre attendu
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
    `Bonjour !\n\nNous avons bien reçu votre message. Nous allons l'examiner et nous y répondrons dans les plus brefs délais.\nEn attendant, vous pouvez visiter notre site internet ou mon Linkedin. Merci pour votre confiance !\n\nSAFESEC Formation`
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


app.post('/sendmail-training', async (req, res) => {
  const data = req.body;

  // Fonction pour obtenir la valeur d'une clé dans un tableau d'objets
  const getValueByKey = (key, array) => {
    const item = array.find(obj => Object.keys(obj)[0] === key);
    return item ? item[key] : null;
  };

  // Extraire les valeurs nécessaires
  const ville = getValueByKey('Ville', data);
  const codePostal = getValueByKey('Code postal', data);
  const pays = getValueByKey('Pays', data);
  const adresseFormation = getValueByKey('Adresse de la formation', data);
  const nom = getValueByKey('Nom', data);
  const email = getValueByKey('Email', data);
  const telephone = getValueByKey('Téléphone', data);
  const entreprise = getValueByKey('Entreprise', data);
  const formationChoisie = getValueByKey('Formation choisie', data);
  const nombrePersonnes = getValueByKey('Nombre de personnes', data);
  const metierForme = getValueByKey('Métier formé', data);
  const datesSouhaitees = getValueByKey('Date(s) souhaitée(s) de la formation', data);
  const informationsComplementaires = getValueByKey('Informations complémentaires', data);

  // Vérification que les valeurs nécessaires sont présentes
  if (!ville || !codePostal || !pays || !adresseFormation || !nom || !email || !telephone || !entreprise || !formationChoisie || !nombrePersonnes || !metierForme || !datesSouhaitees) {
    return res.status(400).json({ error: 'Certaines valeurs nécessaires sont manquantes.' });
  }

  // Préparer les emails
  const mailOptionsSSF = {
    from: email,
    to: 'safesecformation@gmail.com',
    subject: `Nouvelle demande de formation de ${nom}`,
    text: `
      Ville : ${ville}
      Code postal : ${codePostal}
      Pays : ${pays}
      Adresse de la formation : ${adresseFormation}
      Nom : ${nom}
      Email : ${email}
      Téléphone : ${telephone}
      Entreprise : ${entreprise}
      Formation choisie : ${formationChoisie}
      Nombre de personnes : ${nombrePersonnes}
      Métier formé : ${metierForme}
      Date(s) souhaitée(s) de la formation : ${datesSouhaitees}
      Informations complémentaires : ${informationsComplementaires}
    `
  };

  const mailOptionsConfirmation = {
    from: 'safesecformation@gmail.com',
    to: email,
    subject: `SAFESEC Formation - Confirmation de votre demande de formation`,
    text: `Bonjour ${nom} !\n\nNous avons bien reçu votre demande de formation "${formationChoisie}". Nous allons examiner votre demande et vous répondrons dans les plus brefs délais.\n\nMerci pour votre confiance ! \n\nSAFESEC Formation`
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
