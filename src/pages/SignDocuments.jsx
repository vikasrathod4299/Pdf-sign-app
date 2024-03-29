import React, { useEffect, useState, useRef } from "react";
import { Page, Document } from "react-pdf";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";
import { Pencil2Icon } from "@radix-ui/react-icons";

const SignDocuments = () => {
  const [selectedDoc, setSelectedDoc] = useState("public/demo.pdf");
  const [signaturePositions, setSignaturePositions] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [inputTexts, setInputTexts] = useState({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureIndex, setCurrentSignatureIndex] = useState(null);
  const [signatureImages, setSignatureImages] = useState([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("coordinates");
      if (data) {
        const pdfData = JSON.parse(data);
        setSignaturePositions(pdfData);
        setSignatureImages(Array(pdfData.length).fill(null)); // Initialize signatureImages state
      }
    } catch (error) {
      console.error(
        "Error retrieving or parsing data from localStorage:",
        error
      );
    }
  }, []);

  const signatureRef = useRef([]);

  const handleTextChange = (e, pageIndex) => {
    const { value } = e.target;
    setInputTexts((prevInputTexts) => ({
      ...prevInputTexts,
      [pageIndex]: value,
    }));
  };

  const openSignatureModal = (index) => {
    setShowSignatureModal(true);
    setCurrentSignatureIndex(index);
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setCurrentSignatureIndex(null);
  };

  const addSignature = () => {
    if (currentSignatureIndex !== null) {
      const signatureCanvas = signatureRef.current[currentSignatureIndex];
      if (signatureCanvas) {
        const newSignatureImages = [...signatureImages];
        newSignatureImages[currentSignatureIndex] = signatureCanvas
          .getTrimmedCanvas()
          .toDataURL();
        setSignatureImages(newSignatureImages);
        closeSignatureModal();
      }
    }
  };

  const printToPdf = async () => {
    try {
      const existingPdfBytes = await fetch(selectedDoc).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let index = 0; index < signaturePositions.length; index++) {
        const input = signaturePositions[index];
        const page = pdfDoc.getPage(input.page - 1);
        const x = input.left;
        const y = page.getHeight() - input.top - 25;

        if (input.type === "text") {
          const textToPrint = inputTexts[index] || ""; // Ensure textToPrint is not undefined
          page.drawText(textToPrint, {
            x,
            y,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        } else if (input.type === "signature") {
          if (signatureImages[index]) {
            // Check if signature image is available
            const signatureImageBytes = await fetch(
              signatureImages[index]
            ).then((res) => res.arrayBuffer());
            const signatureImageObj = await pdfDoc.embedPng(
              signatureImageBytes
            );
            page.drawImage(signatureImageObj, {
              x,
              y,
              width: 80,
              height: 30,
            });
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      saveAs(blob, "modified_document.pdf");
    } catch (err) {
      console.log(err);
    }
  };

  const renderPages = () => {
    const pages = [];
    for (let i = 0; i < numPages; i++) {
      pages.push(
        <div key={i} style={{ position: "relative" }}>
          <Page pageNumber={i + 1} renderTextLayer={false} />
          {signaturePositions.map((position, index) =>
            position.page === i + 1 ? (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                }}
              >
                {position.type === "text" && (
                  <input
                    className="border border-gray-500 rounded-md outline-blue-400  p-3"
                    type="text"
                    name="left"
                    placeholder="Enter text here"
                    onChange={(e) => handleTextChange(e, index)}
                    value={inputTexts[index] || ""}
                  />
                )}
                {position.type === "signature" && (
                  <>
                    {signatureImages[index] ? (
                      <img
                        src={signatureImages[index]}
                        width={100}
                        height={50}
                        alt="Signature"
                      />
                    ) : (
                      <button
                        onClick={() => openSignatureModal(index)}
                        className="bg-gray-200 rounded-md px-4 py-2"
                      >
                        Add Signature
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : null
          )}
        </div>
      );
    }
    return pages;
  };

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="flex " style={{ height: "calc(100vh - 64px)" }}>
      <div className="w-96 p-4">
        <h1 className="text-2xl font-bold mb-8">Prepare Document</h1>
        <div className="flex flex-col gap-y-4">
          <button
            onClick={printToPdf}
            className="bg-gray-200 w-44 gap-x-2 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none"
          >
            Complete sign <Pencil2Icon />
          </button>
        </div>
      </div>

      <div
        className="w-full bg-slate-300 overflow-y-auto"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <Document file={selectedDoc} onLoadSuccess={onLoadSuccess}>
          <div className="flex flex-col justify-center items-center">
            {renderPages()}
          </div>
        </Document>
      </div>

      {showSignatureModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg">
            <SignatureCanvas
              ref={(ref) => (signatureRef.current[currentSignatureIndex] = ref)}
              canvasProps={{
                className:
                  "border border-gray-500 rounded-md bg-white hover:cursor-crosshair",
                width: 300,
                height: 150,
              }}
            />
            <div className="flex gap-x-2 items-center justify-end">
              <button
                onClick={addSignature}
                className="bg-blue-500 shadow-md text-white px-4 py-2 mt-2 rounded-md"
              >
                Enter
              </button>
              <button
                onClick={closeSignatureModal}
                className="bg-gray-400 shadow-md text-white px-4 py-2 mt-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignDocuments;
