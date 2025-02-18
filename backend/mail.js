const nodemailer = require('nodemailer');

const createTransporter = (senderEmail, senderPassword) => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: senderPassword,
        },
    });
};

const sendMail = async (senderEmail, senderPassword, recipients, subject, text) => {
    
    const transporter = createTransporter(senderEmail, senderPassword);

    const mailOptions = {
        from: senderEmail,
        to: recipients,  
        subject: subject,
        text: text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

module.exports = sendMail;