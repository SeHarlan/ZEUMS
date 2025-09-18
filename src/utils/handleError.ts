interface ErrorArgs {
  error: Error | unknown;
  location: string;
  report?: boolean;
}

export const handleServerError = ({ error, location, report }: ErrorArgs) => { 
  const message = getErrorMessage(error);
  console.error(`🚨💾 ${location} -- ${message}`);

  if (report) {
    // TODO: Report to monitoring service (e.g., Sentry, DataDog)
  }
}

export const handleClientError = ({ error, location, report }: ErrorArgs) => { 
  const message = getErrorMessage(error);
  console.warn(`🚨💻 ${location} -- ${message}`);

  if (report) {
    // TODO: Report to client-side monitoring (e.g., Sentry, LogRocket)
  }
}

const getErrorMessage = (error: Error | unknown): string => {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  
  // Handle string errors
  if (typeof error === "string") {
    return error;
  }
  
  // Handle null/undefined
  if (error == null || error === undefined) {
    return "Unknown error";
  }
  
  // Handle objects - try JSON stringify, fallback to string
  if (typeof error === "object") {
    try {
      return JSON.stringify(error);
    } catch {
      return `[Object: ${error.constructor?.name || "Unknown"}]`;
    }
  }
  
  // Fallback for primitives
  return String(error);
}