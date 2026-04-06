"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { cn, getCurrentYearMonth, getFrenchMonthName } from '@/lib/utils'
import { DialogLoadBonLivraison } from '../DialogLoadBonLivraison'
import { EStatus, useEntrepriseBonLivraisonStore } from '../../store/store'
import { DialogGetBonLivraison } from '../DialogGetBonLivraison'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MdCloudDownload } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import BonLivraisonTableContainer from '../TableContainer'
import useGetBillStats from '../../api/use-get-bl-stats'
import { DialogGenerateFactures } from '../DialogGenerateFactures'
import { DialogGenerateFacturesByEntreprise } from '../DialogGenerateFacturesByEntreprise'
import useGetBonLivraison from '../../api/use-get-bon-livraison'
import { DialogActualiserBonLivraison } from '../DialogActualiserBonLivraison'
import { IDocumentBonLivraison, IEntrepriseBonLivraison } from '../../interface'
import useGetBonLivraisonStatsByCompany from '../../api/use-get-bon-livraison'
import { useRouter, useSearchParams } from 'next/navigation'
import useGetBonLivraisonStats from '../../api/use-get-bl-stats'
import { useQueryClient } from '@tanstack/react-query'



const BonLivraisonStatCard = ({ title, count, background, text = 'text-gray-700' }: { title: string, count: number, background: string, text?: string }) => {
    return <Card className={cn('shadow-none p-4 gap-4 flex flex-row items-center justify-between', background)}>
        <div className='flex flex-col gap-4'>

            <h1 className={cn('text-base font-normal ', text)}>{title}</h1>
            <h2 className='font-bold text-3xl italic '>{count}</h2>
        </div>
        <IoDocumentTextOutline width={1600} height={1600} size={40} />
    </Card>
}

const BonLivraisonSelectType = ({ onSetType, disabled }: { onSetType: (value: 'entreprise_id' | 'Intitule') => void, disabled: boolean }) => {
    const [itemValue, setItemValue] = useState<'entreprise_id' | 'Intitule'>('Intitule')

    return <Select disabled={disabled} value={itemValue} onValueChange={(value) => { onSetType(value as 'entreprise_id' | 'Intitule'); setItemValue(value as 'entreprise_id' | 'Intitule') }}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="type" />
        </SelectTrigger>
        <SelectContent >
            <SelectGroup>
                <SelectItem key={"entreprise_id"} value={"entreprise_id"}>ID Entreprise</SelectItem>
                <SelectItem key={"Intitule"} value={"Intitule"}>Intitulé</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
}

const BonLivraisonSearch = () => {
    const store = useEntrepriseBonLivraisonStore()
    return <div className='flex items-center gap-4'>
        <Input disabled={store.items.length <= 0} onChange={(e) => store.setFilter({ ...store.filter, search: { ...store.filter.search, value: e.currentTarget.value } })} className='w-64' placeholder='Rechercher' />
        <BonLivraisonSelectType disabled={store.items.length <= 0} onSetType={(value: 'entreprise_id' | 'Intitule') => {

            store.setFilter({ ...store.filter, search: { ...store.filter.search, type: value } })
        }} />
    </div>
}

const BonLivraisonFilterSection = () => {
    const store = useEntrepriseBonLivraisonStore()
    const classNameButton = 'p-0 hover:bg-transparent hover:text-primary/30  rounded-none'



    return <div>

        <div className='border-b border-gray-200 flex items-center justify-between  gap-8 p-2'>

            <div className=' border-gray-200 flex items-center gap-8'>
                <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.ALL ? 'text-primary font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.ALL })} disabled={store.items.length <= 0}>Tout</Button>
                <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.VALID ? 'text-green-600 font-semibold text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.VALID })} disabled={store.items.length <= 0}>Valide</Button>
                <Button variant={"ghost"} className={cn(classNameButton, store.filter?.status === EStatus.WAITING ? ' text-yellow-600 font-semibold  text-base' : '')} onClick={() => store.setFilter({ ...store.filter, status: EStatus.WAITING })} disabled={store.items.length <= 0}>Attente</Button>
            </div>
            <div className='flex items-center gap-4'>
                <BonLivraisonSearch />
            </div>
        </div>
        <BonLivraisonFilterResume />
    </div>
}

const BonLivraisonFilterResumeCard = ({ value }: { value: string }) => {
    return <span className='border-2 border-red-600 text-xs px-2 py-1 rounded-md text-red-600 font-semibold bg-red-600/20'>{value}</span>
}

const BonLivraisonFilterResume = () => {
    const store = useEntrepriseBonLivraisonStore()
    if (store.filter.status !== EStatus.ALL) {
        return <></>
    }
    return <ul className='flex items-center gap-4'>
        {

            store.filter.invalide && store.filter.invalide.map((value) => <li key={value}><BonLivraisonFilterResumeCard value={value} /></li>)
        }
        {store.filter.ecart_conformite !== 0 && <li key={'ecart'}><BonLivraisonFilterResumeCard value={`ecart: ${store.filter.ecart_conformite}`} /></li>}
    </ul>
}

