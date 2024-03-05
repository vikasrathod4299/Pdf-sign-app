import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [signaturePosition, setSignaturePosition] = useState(null);

  const handleDrop = (event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    setSignaturePosition({ left, top });
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        {/* Left sidebar */}
        <input type="file" onChange={onFileChange} />
        {/* You can place your draggable div or input here */}
        <div
          className="mt-4 p-4 bg-gray-200 rounded-lg"
          draggable
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          Draggable Signature
        </div>
      </div>
      <div
        className="w-3/4 p-4 relative bg-gray-100"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        {/* PDF Viewer */}
        {pdfFile && (
          <div className="w-full h-full flex justify-center items-center ">
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full h-full"
            >
              <Page pageNumber={pageNumber} className="w-full" />
              {signaturePosition && (
                <input
                  type="text"
                  className="border border-gray-300 absolute"
                  style={{
                    left: `${signaturePosition.left}px`,
                    top: `${signaturePosition.top}px`,
                  }}
                />
              )}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
