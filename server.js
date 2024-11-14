const axios = require('axios');
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

// Fonction pour obtenir les coordonnées de Nominatim
async function getCoordinates(city) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: city,
                format: 'json',
                limit: 1
            }
        });
        if (response.data && response.data.length > 0) {
            console.log(response.data[0])
            const { lat, lon } = response.data[0];
            return { lat: parseFloat(lat), lng: parseFloat(lon) };
        } else {
            throw new Error('Ville non trouvée.');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des coordonnées :', error);
        return null; // Retourner null si les coordonnées ne peuvent pas être récupérées
    }
}

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


// Route pour traiter les demandes de formation
app.post('/send-mail-training-request', async (req, res) => {
    let [city, postalCode, country, trainingAddress, referentName, email, phoneNumber, companyName, companySiret, chosenTraining, personNumber, workTrained, trainingDate, moreInformation] = Object.values(req.body);

    if (!city || !postalCode || !country || !trainingAddress || !referentName || !email || !phoneNumber || !companyName || !companySiret || !chosenTraining || !personNumber || !workTrained || !trainingDate) {
        return res.status(400).json({ error: 'Certaines valeurs nécessaires sont manquantes.' });
    }

    if (!moreInformation || moreInformation == '') {
        moreInformation = 'Aucune';
    }

    // Essayer de récupérer les coordonnées pour le lien d'itinéraire
    let viaMichelinUrl;
    const coordinates = await getCoordinates(city);
    console.log(coordinates)

    if (coordinates) {
        const { lat, lng } = coordinates;
        viaMichelinUrl = `https://www.viamichelin.fr/itineraires/resultats?car=29074~Clio+V+-+Essence~true~false~GASOLINE&currency=eur&distanceSystem=METRIC&energyPrice=1.9009&from=Annezay&itinerary=%7B%22t%22%3A2%2C%22l%22%3A%22Annezay%22%2C%22c%22%3A%7B%22lng%22%3A-0.714026%2C%22lat%22%3A46.009306%7D%7D~%7B%22t%22%3A2%2C%22l%22%3A%22${encodeURIComponent(
            city
        )}%22%2C%22c%22%3A%7B%22lng%22%3A${lng}%2C%22lat%22%3A${lat}%7D%2C%22isArrival%22%3Atrue%7D&selectedRoute=0&showPolandModal=false&to=${encodeURIComponent(
            city
        )}&traffic=CLOSINGS&travelMode=CAR&tripConstraint=NONE&withCaravan=false&zoiSettings=false~20`;
    } else {
        viaMichelinUrl = "https://www.viamichelin.fr/itineraires/";
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
        Lien de l'itinéraire : ${viaMichelinUrl}\n
        Nom du référent : ${referentName}
        Email : ${email}
        Téléphone : ${phoneNumber}
        Entreprise : ${companyName}
        SIRET : ${companySiret}\n
        Formation choisie : ${chosenTraining}
        Nombre de personnes : ${personNumber}
        Métier formé : ${workTrained}
        Date souhaitée de la formation : ${trainingDate}
        Informations complémentaires : ${moreInformation}\n
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

if (process.env.NODE_ENV !== 'dev') {
    var distDir = __dirname + "/dist/";
    app.use(express.static(distDir));

    app.get('*', (req, res) => {
        res.sendFile(__dirname + '/dist/index.html');
    });
}
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
