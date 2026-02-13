"use client"

import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import TableEcritureDigitalContainer from './TableContainer'
import { DialogLoadEcritures } from './DialogLoadEcritures'
import { useEcritureEnteteLigneStore } from '../store/store'
import JobWatcher from './JobWatcher'

type Props = {}

const EcritureDigitaleSection = (props: Props) => {

    const classNameButton = 'p-0 hover:bg-transparent hover:text-blue-600  rounded-none'

    const store = useEcritureEnteteLigneStore()


    return (
        <section className='p-4'>
            <main className='p-4'>


                <div className='flex items-center justify-between mb-8 '>
                    <h1 className='text-xl font-bold'>Ecritures Digitales</h1>
                    <DialogLoadEcritures>

                        <Button variant={"default"}>Charger Ecritures</Button>
                    </DialogLoadEcritures>
                </div>
                <div>
                    {store.event?.jobId && <JobWatcher jobId={store.event.jobId} />}
                </div>
                <div className='border-b-2 border-gray-200 flex items-center gap-8'>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Tout</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Intégré</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Valide</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Invalide</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>En attente</Button>
                </div>
                <div>
                    <TableEcritureDigitalContainer />
                </div>
            </main>
        </section>
    )
}

export default EcritureDigitaleSection