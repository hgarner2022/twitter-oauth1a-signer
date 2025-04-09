# Twitter OAuth 1.0a Signing Proxy

This is a simple Express.js service that signs Twitter API requests using OAuth 1.0a.
Use it to enable your LLM agent to securely post tweets, send DMs, and more.

## Features

- Signs OAuth 1.0a requests for Twitter API v1.1 and v2
- Built-in rate limiting to prevent accidental API abuse
- Security headers for production use
- Health check endpoint
- Comprehensive error handling

## Endpoints

### Health Check

**GET `/health`**

Use this to verify the service is running properly.

**Response:**
```json
{
  "status": "healthy"
}
```

### OAuth Signing

**POST `/sign`**

**Body:**
```json
{
  "method": "POST",
  "url": "https://api.twitter.com/2/tweets",
  "params": {
    "text": "Hello world from LLM agent"
  }
}
```

**Response:**
```json
{
  "authorization": "OAuth oauth_consumer_key=..., oauth_signature=..."
}
```

## Example Usage

### Posting a Tweet

```javascript
// 1. Get OAuth header from the proxy
const signatureResponse = await fetch('https://your-oauth-proxy.url/sign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    method: 'POST',
    url: 'https://api.twitter.com/2/tweets',
    params: {
      text: 'Hello from my AI assistant!'
    }
  })
});

const { authorization } = await signatureResponse.json();

// 2. Use the header to make the actual Twitter API request
const tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': authorization
  },
  body: JSON.stringify({
    text: 'Hello from my AI assistant!'
  })
});

const tweet = await tweetResponse.json();
```

### Sending a Direct Message

```javascript
// 1. Get OAuth header from the proxy
const signatureResponse = await fetch('https://your-oauth-proxy.url/sign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    method: 'POST',
    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
    params: {
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: "RECIPIENT_USER_ID"
          },
          message_data: {
            text: "Hello from my AI assistant!"
          }
        }
      }
    }
  })
});

const { authorization } = await signatureResponse.json();

// 2. Use the header to make the actual Twitter API request
const dmResponse = await fetch('https://api.twitter.com/1.1/direct_messages/events/new.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': authorization
  },
  body: JSON.stringify({
    event: {
      type: "message_create",
      message_create: {
        target: {
          recipient_id: "RECIPIENT_USER_ID"
        },
        message_data: {
          text: "Hello from my AI assistant!"
        }
      }
    }
  })
});

const dm = await dmResponse.json();
```

## How to Deploy

### Railway (Recommended)

1. Create a new Railway project.
2. Upload this project or connect your GitHub repo.
3. Add the following environment variables:

- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

4. Deploy and use your app's public URL to proxy OAuth headers.

### Heroku

1. Create a new Heroku app.
2. Connect your GitHub repository or use the Heroku CLI to deploy.
3. Set the environment variables in the Heroku dashboard or using the CLI:

```bash
heroku config:set TWITTER_API_KEY=your_api_key
heroku config:set TWITTER_API_SECRET=your_api_secret
heroku config:set TWITTER_ACCESS_TOKEN=your_access_token
heroku config:set TWITTER_ACCESS_SECRET=your_access_secret
```

4. Deploy your application.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Twitter API credentials
4. Run the server: `npm run dev`

## Security Considerations

- This service should be deployed with authentication if being used in a multi-user environment
- Consider implementing CORS restrictions to limit which domains can call this service
- The Twitter API credentials used must have appropriate permissions for the API endpoints you're calling
