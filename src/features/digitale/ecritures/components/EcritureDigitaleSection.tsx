"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { cn, getFrenchMonthName } from '@/lib/utils'
import TableEcritureDigitalContainer from './TableContainer'
import { DialogLoadEcritures } from './DialogLoadEcritures'
import { EStatus, useEcritureEnteteLigneStore } from '../store/store'
import JobWatcher from './JobWatcher'
import { DialogLoadEcrituresWithCheck } from './DialogLoadEcrituresWithCheck'
import { Card } from '@/components/ui/card'



const ResumeCard = ({ title, count }: { title: string, count: number }) => {
    return <Card className='shadow-none p-4 gap-4'>
        <h1 className='text-base font-normal text-gray-700'>{title}</h1>
        <h2 className='font-bold text-3xl italic '>{count}</h2>
    </Card>
}

const FilterSection = () => {
    const [filter, setFilter] = useState(EStatus.ALL)
    const store = useEcritureEnteteLigneStore()
    const classNameButton = 'p-0 hover:bg-transparent hover:text-blue-600  rounded-none'

    useEffect(() => {
        store.setFilter({ ...store.filter, status: filter })

    }, [filter])



    return <div className='border-b border-gray-200 flex items-center gap-8'>
        <Button variant={"ghost"} className={cn(classNameButton, filter === EStatus.ALL ? 'text-blue-600 font-semibold' : '')} onClick={() => setFilter(EStatus.ALL)} disabled={store.items.length <= 0}>Tout</Button>
        <Button variant={"ghost"} className={cn(classNameButton, filter === EStatus.INTEGRE ? 'text-blue-600 font-semibold' : '')} onClick={() => setFilter(EStatus.INTEGRE)} disabled={store.items.length <= 0}>Intégré</Button>
        <Button variant={"ghost"} className={cn(classNameButton, filter === EStatus.VALIDE ? 'text-blue-600 font-semibold ' : '')} onClick={() => setFilter(EStatus.VALIDE)} disabled={store.items.length <= 0}>Valide</Button>
        <Button variant={"ghost"} className={cn(classNameButton, filter === EStatus.INVALIDE ? 'text-blue-600 font-semibold' : '')} onClick={() => setFilter(EStatus.INVALIDE)} disabled={store.items.length <= 0}>Invalide</Button>
        <Button variant={"ghost"} className={cn(classNameButton, filter === EStatus.ATTENTE ? 'text-blue-600 font-semibold' : '')} onClick={() => setFilter(EStatus.ATTENTE)} disabled={store.items.length <= 0}>En attente</Button>
    </div>
}

const EcritureDigitaleSection = () => {

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
                <div>

                    <h1 className='text-2xl text-[#101010] font-bold'>Ecritures Digitales</h1>
                    {store.periode.length > 0 && <h2 className='text-xs'>{getFrenchMonthName(Number(store.periode[1]))} {store.periode[0]}</h2>}
                </div>
                <div className='flex items-center gap-4'>

                    {store.filter.status === EStatus.ATTENTE && <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Vérifier Ecritures</Button>}
                    {store.filter.status === EStatus.INVALIDE && <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Revérifier Ecritures</Button>}
                    {store.filter.status === EStatus.VALIDE && <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Intégrer Ecritures</Button>}
                    {store.filter.status === EStatus.INTEGRE && <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Annuler Ecritures</Button>}
                    <DialogLoadEcritures>

                        <Button variant={"default"} className='bg-[#101010] hover:bg-[#101010]/80'>Charger Ecritures</Button>
                    </DialogLoadEcritures>
                </div>
            </div>
            <div>
                {/*                 {store.event?.jobId && <JobWatcher jobId={store.event.jobId} />}
 */}            </div>
            <div className='h-32 mb-4 shadow-none grid grid-cols-5 gap-4 '>
                <ResumeCard title='Total Factures' count={store.items.length} />
                <ResumeCard title='Factures Intégrées' count={store.items.filter((item) => item.entete.Status === 3).length} />
                <ResumeCard title='Factures Valides' count={store.items.filter((item) => item.entete.Status === 2).length} />
                <ResumeCard title='Factures Invalides' count={store.items.filter((item) => item.entete.Status === 1).length} />
                <ResumeCard title='Factures en attente' count={store.items.filter((item) => item.entete.Status === 0).length} />

            </div>
            <Card className='p-4 shadow-none'>
                <FilterSection />
                <div>
                    <TableEcritureDigitalContainer />
                </div>
            </Card>
        </section>
    )
}

export default EcritureDigitaleSection