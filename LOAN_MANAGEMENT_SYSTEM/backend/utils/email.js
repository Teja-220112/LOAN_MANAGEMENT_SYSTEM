const https = require('https');

const sendEmail = (toEmail, toName, subject, htmlContent) => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.BREVO_API_KEY;
        const payload = JSON.stringify({
            sender: {
                name: "LoanSphere System",
                email: "tejakapala@gmail.com"
            },
            to: [
                {
                    email: toEmail,
                    name: toName || "User"
                }
            ],
            subject: subject,
            htmlContent: htmlContent
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(true);
                } else {
                    console.error('Email send error:', res.statusCode, data);
                    resolve(false); // resolve false instead of reject to prevent crashing
                }
            });
        });

        req.on('error', (e) => {
            console.error('Email request error:', e);
            resolve(false);
        });

        req.write(payload);
        req.end();
    });
};

module.exports = { sendEmail };
