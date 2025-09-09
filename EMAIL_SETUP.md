<!-- TODO-important: delete -->

# Email Magic Link Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Resend Email Service (Recommended)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_DOMAIN=yourdomain.com

# SMTP Configuration (Fallback - Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Google OAuth (Existing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB (Existing)
MONGODB_URI=your-mongodb-connection-string
```

## Setup Steps

### 1. Install Dependencies
```bash
yarn add resend
```

### 2. Set up Resend
1. Go to [resend.com](https://resend.com)
2. Create an account and verify your domain
3. Generate an API key
4. Add `RESEND_API_KEY` to your environment variables

### 3. Configure Domain
1. Add your domain to Resend
2. Set up DNS records as instructed
3. Add `EMAIL_DOMAIN` to your environment variables

### 4. Test the Implementation
1. Start your development server
2. Navigate to `/api/auth/signin`
3. Enter an email address
4. Check your email for the magic link
5. Click the link to sign in

## Features Implemented

✅ **Secure Magic Link Authentication** - Uses NextAuth.js built-in security  
✅ **Beautiful Email Templates** - Matches your Zeum design system  
✅ **Responsive Design** - Works on all devices  
✅ **Error Handling** - Proper error messages and fallbacks  
✅ **Rate Limiting** - Built into NextAuth.js  
✅ **Token Expiration** - 24-hour token expiry for security  
✅ **User Management** - Integrates with your existing user system  

## Security Features

- **Token-based authentication** - No passwords stored
- **Time-limited tokens** - 24-hour expiration
- **CSRF protection** - Built into NextAuth.js
- **Secure email delivery** - Via Resend's secure infrastructure
- **Rate limiting** - Prevents abuse

## Customization

The email template uses your existing design system:
- Zeum logo and branding
- Your color scheme and typography
- Responsive design for all email clients
- Professional styling that matches your website

## Troubleshooting

### Email not received
1. Check spam folder
2. Verify Resend API key is correct
3. Check domain verification in Resend dashboard
4. Ensure `EMAIL_DOMAIN` is set correctly

### Sign-in not working
1. Check NextAuth configuration
2. Verify database connection
3. Check console for errors
4. Ensure all environment variables are set
