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


  const value = complete ? 100 : progress

  return <Progress value={value} className={className} />;
}

export default AutomatedProgress;