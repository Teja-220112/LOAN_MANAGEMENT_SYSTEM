const { sendEmail } = require('./utils/email.js');

async function testEmail() {
    console.log('Testing Brevo API Integration...');
    try {
        const success = await sendEmail(
            'test_loansphere@mailinator.com', 
            'Test User', 
            'LoanSphere Test Email', 
            '<p>This is a test email from LoanSphere!</p>'
        );
        console.log('Email send success:', success);
    } catch (e) {
        console.error('Email send failed:', e);
    }
}

testEmail();
