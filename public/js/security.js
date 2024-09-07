// securityMiddleware.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

module.exports = (app) => {
    // Apply Helmet for security headers
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", 'http:', 'https:', 'https://cdn.jsdelivr.net', 'https://code.jquery.com'],
                    styleSrc: ["'self'", "'unsafe-inline'", 'http:', 'https:', 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
                    imgSrc: ["'self'", 'data:', 'http:', 'https:', '*.nike.com', '*.arosport.co.il'],
                    connectSrc: ["'self'", 'http:', 'https:'],
                    frameSrc: ["'self'", 'http:', 'https:'],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: null
                    // Removed upgradeInsecureRequests to avoid forcing HTTPS
                },
            },
            crossOriginEmbedderPolicy: false,
        })
    );

    
    // Prevent NoSQL injection attacks by sanitizing input
    app.use(
        mongoSanitize({
            onSanitize: ({ req, key }) => {
                console.warn(`Sanitizing request [${req.method} ${req.path}] due to prohibited characters in ${key}`);
            },
        })
    );

    // General Rate Limiting for all routes, excluding security.html
    const generalLimiter = rateLimit({
        windowMs: 7 * 1000, // 7-second window
        max: 60, // Limit each IP to 60 requests per window
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.warn(`Rate limit exceeded by IP: ${req.ip} on route ${req.originalUrl}`);
            
            res.redirect('/html/login.html'); // Redirect to security.html on limit exceed
        },
        skip: (req) => {
            // Skip rate limiting for the security.html page
            return req.path === '/html/security.html';
        }
    });

    // Apply the general rate limiter globally
    app.use(generalLimiter);
};
