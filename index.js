const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

// Basic Express setup
app.use(express.json());
app.use(express.static('.'));

// Root route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>1.FC Köln Management System</title>
            <style>
                body { font-family: Arial, sans-serif; background: #dc143c; color: white; text-align: center; padding: 50px; }
                .container { background: white; color: #dc143c; padding: 40px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>1.FC Köln Management System</h1>
                <h2>Successfully Deployed!</h2>
                <p>Server running on port ${PORT}</p>
                <p>Time: ${new Date().toISOString()}</p>
                <h3>Admin Access:</h3>
                <p>Email: max.bisinger@warubi-sports.com</p>
                <p>Password: ITP2024</p>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, () => {
    console.log(`FC Köln server running on port ${PORT}`);
});