"use client";
import SharedJobWatcher from "@/components/jobs/job-watcher";
import { useEntrepriseFactureStore } from "../store/store";

export default function JobWatcher({ jobId }: { jobId: string }) {
    return (
        <SharedJobWatcher
            jobId={jobId}
            sseEndpoint="/api/digitale/facture/events/jobId"
            useStore={useEntrepriseFactureStore}
        />
    );
}
