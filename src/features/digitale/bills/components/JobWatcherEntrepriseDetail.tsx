"use client";
import SharedJobWatcher from "@/features/digitale/_shared/components/JobWatcher";
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
