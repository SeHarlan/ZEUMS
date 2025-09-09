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
        /* Design system variables matching shadcn/ui */
        :root {
          --background: #ffffff;
          --foreground: #0a0a0a;
          --card: #ffffff;
          --card-foreground: #0a0a0a;
          --primary: #0a0a0a;
          --primary-foreground: #fafafa;
          --secondary: #f5f5f5;
          --secondary-foreground: #0a0a0a;
          --muted: #f5f5f5;
          --muted-foreground: #737373;
          --accent: #f5f5f5;
          --accent-foreground: #0a0a0a;
          --border: #e5e5e5;
          --radius: 0.625rem;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: var(--background);
          color: var(--foreground);
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: var(--card);
          color: var(--card-foreground);
          border-radius: calc(var(--radius) + var(--radius));
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .header {
          background-color: var(--primary);
          color: var(--primary-foreground);
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          color: var(--primary-foreground);
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          font-family: serif;
        }
        
        .header p {
          color: var(--primary-foreground);
          opacity: 0.8;
          margin: 8px 0 0 0;
          font-size: 16px;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .content p {
          color: var(--card-foreground);
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }
        
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        
        /* Button styling matching shadcn button default variant */
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          border-radius: var(--radius);
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: var(--primary);
          color: var(--primary-foreground);
          text-decoration: none;
          padding: 8px 16px;
          height: 24px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: none;
          cursor: pointer;
        }
        
        .button:hover {
          background-color: color-mix(in srgb, var(--primary) 90%, transparent);
        }
        
        .fallback {
          margin-top: 24px;
          padding: 16px;
          background-color: var(--muted);
          border-radius: var(--radius);
        }
        
        .fallback p {
          color: var(--muted-foreground);
          font-size: 14px;
          margin: 0 0 8px 0;
          font-weight: 500;
        }
        
        .fallback a {
          color: var(--primary);
          text-decoration: underline;
          font-size: 10px;
          word-break: break-all;
        }
        
        .footer {
          background-color: var(--muted);
          padding: 24px 30px;
          text-align: center;
          border-top: 1px solid var(--border);
        }
        
        .footer p {
          color: var(--muted-foreground);
          font-size: 14px;
          margin: 0;
        }
        
        .logo {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          display: block;
        }

        .text-center {
          width: 100%;
          text-align: center;
        }

        .italic {
          font-style: italic;
          color: var(--muted-foreground);
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
          <img src="${process.env.NEXTAUTH_URL}/icon.png" alt="${appName} Logo" class="logo" />
          <h1>Welcome to ${appName}</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p class="text-center">
            Click the button below to sign in to your account.
          </p>
          
          <!-- CTA Button -->
          <div class="button-container">
            <a href="${magicLink}" class="button">
              Sign In to ${appName}
            </a>
          </div>

          <strong class="text-center italic">
            This link will expire in 24 hours.
          </strong>
          
          <!-- Fallback Link -->
          <div class="fallback">
            <strong>Button not working?</strong>
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
