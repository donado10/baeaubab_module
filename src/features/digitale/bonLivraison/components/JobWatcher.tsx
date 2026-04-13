"use client";
import SharedJobWatcher from "@/features/digitale/_shared/components/JobWatcher";
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