const BonLivraisonStatsContainer = () => {
    const store = useEntrepriseBonLivraisonStore()
    const { data, isPending } = useGetBonLivraisonStats(store.periode[0], store.periode[1])

    if (isPending) {
        return <>
            <BonLivraisonStatCard background='bg-primary text-white' text='text-white' title='Total Clients' count={0} />
            <BonLivraisonStatCard background='bg-yellow-200' title='Total BL' count={0} />
            <BonLivraisonStatCard background='bg-green-200' title='BL Valides' count={0} />
            <BonLivraisonStatCard background='bg-gray-200' title='BL En Attente' count={0} />
        </>
    }

    if (!data) {
        return <>
            <BonLivraisonStatCard background='bg-primary text-white' text='text-white' title='Total Clients' count={0} />
            <BonLivraisonStatCard background='bg-yellow-200' title='Total BL' count={0} />
            <BonLivraisonStatCard background='bg-green-200' title='BL Valides' count={0} />
            <BonLivraisonStatCard background='bg-gray-200' title='BL En Attente' count={0} />
        </>
    }



    return <>
        <BonLivraisonStatCard background='bg-primary text-white' text='text-white' title='Total Clients' count={data.results.clients} />
        <BonLivraisonStatCard background='bg-yellow-200' title='Total BL' count={data.results.total} />
        <BonLivraisonStatCard background='bg-green-200' title='BL Valides' count={data.results.valid} />
        <BonLivraisonStatCard background='bg-gray-200' title='BL En Attente' count={data.results.waiting} />
    </>
}


const BonLivraisonButtonContainer = () => {
    const store = useEntrepriseBonLivraisonStore()
    return <div className='flex items-center gap-4'>

        {store.billCart.length > 0 && <DialogActualiserBonLivraison  >

            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                <span><MdCloudDownload />
                </span><span>Actualiser</span>
            </Button>
        </DialogActualiserBonLivraison>}
        {store.billCart.length > 0 && <DialogGenerateFacturesByEntreprise  >

            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                <span><MdCloudDownload />
                </span><span>Générer Factures Selectionnées</span>
            </Button>
        </DialogGenerateFacturesByEntreprise>}
        {!store.billCart.length && <DialogGenerateFactures  >

            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                <span><MdCloudDownload />
                </span><span>Générer Factures</span>
            </Button>
        </DialogGenerateFactures>}
        <DialogLoadBonLivraison >

            <Button variant={"default"} className='bg-primary hover:bg-primary/70'>
                <span><MdCloudDownload />
                </span><span>Charger</span>
            </Button>
        </DialogLoadBonLivraison>
    </div>
}


const BonLivraisonSectionContainer = () => {
    const store = useEntrepriseBonLivraisonStore()
    const searchParams = useSearchParams()
    const { data, isPending } = useGetBonLivraisonStatsByCompany(store.periode[0], store.periode[1])
    const router = useRouter()
    const queryClient = useQueryClient()


    useEffect(() => {

        if (store.event?.status === 'done' && store.periode.length > 0) {
            queryClient.invalidateQueries({ queryKey: ["get-bon-livraison-stats-by-company", store.periode[0], store.periode[1]], exact: true })
            queryClient.invalidateQueries({ queryKey: ["get-bon-livraison-stats", store.periode[0], store.periode[1]], exact: true })
            return
        }
    }, [JSON.stringify(store.event)])


    useEffect(() => {

        if (store.periode.length === 0) {
            return
        }
        if (store.periode.length > 0) {
            router.push(`/m1/bon-livraison?year=${store.periode[0]}&month=${store.periode[1]}`)
            return
        }
    }, [JSON.stringify(store.periode)])

    useEffect(() => {
        if (searchParams.get('year') && searchParams.get('month')) {
            store.setPeriode(searchParams.get('year')!, searchParams.get('month')!)
        }
    }, [searchParams.get('year'), searchParams.get('month')])

    useEffect(() => {


        if (isPending) {

            return
        }
        if (!data) {
            return
        }

        store.setItems(data.result)

    }, [JSON.stringify(data)])


    if (isPending) {
        return <BonLivraisonSection documents={[]} />
    }
    if (!data) {
        return <BonLivraisonSection documents={[]} />
    }

    return <BonLivraisonSection documents={data.result} />
}

const BonLivraisonSection = ({ documents }: { documents: IEntrepriseBonLivraison[] }) => {

    const [dialogBonLivraison, setDialogBonLivraison] = useState(false)

    const store = useEntrepriseBonLivraisonStore()




    return (
        <section className='p-4 text-gray-700'>
            {store.event?.status === 'done' && <DialogGetBonLivraison open={dialogBonLivraison} onOpen={setDialogBonLivraison} />}
            <div className=''>

                <div className='flex items-center justify-between mb-8 '>
                    <div>

                        <h1 className='text-2xl text-[#101010] font-bold'>Bon de Livraison</h1>
                        {store.periode.length > 0 && <h2 className='text-xs'>{getFrenchMonthName(Number(store.periode[1]))} {store.periode[0]}</h2>}
                    </div>
                    <div>
                        <BonLivraisonButtonContainer />
                    </div>

                </div>
                <div className='h-32 mb-4 shadow-none  grid grid-cols-4 gap-4 '>
                    <BonLivraisonStatsContainer />
                </div>
            </div>
            <Card className='p-4 shadow-none'>
                <div>
                    <BonLivraisonFilterSection />
                </div>

                <div>
                    <BonLivraisonTableContainer documents={documents} />
                </div>
            </Card>
        </section>
    )
}



export default BonLivraisonSectionContainer