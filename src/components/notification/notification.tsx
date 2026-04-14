"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { IoNotifications } from 'react-icons/io5'
import NotificationPopover from './popover'
import useGetUnreadNotificationsCount from './use-get-unread-notifications-count'

type Props = {}

const NotificationSection = (props: Props) => {
    const { data } = useGetUnreadNotificationsCount();
    const unreadCount = data?.unreadCount ?? 0;

    return (
        <NotificationPopover>
            <div className="relative ml-auto w-fit">
                <Button variant="ghost" className="hover:bg-primary/40 rounded-full block" asChild>
                    <IoNotifications color="#ffffff" className='w-14 h-14' />
                </Button>
                {unreadCount > 0 ? (
                    <span className="absolute right-2 top-2 flex w-5 h-5 items-center justify-center rounded-full bg-red-500 p-1.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                ) : null}
            </div>
        </NotificationPopover>
    )
}

export default NotificationSection