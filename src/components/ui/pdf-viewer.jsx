import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button" 
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PDFViewer = ({ url }) => {
    const [numOfPages, setNumOfPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [loading, setLoading] = useState(true)

    const onDocumentLoadSuccess = ({ numOfPages }) => {
        setNumOfPages(numOfPages)
        setLoading(false)
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto p-4 border rounded-lg shadow-sm bg-white">
            <div className="relative min-h-[500px] w-full flex justify-center items-center bg-gray-100 rounded-md overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" /> 
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={null}
                    className="max-w-full"
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                        width={600}
                    />
                </Document>
            </div>

            {/* Thanh điều hướng */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(pageNumber - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                    Trang {pageNumber} / {numOfPages || "--"}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={pageNumber >= numOfPages}
                    onClick={() => setPageNumber(pageNumber + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default PDFViewer;