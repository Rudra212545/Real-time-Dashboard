import { useEffect } from "react";
import socket from "../socket/socket";

export default function useJobQueue(setJobHistory, setEngineStatus, setLastTelemetry) {
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

    function onEngineStatus(status) {
      if (setEngineStatus) setEngineStatus(status);
    }

    function onEngineTelemetry(telemetry) {
      if (setLastTelemetry) setLastTelemetry(telemetry);
    }

    socket.on("job_status", onJobStatus);
    socket.on("engine_status", onEngineStatus);
    socket.on("engine_telemetry", onEngineTelemetry);
    
    return () => {
      socket.off("job_status", onJobStatus);
      socket.off("engine_status", onEngineStatus);
      socket.off("engine_telemetry", onEngineTelemetry);
    };
  }, [setJobHistory, setEngineStatus, setLastTelemetry]);
}
