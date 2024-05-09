const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
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

app.post('/sendmail', (req, res) => {
  

  const { name, email, phoneNumber, message } = req.body;

  // Préparer l'email
  const mailOptions = {
    from: email,
    to: 'safesecformation@gmail.com',
    subject: `Nouveau message de ${name}`,
    text: `Nom : ${name}\nEmail : ${email}\nNuméro de tél : ${phoneNumber}\n\nMessage : ${message}`
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
