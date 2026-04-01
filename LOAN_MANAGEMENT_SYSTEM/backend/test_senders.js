const https = require('https');

function checkSenders() {
    const apiKey = process.env.BREVO_API_KEY;
    
    const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/senders',
        method: 'GET',
        headers: {
            'api-key': apiKey,
            'Accept': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            console.log('Brevo Senders Response:', res.statusCode);
            console.log(data);
        });
    });

    req.end();
}

checkSenders();
