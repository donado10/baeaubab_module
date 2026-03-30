"use client"

import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

// Required for correct text alignment and avoiding "ghost" heights
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Using a reliable CDN for the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DocumentPDFView({ fileUrl }: { fileUrl: string }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center p-5 w-full ">
            {/* 1. The Scrollable Container with restricted height */}
            <div className='w-full max-w-[600px] h-[600px]  overflow-y-auto bg-gray-100 '>
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<p>Chargement du PDF...</p>}
                >
                    <Page
                        pageNumber={pageNumber}
                        width={600}
                        renderAnnotationLayer={false} // Prevents extra height bugs
                        renderTextLayer={true}
                    />
                </Document>
            </div>

            {/* 2. Pagination Controls */}
            {numPages && (
                <div className="flex items-center gap-4 mt-4 bg-white p-2 rounded shadow">
                    <button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(prev => prev - 1)}
                        className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Précédent
                    </button>
                    <p className="text-sm font-medium">
                        Page {pageNumber} sur {numPages}
                    </p>
                    <button
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(prev => prev + 1)}
                        className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
};