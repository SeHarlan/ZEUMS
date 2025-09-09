interface ServerErrorArgs {
  error: Error | unknown
  report?: boolean;
  location: string;
}


export const handleServerError = ({ error, report, location } : ServerErrorArgs) => { 
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`🚨💾 ${location} -- ${errorMessage}`);

  if (report) {
    //TODO report error
  }
}

export const handleClientError = ({ error, report, location } : ServerErrorArgs) => { 
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`🚨💻 ${location} -- ${errorMessage}`);

  if (report) {
    //TODO report error
  }
}