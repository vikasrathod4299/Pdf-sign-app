import { useState } from "react";
import FileUploader from "../components/FileUploader";
import { Document, Page } from "react-pdf";

const PrepareDocuments = () => {
  const [selectedDoc, setSelectedDoc] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleDrop = (e) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    setSignaturePosition({ left, top });
  };

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  console.log(signaturePosition);
  return (
    <div className="flex">
      <div className="h-screen w-96 p-4">
        <h1 className="text-2xl font-bold mb-8">Prepare Document</h1>
        <div className="flex flex-col gap-y-3">
          <p>Step 1</p>
          <div>
            <FileUploader setSelectedDoc={setSelectedDoc} />
          </div>
          <p>Step 2</p>
          <div>
            <div
              draggable
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="bg-gray-200 rounded-full px-4 w-28 cursor-pointer py-2 font-bold text-black focus:outline-none"
            >
              Add text
            </div>
          </div>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="bg-slate-200 w-full"
      >
        {selectedDoc && (
          <Document
            className={"w-full h-full"}
            file={selectedDoc}
            onLoadSuccess={onLoadSuccess}
          >
            <Page pageNumber={pageNumber} className={"w-full h-full"} />
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
        )}
      </div>
    </div>
  );
};

export default PrepareDocuments;
