const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dataRoutes = require('./routes/data');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const sendMail = require('./mail');

const app = express();
const port = process.env.PORT || 5002;


app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect('mongodb+srv://bhuvaneshg:deepakbhuvi@cluster0.e2m47pj.mongodb.net/HigherStudies?retryWrites=true&w=majority&appName=Cluster0', {
    connectTimeoutMS:30000,
    socketTimeoutMS:45000,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));


app.use('/api/data', dataRoutes); 

app.post('/send-email', async (req, res) => {
    const { senderEmail, senderPassword, recipients, subject, text } = req.body;

    if (!senderEmail || !senderPassword || !recipients || !subject || !text) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await sendMail(senderEmail, senderPassword, recipients, subject, text);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ message: 'Failed to send email', error: err });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

