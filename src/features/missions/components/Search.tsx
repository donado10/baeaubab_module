import { Input } from '@/components/ui/input'
import React from 'react'

type Props = {}

const Search = ({ onAction, placeholder }: { onAction: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) => {
    return (
        <span className="border  h-10  flex items-center justify-center p-2 rounded-2xl ">
            <Input onChange={onAction} placeholder={placeholder} className="h-8 border-none shadow-none" />
        </span>
    )
}

export default Search