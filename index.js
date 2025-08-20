const express = require('express');
const path = require('path');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

// grab the API key from the .env file
const apiKey = process.env.WEATHER_API_KEY;

const app = express();
const port = process.env.PORT || 3000;

// ----------------------
// Rate Limiting
// ----------------------

// Global limiter: limits all requests to 100 per minute per IP
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { error: "Too many requests, please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// Weather API limiter: 30 requests per minute per IP
const weatherLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Too many requests to /api/weather. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// ----------------------
// In-memory Cache
// ----------------------

// Cache Map: key = "lat,lon", value = { data, timestamp }
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Apply weather limiter to this route
app.get('/api/weather', weatherLimiter, async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const cacheKey = `${lat},${lon}`;
    const now = Date.now();

    // Check cache
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (now - cached.timestamp < CACHE_DURATION) {
            return res.json(cached.data); // Return cached response
        } else {
            cache.delete(cacheKey); // Expired, remove from cache
        }
    }

    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();

        // Store in cache
        cache.set(cacheKey, { data, timestamp: now });

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching weather data" });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} : http://localhost:${port}`);
});
