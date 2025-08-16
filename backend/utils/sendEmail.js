import  nodemailer from 'nodemailer';

async function sendEmail(to, subject, EmailHtml) {

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
         tls: {
            rejectUnauthorized: true, // This is important for self-signed certificates
        }
    });

    const mailOptions = {
        from: `"URL Shortener" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: EmailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default sendEmail;
