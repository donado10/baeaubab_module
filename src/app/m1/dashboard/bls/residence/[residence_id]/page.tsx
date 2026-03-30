import { BonLivraisonResidenceDetailSectionContainer } from '@/features/digitale/bonLivraison/components/BonLivraisonDetailSection';

import React from 'react'


const page = async ({ params }: { params: Promise<{ slug: string }>; }) => {

    return (
        <div className='min-h-screen'><BonLivraisonResidenceDetailSectionContainer /></div>
    )
}

export default page