"use client";
import SharedJobWatcher from "@/components/jobs/job-watcher";
import { useEntrepriseDetailStore } from "../store/entreprise-store";

export default function JobWatcherEntrepriseDetail({ jobId }: { jobId: string }) {
    return (
        <SharedJobWatcher
            jobId={jobId}
            sseEndpoint="/api/digitale/bonLivraison/events/jobId"
            useStore={useEntrepriseDetailStore}
        />
    );
}
