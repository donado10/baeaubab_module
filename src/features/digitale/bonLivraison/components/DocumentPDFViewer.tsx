import { Document, Page } from "react-pdf";
import { Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";

import { pdfjs } from "react-pdf";
import { createTw } from "@hyperline/react-pdf-tailwind";
import { useState } from "react";

// The 'theme' object is your Tailwind theme config
const tw = createTw({
    theme: {
        fontFamily: {
            sans: ["Comic Sans"],
        },
        extend: {
            colors: {
                custom: "#bada55",
            },
        },
    },
});


export function DocumentPDFView() {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    const fileUrl = "/sample.pdf";

    function onLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
    ).toString();


    return (
        <div>


            <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
                <Page size="A4" pageNumber={pageNumber}
                    style={tw("p-4 flex flex-row flex-wrap gap-4 border-none")}>
                    {[...Array(12)].map((_, i) => (
                        <View
                            key={i}
                            style={tw("flex-1 min-w-[200pt] p-4 flex-col bg-blue-100")}
                            wrap={false}
                        >
                            <Text style={tw("text-2xl font-bold text-custom")}>
                                Section {i + 1}
                            </Text>
                            <Text style={tw("text-sm")}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                                semper efficitur libero in laoreet. Sed iaculis, magna suscipit
                                placerat commodo, risus turpis tincidunt ligula, ac euismod
                                justo sem id risus. Nullam euismod vestibulum leo, mollis
                                maximus sapien luctus in. Vivamus malesuada vulputate ornare.
                                Mauris ut accumsan felis. Vivamus enim urna, ultrices eu eros
                                ac, bibendum vehicula eros. Praesent ipsum orci, molestie
                                gravida tristique at, dapibus vitae est. Phasellus lectus nulla,
                                consequat eu mi ut, tempus pulvinar neque.
                            </Text>
                        </View>
                    ))}
                </Page>
            </Document>
            <button onClick={() => setPageNumber((p) => p - 1)}>
                Prev
            </button>
            <button onClick={() => setPageNumber((p) => p + 1)}>
                Next
            </button>
        </div>
    );
}