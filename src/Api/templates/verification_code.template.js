

export default ({ firstName, code, socialLinks = {} }) => {
  const currentYear = new Date().getFullYear();
  const mivaBlue = '#0046FF'; 
  const softGray = '#64748B';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: #F1F5F9; color: #1E293B; margin: 0; padding: 40px 10px; }
        .container { background-color: #ffffff; margin: 0 auto; max-width: 580px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background-color: ${mivaBlue}; padding: 32px; text-align: center; }
        .content { padding: 48px; text-align: center; }
        .code-display { background-color: #F8FAFC; border: 2px dashed #E2E8F0; padding: 24px; border-radius: 8px; margin: 32px 0; }
        .code-text { font-size: 36px; font-weight: 800; color: ${mivaBlue}; letter-spacing: 8px; font-family: monospace; }
        .footer { padding: 32px; background-color: #F8FAFC; text-align: center; font-size: 12px; color: ${softGray}; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #fff; margin: 0; font-size: 20px;">Jeffjol High School</h2>
        </div>
        <div class="content">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify your email</h1>
            <p style="color: ${softGray}; line-height: 1.6;">
                Hello ${firstName},<br>
                Welcome to our digital campus. Use the security code below to complete your registration on the LMS portal.
            </p>
            <div class="code-display">
                <span class="code-text">${code}</span>
            </div>
            <p style="font-size: 13px; color: #94A3B8;">
                This code is valid for 1 hour. If you didn't request this, please contact the school ICT department.
            </p>
        </div>
        <div class="footer">
            &copy; ${currentYear} Jeffjol High School LMS. Port Harcourt, Nigeria.<br>
            <em>Empowering Excellence through Technology.</em>
        </div>
    </div>
</body>
</html>
`;
};