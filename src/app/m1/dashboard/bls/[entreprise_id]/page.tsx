import React from 'react'

type Props = {}

const page = async ({ params }: { params: Promise<{ slug: string }>; }) => {
    const { slug } = await params;

    console.log(slug)

    return (
        <div>page</div>
    )
}

export default page