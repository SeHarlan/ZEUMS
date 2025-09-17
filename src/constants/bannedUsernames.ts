/**
 * Set of banned usernames based on app route names and reserved terms
 * These usernames are forbidden to prevent conflicts with application routes
 */
export const BANNED_USERNAMES = new Set([
  // App route names (top-level routes under app/)
  "about",
  "api",
  "coming-soon",
  "dashboard",
  "media",
  "search",
  "not-found",

  // Critical reserved terms that could cause security or routing conflicts
  "admin",
  "app",
  "auth",
  "login",
  "logout",
  "register",
  "signup",
  "signin",
  "profile",
  "settings",
  "account",
  "user",
  "users",
  "public",
  "private",
  "static",
  "assets",
  "images",
  "css",
  "js",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "service-worker",
  "sw",
  "pwa",
  "api-docs",
  "docs",
  "help",
  "support",
  "contact",
  "terms",
  "privacy",
  "legal",
  "cookies",
  "gdpr",
  "tos",
  "pp",
  "404",
  "500",
  "error",
  "maintenance",
  "www",
  "mail",
  "email",
]);

/**
 * Check if a username is banned
 * @param username - The username to check
 * @returns true if the username is banned, false otherwise
 */
export const isUsernameBanned = (username: string): boolean => {
  const normalizedUsername = username.toLowerCase().trim();
  return BANNED_USERNAMES.has(normalizedUsername);
};

/**
 * Generate a fallback username for OAuth flow when the original username is banned
 * @param originalUsername - The original username that was banned
 * @returns A fallback username with z_ prefix and 3 random numbers
 */
export const generateFallbackUsername = (originalUsername: string): string => {
  const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `z_${randomNumbers}_${originalUsername}`;
};
