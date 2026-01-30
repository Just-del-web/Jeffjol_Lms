export default ({ firstName, amount, term, session }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #F8FAFC; padding: 40px;">
    <div style="background: white; max-width: 550px; margin: auto; border-radius: 12px; overflow: hidden; border-top: 5px solid #1E40AF;">
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">💳</div>
            <h1 style="color: #1E3A8A;">Payment Received</h1>
            <p style="color: #374151; font-size: 16px;">
                Hello,<br>
                This is to confirm that we have successfully verified a payment of <strong>₦${amount}</strong> for <strong>${firstName}</strong>.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #EFF6FF; border-radius: 8px; text-align: left;">
                <p style="margin: 5px 0; color: #1E40AF;"><strong>Session:</strong> ${session}</p>
                <p style="margin: 5px 0; color: #1E40AF;"><strong>Term:</strong> ${term} Term</p>
                <p style="margin: 5px 0; color: #1E40AF;"><strong>Status:</strong> Verified & Confirmed</p>
            </div>

            <p style="color: #374151; font-size: 15px;">
                Your official electronic receipt has been attached to this email as a PDF. Please keep it for your records.
            </p>

            <div style="border-top: 1px solid #E2E8F0; margin-top: 30px; padding-top: 20px;">
                <p style="color: #6B7280; font-size: 12px;">
                    Thank you for choosing Jeffjol High School. For bursary inquiries, please reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;