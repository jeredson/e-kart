// OPTION: Hardcode email addresses in the function
// Replace the recipients section in your send-order-email/index.ts

// OLD CODE (line ~35):
const recipients = [ADMIN_EMAIL];
if (ADDITIONAL_EMAILS) {
  ADDITIONAL_EMAILS.split(',').forEach(email => {
    const trimmed = email.trim();
    if (trimmed) recipients.push(trimmed);
  });
}

// NEW CODE (replace with your desired emails):
const recipients = [
  'your-new-email@example.com',
  'another-email@example.com'  // Add more emails as needed
];

// Or keep environment variables but add fallback:
const recipients = [
  ADMIN_EMAIL || 'your-fallback-email@example.com'
];
if (ADDITIONAL_EMAILS) {
  ADDITIONAL_EMAILS.split(',').forEach(email => {
    const trimmed = email.trim();
    if (trimmed) recipients.push(trimmed);
  });
}