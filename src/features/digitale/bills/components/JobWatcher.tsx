"use client";
import SharedJobWatcher from "@/features/digitale/_shared/components/JobWatcher";
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
