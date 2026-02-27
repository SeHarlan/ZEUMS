# Agents

## Cursor Cloud specific instructions

### Overview

Zeums is a single Next.js 15 application (App Router + Turbopack) for curating digital art galleries on Solana. Tech stack: React 19, TypeScript, Tailwind CSS 4, MongoDB (Mongoose), NextAuth 4, pnpm.

### Services

| Service | Required | How to start |
|---|---|---|
| Next.js dev server | Yes | `pnpm dev` (port 3000) |
| MongoDB | Yes | `mongod --dbpath /tmp/mongodb/data --logpath /tmp/mongodb/mongod.log --fork --bind_ip 127.0.0.1 --port 27017` |

### Environment variables

A `.env.local` file is required at the repo root with at minimum:

```
MONGODB_URI=mongodb://127.0.0.1:27017/zeums
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<any-base64-secret>
RESEND_API_KEY=re_placeholder_dev_key
```

The `RESEND_API_KEY` placeholder is needed because the Resend SDK throws at module load time if the key is missing, even though emails are logged to the console in dev mode (never actually sent). Any string starting with `re_` works.

### Common commands

See `package.json` scripts. Key commands: `pnpm dev`, `pnpm lint`, `pnpm build`.

### Gotchas

- **pnpm build scripts warning**: pnpm 10 blocks build scripts by default. The warning about ignored build scripts (sharp, bufferutil, etc.) does not affect `pnpm dev` or `pnpm lint`. If `pnpm build` has image optimization issues, you may need to add `pnpm.onlyBuiltDependencies` to `package.json`.
- **Email auth in dev**: Magic links are logged to the Next.js terminal output (look for `🔗 Magic Link for development:`), not sent via email. To complete sign-in, copy the URL from the terminal and open it in the browser.
- **MongoDB must be running** before starting the dev server, otherwise auth API routes will fail.
