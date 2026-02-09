"use client";
import { useEffect, useState } from "react";

export default function JobWatcher({ jobId }: { jobId: string }) {
    const [status, setStatus] = useState("waiting...");

    useEffect(() => {
        if (!jobId) return;

        const es = new EventSource(`http://srv-baeaubab.dyndns.org:53231/api/digitale/ecritures/events/${jobId}`);

        es.addEventListener("connected", () => {
            setStatus("connected, waiting for updates...");
        });

        es.addEventListener("job_update", (e) => {
            const msg = JSON.parse(e.data);
            setStatus(`Job ${msg.jobId}: ${msg.status}`);
            // do something when done:
            if (msg.status === "done") {
                console.log("RESULT:", msg.jobId);
                es.close();
                console.log("readyState after close:", es?.readyState);
            }
            if (msg.status === "failed") {
                console.error("ERROR:", msg.error);
            }
        });

        es.onerror = (e) => {
            setStatus("SSE error / disconnected");
            es.close();
            console.log("readyState after close:", es?.readyState);
        };

        return () => es.close();
    }, [jobId]);

    return <div>{status}</div>;
}
