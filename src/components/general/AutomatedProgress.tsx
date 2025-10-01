"use client"
import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";

interface AutomatedProgressProps { 
  complete?: boolean;
  loading?: boolean;
  className?: string;
}

const UPDATE_INTERVAL = 100;

const AutomatedProgress = ({
  complete = false,
  loading = true,
  className,
}: AutomatedProgressProps) => { 
  const [progress, setProgress] = useState(1);
  
  useEffect(() => { 
    let interval: NodeJS.Timeout | null = null;

    if (complete) { 
      setProgress(100); // Set progress to 100% when user is logged in
      return; // No need for an interval if user is logged in
    }

    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) {
            return 50; // Repeat at 50% to indicate continuing loading
          }
          return prev + 1;
        });
      }, UPDATE_INTERVAL); 
    } 

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, complete]);
  return <Progress value={progress} className={className} />;
}

export default AutomatedProgress;