# twitter-oauth1a-signer
twitter-oauth1a-signer
Twitter OAuth 1.0a Signing Proxy
This is a simple Express.js service that signs Twitter API requests using OAuth 1.0a. Use it to enable your LLM agent to securely post tweets, send DMs, and more.

Endpoint
POST /sign

Body:

{
  "method": "POST",
  "url": "https://api.twitter.com/2/tweets",
  "params": {
    "text": "Hello world from LLM agent"
  }
}
Response:

{
  "authorization": "OAuth oauth_consumer_key=..., oauth_signature=..."
}
How to Deploy (Recommended: Railway)
Create a new Railway project.
Upload this project or connect your GitHub repo.
Add the following environment variables:
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET
Deploy and use your app’s public URL to proxy OAuth headers.
