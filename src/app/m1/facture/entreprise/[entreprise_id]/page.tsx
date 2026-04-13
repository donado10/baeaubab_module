import { FactureDetailSectionContainer } from '@/features/digitale/bills/components/routes/FactureDetailSection';
import React from 'react'

type Props = {}

const page = async ({ params }: { params: Promise<{ slug: string }>; }) => {
    const { slug } = await params;


    return (
        <div className='min-h-screen'><FactureDetailSectionContainer /></div>
    )
}

export default page