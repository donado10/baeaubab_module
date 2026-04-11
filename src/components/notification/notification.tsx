import React from 'react'
import { Button } from '../ui/button'
import { IoNotifications } from 'react-icons/io5'
import { Popover } from 'radix-ui'
import NotificationPopover from './popover'

type Props = {}

const NotificationSection = (props: Props) => {
    return (
        <NotificationPopover>
            <Button variant="ghost" className=" block ml-auto  hover:bg-primary/40 rounded-full w-14 h-14" asChild>
                <IoNotifications className="" color="#ffffff" />
            </Button>
        </NotificationPopover>
    )
}

export default NotificationSection