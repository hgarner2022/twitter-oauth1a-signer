import express from 'express';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize Express
const app = express();

// Add security headers
app.use(helmet());

// Request logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(apiLimiter);

// Initialize OAuth
const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN,
  secret: process.env.TWITTER_ACCESS_SECRET
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// OAuth signing endpoint
app.post('/sign', (req, res) => {
  try {
    const { method, url, params = {} } = req.body;
    
    // Validate required fields
    if (!method || !url) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Both method and url are required fields' 
      });
    }
    
    // Validate URL is for Twitter API
    if (!url.startsWith('https://api.twitter.com/')) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'URL must be a Twitter API endpoint' 
      });
    }

    const request_data = { url, method, data: params };
    const authHeader = oauth.toHeader(oauth.authorize(request_data, token));
    
    res.json({ authorization: authHeader.Authorization });
  } catch (error) {
    console.error('Error generating OAuth signature:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to generate OAuth signature' 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OAuth signer running on port ${PORT}`);
});
