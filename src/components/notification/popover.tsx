"use client"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../ui/button"
import { ReactNode, useState } from "react"
import { FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";
import useGetNotifications from "./use-get-notifications";
import { INotificationSchema } from "@/features/server/notification/interface";


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

const NotificationListContainer = () => {
    const { data, isPending } = useGetNotifications();

    if (isPending) {
        return <div>Loading...</div>
    }

    if (!data) {
        return <div>No notifications</div>
    }


    return <NotificationList notifications={data.results} />
}

const NotificationList = ({ notifications }: { notifications: INotificationSchema[] }) => {
    return <ul>
        {notifications.map(notification => <li key={notification.Notif_No} className="border-b p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold">{notification.Notif_Type}</h3>
                <span className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
            </div>
            <p>{notification.Notif_Message}</p>
        </li>)}
    </ul>
}

const NotificationPopover = ({ children }: { children: ReactNode }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-90 p-0 ">
                <PopoverHeader className="flex flex-row items-center justify-between border-b p-4">
                    <PopoverTitle className="font-bold">Notifications</PopoverTitle>

                    <div className="w-fit "><FiRefreshCw /></div>
                </PopoverHeader>
                <div className="w-full p-4 ">
                    {/*filter section */}
                    <NotificationFilter />
                </div>
                <div>
                    <NotificationListContainer />
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationPopover