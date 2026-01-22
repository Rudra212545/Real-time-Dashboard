import { useEffect } from "react";
import socket from "../socket/socket";

export default function useJobQueue(setJobHistory) {
  useEffect(() => {
    function onJobStatus(job) {
      setJobHistory(prev => {
        const idx = prev.findIndex(j => j.id === job.jobId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...job, id: job.jobId };
          return updated;
        }
        return [{ ...job, id: job.jobId }, ...prev];
      });
    }

    socket.on("job_status", onJobStatus);
    return () => socket.off("job_status", onJobStatus);
  }, [setJobHistory]);
}
