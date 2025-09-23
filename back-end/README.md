# Backend Setup Guide

## Environment Variables Setup

Create a `.env` file in the `back-end` directory with the following variables:

### Required Variables

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Frontend URL
FRONTEND_URL=https://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_here

# Environment
NODE_ENV=development
PORT=3002
```

### Optional Services

#### Twilio (Phone Verification)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get Twilio credentials:**

1. Sign up at [Twilio Console](https://www.twilio.com/try-twilio)
2. Go to Console Dashboard to get Account SID and Auth Token
3. Navigate to Verify > Services to create a new Verify Service
4. Copy the Service SID

#### SendGrid (Email Service)

```env
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

#### Google OAuth

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://localhost:3002/api/auth/google/callback
```

#### reCAPTCHA

```env
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
RECAPTCHA_VERIFY_URL=https://www.google.com/recaptcha/api/siteverify
```

#### Cloudinary (Image Upload)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Redis (Optional - for better performance)

```env
REDIS_URL=redis://localhost:6379
```

## Service Status

When you start the server, you'll see a configuration status report showing which services are properly configured.

## Fallback Behavior

- **Twilio not configured**: Phone verification features will be disabled
- **SendGrid not configured**: Email sending will be simulated (development mode)
- **Redis not configured**: Will use MongoDB for token storage (fallback)
- **Google OAuth not configured**: Google login will be disabled

## Development vs Production

- In development, missing services will show warnings but won't stop the server
- In production, ensure all required services are properly configured
