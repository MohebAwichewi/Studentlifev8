const { Resend } = require('resend');

// API Key from lib/email.ts
// We use the hardcoded one to verify if it works.
const resend = new Resend('re_VMjQDLk9_7DzcovXwZs4vR35cijz2t7kq');

console.log("🚀 Starting Resend API Test Script...");
console.log("🔑 Using API Key: re_VMjQDLk9_... (from lib/email.ts)");

(async function () {
    try {
        const targetEmail = process.argv[2] || 'delivered@resend.dev';
        console.log(`📧 Sending test email to '${targetEmail}'...`);

        const { data, error } = await resend.emails.send({
            from: 'otp@student-life.uk',
            to: [targetEmail],
            subject: 'Resend Integration Test',
            html: `<strong>Resend integration is working!</strong><p>Sent to: ${targetEmail}</p>`
        });

        if (error) {
            console.error("❌ Resend API Error:");
            console.error(JSON.stringify(error, null, 2));
            process.exit(1);
        }

        console.log("✅ Use 'delivered@resend.dev' to verify success without spamming real inbox.");
        console.log("✅ Success Response:");
        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("❌ Unexpected Script Error:", err);
    }
})();
