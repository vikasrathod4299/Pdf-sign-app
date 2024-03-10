import React, { useEffect, useState, useRef } from "react";
import { Page, Document } from "react-pdf";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";

const SignDocuments = () => {
  const [selectedDoc, setSelectedDoc] = useState("public/demo.pdf");
  const [signaturePositions, setSignaturePositions] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [inputTexts, setInputTexts] = useState({});

  useEffect(() => {
    try {
      const data = localStorage.getItem("coordinates");
      if (data) {
        const pdfData = JSON.parse(data);
        setSignaturePositions(pdfData);
      }
    } catch (error) {
      console.error(
        "Error retrieving or parsing data from localStorage:",
        error
      );
    }
  }, []);

  const signatureRef = useRef(null);

  const handleTextChange = (e, pageIndex) => {
    const { value } = e.target;
    setInputTexts((prevState) => ({
      ...prevState,
      [`${pageIndex}_left`]: value,
    }));
  };
  const printToPdf = async (pageIndex) => {
    try {
      const existingPdfBytes = await fetch(selectedDoc).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.getPages()[pageIndex];

      signaturePositions.forEach(async (position) => {
        if (position.page === pageIndex + 1) {
          const x = position.left;
          const y = page.getHeight() - position.top - 5;

          if (position.type === "text") {
            const textToPrint = inputTexts[`${pageIndex}_left`] || "";
            page.drawText(textToPrint, {
              x,
              y,
              size: 12,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
          } else if (position.type === "signature") {
            const signatureDataUrl = signatureRef.current.toDataURL();
            const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
            page.drawImage(signatureImage, {
              x,
              y,
              width: 100,
              height: 50,
            });
          }
        }
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      saveAs(blob, "modified_document.pdf");
    } catch (error) {
      console.error("Error adding text/signature to PDF:", error);
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
                    className="border border-gray-500 rounded-full outline-blue-400 p-3"
                    type="text"
                    name="left"
                    placeholder="Enter text here"
                    onChange={(e) => handleTextChange(e, i)}
                    value={inputTexts[`${i}_left`] || ""}
                  />
                )}
                {position.type === "signature" && (
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "border border-gray-500 rounded-md bg-white",
                      width: 300,
                      height: 150,
                    }}
                  />
                )}
              </div>
            ) : null
          )}
          <div
            className="bg-blue-400 text-center text-white rounded-full px-4 w-28 cursor-pointer py-2 font-bold focus:outline-none"
            onClick={() =>
              printToPdf(
                i,
                signaturePositions.find((pos) => pos.page === i + 1)
              )
            }
          >
            Next
          </div>
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
        <div className="flex flex-col gap-y-3"></div>
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
    </div>
  );
};

export default SignDocuments;
