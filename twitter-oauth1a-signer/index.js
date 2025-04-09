
import express from 'express';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

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

app.post('/sign', (req, res) => {
  const { method, url, params = {} } = req.body;
  if (!method || !url) {
    return res.status(400).json({ error: 'method and url are required' });
  }

  const request_data = { url, method, data: params };
  const authHeader = oauth.toHeader(oauth.authorize(request_data, token));
  res.json({ authorization: authHeader.Authorization });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OAuth signer running on port ${PORT}`);
});
