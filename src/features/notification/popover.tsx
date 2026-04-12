"use client"
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../../components/ui/button"
import { ReactNode, useState } from "react"
import { FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";
import useGetNotifications from "./use-get-notifications";
import { INotificationSchema } from "@/features/server/notification/interface";
import { Card } from "../../components/ui/card";


enum EFilter {
    ALL = "all",
    SYSTEM = "system",
    BACKGROUND = "background"
}

const NotificationFilter = () => {
    const [activeFilter, setActiveFilter] = useState<EFilter>(EFilter.ALL);

    const filterHandler = (filter: EFilter) => {
        setActiveFilter(filter);
    }

    const noneActiveClass = "border-none bg-transparent shadow-none hover:bg-transparent hover:shadow-none focus:ring-0 focus:ring-offset-0 focus:ring-transparent";

    return <div className="flex items-center justify-between px-1 py-1 w-full rounded-sm bg-gray-100 ">
        <Button variant="outline" size="sm" onClick={filterHandler.bind(this, EFilter.ALL)} className={cn("w-1/4", activeFilter !== EFilter.ALL && noneActiveClass)}>Tout</Button>
        <Button variant="outline" size="sm" onClick={filterHandler.bind(this, EFilter.SYSTEM)} className={cn("w-1/4", activeFilter !== EFilter.SYSTEM && noneActiveClass)}>Système</Button>
        <Button variant="outline" size="sm" onClick={filterHandler.bind(this, EFilter.BACKGROUND)} className={cn("w-2/4", activeFilter !== EFilter.BACKGROUND && noneActiveClass)}>Arrière-plan</Button>
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
        return <div>No notifications</div>
    }

    return <NotificationList notifications={notifications} />
}

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
    const [rotation, setRotation] = useState(0);
    const notifications = data ? data.results : [];

    const refreshNotifications = async () => {
        setRotation((previousRotation) => previousRotation + 180);
        await refetch();
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
                    <NotificationFilter />
                </div>
                <div className="w-full h-[400px] overflow-y-auto">
                    <NotificationListContainer notifications={notifications} isPending={isPending} />
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationPopover