'use client'
import React from 'react'
import { useEntrepriseBonLivraisonStore } from '../store/store'
import { Input } from '@/components/ui/input'
import { GoDotFill } from 'react-icons/go';
import { cn, formatNumberToFrenchStandard } from '@/lib/utils';


const StatusDisplay = ({ value }: { value: string }) => {
    const MStatusDisplay = new Map<string, string>([
        ["1", "bg-green-600/20 border-2 border-green-600 "],
        ["2", "bg-red-600/20  border-2 border-red-600"],
    ]);
    const MStatusDisplayColor = new Map<string, string>([
        ["1", "#00a63e"],
        ["2", "#e7000b"],
    ]);
    const MStatusDisplayTextColor = new Map<string, string>([
        ["1", "text-green-600"],
        ["2", "text-[#e7000b]"],
    ]);
    const MStatusText = new Map<string, string>([
        ["1", "Valide"],
        ["2", "Supprimé"],
    ]);

    return (
        <div
            className={cn(
                "capitalize rounded-md px-4  font-semibold flex items-center gap-2  ",
                MStatusDisplay.get(value.toString())
            )}
        >
            <h1 className={cn(MStatusDisplayTextColor.get(value.toString()))}>

                {MStatusText.get(value.toString())}
            </h1>
        </div>
    );
};

const Search = () => {
    const store = useEntrepriseBonLivraisonStore()
    return <div className='flex items-center gap-4'>
        <Input disabled={store.items.length <= 0} onChange={(e) => store.setFilter({ ...store.filter, search: { ...store.filter.search, value: e.currentTarget.value } })} className='w-full border border-gray-500 ' placeholder='Rechercher' />

    </div>
}

const BonLivraisonListe = ({ status, totalht, ref, idClient, intituleClient }: { status: string, totalht: number, ref: string, idClient: number, intituleClient: string }) => {
    return <div className='w-full h-40  border-b border-gray-500 p-8 flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
            <StatusDisplay value={status} />
            <span className='font-bold'>{formatNumberToFrenchStandard(totalht)} FCFA</span>
        </div>
        <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold'>REF-{ref}</h2>
                <span>19-03-2026</span>
            </div>
            <div className='flex gap-4'>
                <span className='border-r-2 border-gray-500 pr-2'>{idClient}</span>
                <span>{intituleClient}</span>
            </div>
        </div>
    </div>
}

const BonLivraisonDetailSection = () => {
    return (
        <main className='flex items-center w-full min-h-screen border border-gray-500  '>
            <div className='w-2/7 h-screen border-r border-gray-500  '>
                <div className='border-b border-gray-500 p-8'>
                    <h1 className='text-2xl font-bold mb-4'>Bon de Livraisons</h1>
                    <div>
                        <Search />
                    </div>
                </div>
                <BonLivraisonListe idClient={1284} intituleClient='IGF Services Sicap Foire' ref='225687' status='1' totalht={2500} />
                <BonLivraisonListe idClient={1284} intituleClient='IGF Services Sicap Foire' ref='225686' status='2' totalht={1900} />
            </div>
            <div className='w-5/7 h-full'>

            </div>
        </main>
    )
}

export default BonLivraisonDetailSection