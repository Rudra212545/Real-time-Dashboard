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

    function onCubeUpdate(config) {
      // Cube update from job completion
    }

    socket.on("job_status", onJobStatus);
    socket.on("cube_update", onCubeUpdate);
    
    return () => {
      socket.off("job_status", onJobStatus);
      socket.off("cube_update", onCubeUpdate);
    };
  }, [setJobHistory]);
}
