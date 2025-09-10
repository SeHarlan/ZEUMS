interface ServerErrorArgs {
  error: Error | unknown
  report?: boolean;
  location: string;
}


const isErrorWithMessage = (error: unknown): error is { message: unknown } => {
  return typeof error === "object" && error !== null && "message" in error;
}

export const handleServerError = ({ error, report, location } : ServerErrorArgs) => { 
  let errorMessage = isErrorWithMessage(error) ? error.message : error;
  if (typeof errorMessage !== "string") {
    errorMessage = JSON.stringify(errorMessage);
  } 
  console.error(`🚨💾 ${location} -- ${errorMessage}`);

  if (report) {
    //TODO report error
  }
}

export const handleClientError = ({ error, report, location } : ServerErrorArgs) => { 
  let errorMessage = isErrorWithMessage(error) ? error.message : error;
  if (typeof errorMessage !== "string") {
    errorMessage = JSON.stringify(errorMessage);
  } 
  console.error(`🚨💻 ${location} -- ${errorMessage}`);

  if (report) {
    //TODO report error
  }
}