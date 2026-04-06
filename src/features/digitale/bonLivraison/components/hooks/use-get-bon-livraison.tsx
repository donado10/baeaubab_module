import React, { useEffect } from 'react'
import { useEntrepriseBonLivraisonStore } from '../../store/store'
import { useRouter, useSearchParams } from 'next/navigation'
import useGetBonLivraisonStatsByCompany from '../../api/use-get-bon-livraison'
import { useQueryClient } from '@tanstack/react-query'


const useGetBonLivraison = () => {
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


    return [isPending, data] as const

}

export default useGetBonLivraison