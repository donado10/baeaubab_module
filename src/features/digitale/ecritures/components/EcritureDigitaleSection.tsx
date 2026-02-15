"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import TableEcritureDigitalContainer from './TableContainer'
import { DialogLoadEcritures } from './DialogLoadEcritures'
import { useEcritureEnteteLigneStore } from '../store/store'
import JobWatcher from './JobWatcher'
import { DialogLoadEcrituresWithCheck } from './DialogLoadEcrituresWithCheck'
import { Card } from '@/components/ui/card'

type Props = {}

const EcritureDigitaleSection = (props: Props) => {

    const classNameButton = 'p-0 hover:bg-transparent hover:text-blue-600  rounded-none'
    const [dialogEcWithCheck, setDialogEcWithCheck] = useState(false)

    const store = useEcritureEnteteLigneStore()

    useEffect(() => {
        if (store.event?.status === 'done') {
            setDialogEcWithCheck(true)
        }
    }, [store.event?.status])


    return (
        <section className='p-4 text-gray-700'>
            {store.event?.status === 'done' && <DialogLoadEcrituresWithCheck open={dialogEcWithCheck} onOpen={setDialogEcWithCheck} />}

            <div className='flex items-center justify-between mb-8 '>
                <h1 className='text-2xl text-[#101010] font-bold'>Ecritures Digitales</h1>
                <DialogLoadEcritures>

                    <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Charger Ecritures</Button>
                </DialogLoadEcritures>
            </div>
            <div>
                {store.event?.jobId && <JobWatcher jobId={store.event.jobId} />}
            </div>
            <div className='h-32 mb-4 shadow-none grid grid-cols-5 gap-4 '>
                <Card className='shadow-none p-4 gap-4'>
                    <h1 className='text-base font-normal text-gray-700'>Total factures</h1>
                    <h2 className='font-bold text-3xl italic '>3000</h2>
                </Card>
                <Card className='shadow-none p-4 gap-4'>
                    <h1 className='text-base font-normal text-gray-700'>Factures Intégrées</h1>
                    <h2 className='font-bold text-3xl italic'>2000</h2>
                </Card>
                <Card className='shadow-none p-4 gap-4'>
                    <h1 className='text-base font-normal text-gray-700'>Factures Valides</h1>
                    <h2 className='font-bold text-3xl italic'>2000</h2>
                </Card>
                <Card className='shadow-none p-4 gap-4'>
                    <h1 className='text-base font-normal text-gray-700'>Factures Invalides</h1>
                    <h2 className='font-bold text-3xl italic'>5</h2>
                </Card>
                <Card className='shadow-none p-4 gap-4'>
                    <h1 className='text-base font-normal text-gray-700'>Factures en attente</h1>
                    <h2 className='font-bold text-3xl italic'>0</h2>
                </Card>
            </div>
            <Card className='p-4 shadow-none'>



                <div className='border-b border-gray-200 flex items-center gap-8'>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Tout</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Intégré</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Valide</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>Invalide</Button>
                    <Button variant={"ghost"} className={cn(classNameButton)}>En attente</Button>
                </div>
                <div>
                    <TableEcritureDigitalContainer />
                </div>
            </Card>
        </section>
    )
}

export default EcritureDigitaleSection