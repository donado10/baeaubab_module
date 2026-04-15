"use client"
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ReactNode, useState } from "react"
import { FiRefreshCw } from "react-icons/fi";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useGetNotifications from "./use-get-notifications";
import useGetJobs from "@/features/server/job/api/use-get-jobs";
import { INotificationSchema } from "@/features/server/notification/interface";
import type { JobDigital, JobModule } from "@/features/server/job/interface";
import { Card } from "@/components/ui/card";


enum EFilter {
    ALL = "all",
    SYSTEM = "system",
    BACKGROUND = "background"
}

const NotificationFilter = ({ filter, setFilter }: { filter: EFilter; setFilter: React.Dispatch<React.SetStateAction<EFilter>> }) => {
    const filterHandler = (filter: EFilter) => {
        setFilter(filter);
    }

    const noneActiveClass = "border-none bg-transparent shadow-none hover:bg-transparent hover:shadow-none focus:ring-0 focus:ring-offset-0 focus:ring-transparent";

    return <div className="flex items-center justify-between px-1 py-1 w-full rounded-sm bg-gray-100 ">
        <Button variant="outline" size="sm" onClick={filterHandler.bind(this, EFilter.ALL)} className={cn("w-1/4", filter !== EFilter.ALL && noneActiveClass)}>Tout</Button>
        <Button variant="outline" size="sm" onClick={filterHandler.bind(this, EFilter.SYSTEM)} className={cn("w-1/4", filter !== EFilter.SYSTEM && noneActiveClass)}>Système</Button>
        <Button variant="outline" size="sm" onClick={filterHandler.bind(this, EFilter.BACKGROUND)} className={cn("w-2/4", filter !== EFilter.BACKGROUND && noneActiveClass)}>Arrière-plan</Button>
    </div>
}

const NotificationListContainer = ({
    notifications,
    isPending,
}: {
    notifications?: INotificationSchema[];
    isPending: boolean;
}) => {
    if (isPending) {
        return <div>Loading...</div>
    }

    if (!notifications?.length) {
        return <div className="p-4 text-center text-gray-500">Aucune notification</div>
    }

    return <NotificationList notifications={notifications} />
}

const MODULE_LABELS: Record<JobModule, string> = {
    ecritures: "Écritures",
    bonLivraison: "Bon de livraison",
    facture: "Facture",
};

const JobStatusBadge = ({ status }: { status: string }) => {
    if (status === "pending") return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === "done") return <Check className="w-4 h-4 text-green-500" />;
    return <X className="w-4 h-4 text-red-500" />;
};

const JobItem = ({ job }: { job: JobDigital }) => {
    return (
        <Card className="border-b p-4 gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <JobStatusBadge status={job.Job_Status} />
                    <h3 className="font-bold text-base">{MODULE_LABELS[job.Job_Module] ?? job.Job_Module}</h3>
                </div>
                <span className="text-xs text-gray-500">{job.Job_Type}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                    className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        job.Job_Status === "failed" ? "bg-red-500" : "bg-blue-500",
                        job.Job_Progress === 100 && job.Job_Status === "done" ? "bg-green-500" : ""
                    )}
                    style={{ width: `${job.Job_Progress}%` }}
                />
            </div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">{job.Job_Progress}%</span>
                <span className="text-xs text-gray-500">{new Date(job.updated_at).toLocaleString()}</span>
            </div>
            {job.Job_Error && (
                <p className="text-xs text-red-500 mt-1">{job.Job_Error}</p>
            )}
        </Card>
    );
};

const JobListContainer = ({
    jobs,
    isPending,
}: {
    jobs?: JobDigital[];
    isPending: boolean;
}) => {
    if (isPending) {
        return <div>Loading...</div>
    }

    if (!jobs?.length) {
        return <div className="p-4 text-center text-gray-500">Aucun job en arrière-plan</div>
    }

    return (
        <ul className="p-4 flex gap-4 flex-col">
            {jobs.map((job) => (
                <JobItem key={job.Job_No} job={job} />
            ))}
        </ul>
    );
};

const NotificationList = ({ notifications }: { notifications: INotificationSchema[] }) => {
    return <ul className="p-4 flex gap-4 flex-col">
        {notifications.map(notification => <NotificationItem key={notification.Notif_No} notification={notification} />)}
    </ul>
}

const NotificationItem = ({ notification }: { notification: INotificationSchema }) => {

    const NotifTypeMap = new Map<string, string>([
        ["CHECK_BL", "Vérification Bon Livraison"],
    ]);

    return <Card className="border-b p-4 gap-3">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">{NotifTypeMap.get(notification.Notif_Type) || notification.Notif_Type}</h3>
            <span className="font-bold">BL{notification.Notif_RessourceId}</span>
        </div>
        <p>{notification.Notif_Message}</p>
        <span className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>

    </Card>
}

const NotificationPopover = ({ children }: { children: ReactNode }) => {
    const { data, isPending, isFetching, refetch } = useGetNotifications();
    const { data: jobsData, isPending: jobsPending, refetch: refetchJobs } = useGetJobs();
    const [rotation, setRotation] = useState(0);
    const notifications = data ? data.results : [];
    const jobs = jobsData?.results ?? [];

    const [filter, setFilter] = useState<EFilter>(EFilter.ALL);

    const refreshNotifications = async () => {
        setRotation((previousRotation) => previousRotation + 180);
        await Promise.all([refetch(), refetchJobs()]);
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-xl p-0  overflow-hidden">
                <PopoverHeader className="flex flex-row items-center justify-between border-b p-4">
                    <PopoverTitle className="font-bold text-xl">Notifications</PopoverTitle>
                    <div className="w-fit ">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={refreshNotifications}
                            disabled={isFetching}
                            aria-label="Refresh notifications"
                        >
                            <FiRefreshCw
                                className="transition-transform duration-300"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            />
                        </Button>
                    </div>
                </PopoverHeader>
                <div className="w-full p-4 ">
                    {/*filter section */}
                    <NotificationFilter filter={filter} setFilter={setFilter} />
                </div>
                <div className="w-full h-[400px] overflow-y-auto">
                    {filter === EFilter.BACKGROUND ? (
                        <JobListContainer jobs={jobs} isPending={jobsPending} />
                    ) : (
                        <NotificationListContainer notifications={(() => {
                            switch (filter) {
                                case EFilter.SYSTEM:
                                    return notifications.filter(n => n.Notif_Source === "SYSTEM");
                                case EFilter.ALL:
                                default:
                                    return notifications;
                            }
                        })()} isPending={isPending} />
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationPopover