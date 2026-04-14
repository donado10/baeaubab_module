"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { IBaseStore } from "@/features/digitale/_shared/types";

type JobWatcherProps = {
    jobId: string;
    /** SSE endpoint prefix, e.g. "/api/digitale/bonLivraison/events/jobId" */
    sseEndpoint: string;
    useStore: () => Pick<IBaseStore, "event" | "setEvent">;
};

export default function JobWatcher({
    jobId,
    sseEndpoint,
    useStore,
}: JobWatcherProps) {
    const [status, setStatus] = useState("waiting...");
    const store = useStore();

    useEffect(() => {
        const es = new EventSource(
            `${process.env.NEXT_PUBLIC_APP_URL!}${sseEndpoint}/${jobId}`
        );

        es.addEventListener("connected", () => {
            setStatus("connected, waiting for updates...");
        });

        es.addEventListener("job_update", (e) => {
            const msg = JSON.parse(e.data);
            setStatus(`Job ${msg.jobId}: ${msg.ec_count}/${msg.ec_total}`);
            store.setEvent({
                id_toast_job: store.event?.id_toast_job as string,
                jobId: msg.jobId,
                status: msg.status,
                ec_count: msg.ec_count,
                ec_total: msg.ec_total,
            });

            if (msg.status === "done") {
                setStatus(`Job ${msg.jobId}: ${msg.status}`);
                store.event &&
                    store.setEvent({
                        ...store.event,
                        jobId: msg.jobId,
                        status: msg.status,
                    });
                toast.dismiss(store.event?.id_toast_job);
                es.close();
            }

            if (msg.status === "failed") {
                console.error("ERROR:", msg.error);
            }
        });

        es.onerror = () => {
            setStatus("SSE error / disconnected");
            es.close();
        };

        return () => es.close();
    }, [jobId]);

    return <div className="w-full">{status}</div>;
}
