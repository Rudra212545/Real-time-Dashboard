import { useEffect } from "react";
import socket from "../socket/socket";

export default function useJobQueue(setJobHistory) {
  useEffect(() => {
    function onJobStatus(job) {
      setJobHistory(prev => {
        const idx = prev.findIndex(j => j.id === job.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = job;
          return updated;
        }
        return [job, ...prev];
      });
    }

    socket.on("job_status", onJobStatus);
    return () => socket.off("job_status", onJobStatus);
  }, []);
}
