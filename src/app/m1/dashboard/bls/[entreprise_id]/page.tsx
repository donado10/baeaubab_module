import BonLivraisonDetailSection from '@/features/digitale/bonLivraison/components/BonLivraisonDetailSection';
import BonLivraisonSection from '@/features/digitale/bonLivraison/components/BonLivraisonSection';
import React from 'react'

type Props = {}

const page = async ({ params }: { params: Promise<{ slug: string }>; }) => {
    const { slug } = await params;

    console.log(slug)

    return (
        <div className='min-h-screen'><BonLivraisonDetailSection /></div>
    )
}

export default page