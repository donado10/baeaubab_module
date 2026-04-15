import React, { useEffect } from 'react'
import { useEntrepriseBonLivraisonStore } from '../../store/store'
import { useRouter, useSearchParams } from 'next/navigation'
import useGetBonLivraisonStatsByCompany from '../../api/use-get-bon-livraison'


const useGetBonLivraison = () => {
    const store = useEntrepriseBonLivraisonStore()
    const searchParams = useSearchParams()
    const { data, isPending } = useGetBonLivraisonStatsByCompany(store.periode[0], store.periode[1])
    const router = useRouter()


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