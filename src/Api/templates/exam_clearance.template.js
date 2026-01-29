export default ({ firstName, academicYear, term }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #F1F5F9; padding: 40px;">
    <div style="background: white; max-width: 550px; margin: auto; border-radius: 12px; overflow: hidden; border-top: 5px solid #10B981;">
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
            <h1 style="color: #064E3B;">Exam Clearance Approved</h1>
            <p style="color: #374151; font-size: 16px;">
                Hi ${firstName},<br>
                We are pleased to inform you that you have been cleared for the <strong>${term} Term</strong> examinations for the <strong>${academicYear}</strong> session.
            </p>
            <div style="margin: 30px 0; padding: 20px; background: #ECFDF5; border-radius: 8px; color: #065F46; font-weight: bold;">
                Your CBT Portal is now unlocked.
            </div>
            <p style="color: #6B7280; font-size: 13px;">Please ensure your device is charged and you have a stable internet connection before starting any paper.</p>
        </div>
    </div>
</body>
</html>
`;
