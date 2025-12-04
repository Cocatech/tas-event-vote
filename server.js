const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 3000;
// Use Docker service name when running in container, localhost when local
const PHP_SERVER = process.env.API_URL || 'http://localhost:8000';
const PHP_HOST = process.env.API_HOST || 'localhost';
const PHP_PORT = process.env.API_PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============= STATIC ROUTES =============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/vote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vote.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// ============= API PROXY =============
app.all('/api/*', async (req, res) => {
    const apiPath = req.path;
    const fullUrl = PHP_SERVER + apiPath + (req.url.includes('?') ? req.url.split('api')[1] : '');
    
    const options = {
        hostname: PHP_HOST,
        port: PHP_PORT,
        path: apiPath + (req.url.includes('?') ? req.url.split('api')[1] : ''),
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            ...req.headers
        }
    };

    try {
        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error('API Proxy Error:', error);
            res.status(500).json({
                success: false,
                message: 'API Server Error',
                error: error.message
            });
        });

        if (req.body && Object.keys(req.body).length > 0) {
            proxyReq.write(JSON.stringify(req.body));
        }
        
        proxyReq.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// ============= ERROR HANDLING =============
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message
    });
});

// ============= START SERVER =============
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           TAS EVENT VOTE SYSTEM STARTED                    ║
╚════════════════════════════════════════════════════════════╝

📱 Frontend Server: http://localhost:${PORT}
📊 Admin Dashboard: http://localhost:${PORT}/admin
🗳️  Voting Page: http://localhost:${PORT}/vote
📈 Results Page: http://localhost:${PORT}/results

⚠️  IMPORTANT: Also start the PHP API server in another terminal:
   php -S localhost:8000 -t public/

📝 Then open: http://localhost:${PORT}
    `);
});
