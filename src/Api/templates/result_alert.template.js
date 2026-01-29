export default ({ firstName, subject, score, grade, teacherComment }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #F1F5F9; padding: 40px;">
    <div style="background: white; max-width: 580px; margin: auto; border-radius: 12px; overflow: hidden; border-top: 5px solid #0046FF;">
        <div style="padding: 40px;">
            <h2 style="color: #0046FF; margin-top: 0;">New Assessment Result</h2>
            <p>Hello ${firstName}, a new result has been published to your dashboard.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                <tr style="background: #F8FAFC;">
                    <td style="padding: 12px; border: 1px solid #E2E8F0; font-weight: bold;">Subject</td>
                    <td style="padding: 12px; border: 1px solid #E2E8F0;">${subject}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #E2E8F0; font-weight: bold;">Score</td>
                    <td style="padding: 12px; border: 1px solid #E2E8F0;">${score}%</td>
                </tr>
                <tr style="background: #F8FAFC;">
                    <td style="padding: 12px; border: 1px solid #E2E8F0; font-weight: bold;">Grade</td>
                    <td style="padding: 12px; border: 1px solid #E2E8F0; font-weight: bold; color: #0046FF;">${grade}</td>
                </tr>
            </table>

            <div style="font-style: italic; color: #64748B; border-left: 3px solid #CBD5E1; padding-left: 15px; margin-bottom: 30px;">
                "Teacher's Comment: ${teacherComment}"
            </div>

            <a href="${process.env.FRONTEND_URL}/dashboard/results" 
               style="display: block; text-align: center; background: #0046FF; color: white; padding: 14px; border-radius: 6px; text-decoration: none; font-weight: bold;">
               View Detailed Analysis
            </a>
        </div>
    </div>
</body>
</html>
`;