import { BonLivraisonDetailSectionContainer } from '@/features/digitale/bonLivraison/components/routes/BonLivraisonDetailSection';
import BonLivraisonSection from '@/features/digitale/bonLivraison/components/routes/BonLivraisonSection';
import React from 'react'

type Props = {}

const page = async ({ params }: { params: Promise<{ slug: string }>; }) => {
    const { slug } = await params;


    return (
        <div className='min-h-screen'><BonLivraisonDetailSectionContainer /></div>
    )
}

export default page