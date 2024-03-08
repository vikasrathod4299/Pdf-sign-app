import React, { useEffect, useState } from "react";
import { Page, Document } from "react-pdf";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const SignDocuments = () => {
  const [selectedDoc, setSelectedDoc] = useState(
    "public/VarunSharma_Resume_1.pdf"
  );
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

  const renderPages = () => {
    const removeInput = (indexToRemove) => {
      setSignaturePositions(
        signaturePositions.filter((_, index) => index !== indexToRemove)
      );
    };

    const handleTextChange = (e, pageIndex) => {
      const { name, value } = e.target;
      setInputTexts((prevState) => ({
        ...prevState,
        [`${pageIndex}_left`]: value,
      }));
    };

    const printTextToPdf = async (pageIndex, textToPrint, position) => {
      try {
        const existingPdfBytes = await fetch(selectedDoc).then((res) =>
          res.arrayBuffer()
        );
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const page = pdfDoc.getPages()[pageIndex];

        const x = position.left;
        const y = page.getHeight() - position.top;

        page.drawText(textToPrint, {
          x,
          y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        saveAs(blob, "modified_document.pdf");
      } catch (error) {
        console.error("Error adding text to PDF:", error);
      }
    };

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
                <input
                  className="border border-gray-500 rounded-full outline-blue-400 p-3"
                  type="text"
                  name="left"
                  placeholder="Enter text here"
                  onChange={(e) => handleTextChange(e, i)}
                  value={inputTexts[`${i}_left`] || ""}
                />
                <button
                  className="bg-gray-500 rounded-full text-white w-4 h-4 flex items-center pb-1 font-semibold justify-center absolute top-2 right-2 -mt-2 -mr-2"
                  onClick={() => removeInput(index)}
                >
                  x
                </button>
              </div>
            ) : null
          )}
          <div
            className="bg-gray-200 rounded-full px-4 w-28 cursor-pointer py-2 font-bold text-black focus:outline-none"
            onClick={() =>
              printTextToPdf(i, inputTexts[`${i}_left`], signaturePositions[i])
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
