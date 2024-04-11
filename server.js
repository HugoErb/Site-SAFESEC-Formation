const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Configurer le transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.votreserveurmail.com', // Remplacez par votre serveur SMTP
  port: 587, // Port SMTP standard
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: 'votre@adressemail.com', // Votre adresse mail
    pass: 'votremotdepasse' // Votre mot de passe mail
  }
});

app.post('/sendmail', [
  body('email').isEmail(),
  body('name').trim().escape(),
  body('message').trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  // Préparer l'email
  const mailOptions = {
    from: 'aim-display@gmail.com',
    to: 'aim-display@gmail.com',
    subject: 'Nouveau Message de SAFESEC Formation',
    text: `Nom: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Envoyer l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Email envoyé avec succès !', info: info });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
