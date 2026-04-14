"use client";
import SharedJobWatcher from "@/components/jobs/job-watcher";
import { useEntrepriseBonLivraisonStore } from "../store/store";

export default function JobWatcher({ jobId }: { jobId: string }) {
    return (
        <SharedJobWatcher
            jobId={jobId}
            sseEndpoint="/api/digitale/bonLivraison/events/jobId"
            useStore={useEntrepriseBonLivraisonStore}
        />
    );
}
