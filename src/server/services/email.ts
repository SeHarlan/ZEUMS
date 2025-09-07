import { TITLE_COPY } from '@/textCopy/mainCopy';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export function createMagicLinkEmailTemplate({
  magicLink,
  appName = TITLE_COPY
}: {
  magicLink: string;
  appName: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in to ${appName}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          font-family: serif;
        }
        .header p {
          color: #e2e8f0;
          margin: 8px 0 0 0;
          font-size: 16px;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
        }
        .fallback {
          margin-top: 24px;
          padding: 16px;
          background-color: #f8fafc;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        .fallback p {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 8px 0;
          font-weight: 500;
        }
        .fallback a {
          color: #667eea;
          text-decoration: underline;
          word-break: break-all;
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #9ca3af;
          font-size: 14px;
          margin: 0;
        }
        .logo {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          display: block;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0 16px;
          }
          .header, .content, .footer {
            padding: 24px 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="${process.env.NEXTAUTH_URL}/glitchz-small.gif" alt="${appName} Logo" class="logo" />
          <h1>Welcome to ${appName}</h1>
          <p>Sign in to your account</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p>
            Click the button below to sign in to your account. This link will expire in 24 hours.
          </p>
          
          <!-- CTA Button -->
          <div class="button-container">
            <a href="${magicLink}" class="button">
              Sign In to ${appName}
            </a>
          </div>
          
          <!-- Fallback Link -->
          <div class="fallback">
            <p><strong>Button not working?</strong></p>
            <p>
              Copy and paste this link into your browser:<br>
              <a href="${magicLink}">${magicLink}</a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>
            This email was sent to you because someone requested to sign in to your account. 
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendMagicLinkEmail({
  to,
  from,
  magicLink,
  appName
}: {
  to: string;
  from: string;
  magicLink: string;
  appName: string;
  }) {

  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to: [to],
      subject: `Sign in to ${appName}`,
      html: createMagicLinkEmailTemplate({ magicLink, appName }),
    });

    if (error) {
      throw error
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    throw error;
  }
}
