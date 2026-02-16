"use client";
import { useEffect, useState } from "react";
import { useEcritureEnteteLigneStore } from "../store/store";
import { toast } from "sonner";

export default function JobWatcher({ jobId }: { jobId: string }) {
    const [status, setStatus] = useState("waiting...");
    const store = useEcritureEnteteLigneStore()

    useEffect(() => {
        if (!jobId) return;

        const es = new EventSource(`http://srv-baeaubab.dyndns.org:53231/api/digitale/ecritures/events/${jobId}`);

        es.addEventListener("connected", () => {
            setStatus("connected, waiting for updates...");
        });

        es.addEventListener("job_update", (e) => {
            const msg = JSON.parse(e.data);
            setStatus(`Job ${msg.jobId}: ${msg.ec_count}/${msg.ec_total}`);
            store.setEvent({ id_toast_job: store.event?.id_toast_job as string, jobId: msg.jobId, status: msg.status, ec_count: msg.ec_count, ec_total: msg.ec_total })
            // do something when done:
            if (msg.status === "done") {
                console.log("RESULT:", msg.jobId);
                setStatus(`Job ${msg.jobId}: ${msg.status}`);
                store.event && store.setEvent({ ...store.event, jobId: msg.jobId, status: msg.status })
                toast.dismiss(store.event?.id_toast_job);


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
