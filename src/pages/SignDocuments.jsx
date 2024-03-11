import { useEffect, useState, useRef } from "react";
import { Page, Document } from "react-pdf";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";

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

  const signatureRef = useRef([]);

  const handleTextChange = (e, pageIndex) => {
    const { value } = e.target;
    console.log(pageIndex);
    setInputTexts((p) => ({ ...p, [pageIndex]: value }));
  };

  const printToPdf = async () => {
    try {
      const existingPdfBytes = await fetch(selectedDoc).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      signaturePositions.forEach(async (input, index) => {
        const page = pdfDoc.getPage(input.page - 1);
        const x = input.left;
        const y = page.getHeight() - input.top - 25;
        if (input.type === "text") {
          const textToPrint = inputTexts[index];
          console.log(x, y, textToPrint);
          page.drawText(textToPrint, {
            x,
            y,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        } else if (input.type === "signature") {
          const signatureDataUrl = signatureRef.current[index].toDataURL();
          const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
          page.drawImage(signatureImage, {
            x,
            y,
            width: 100,
            height: 50,
          });
        }
      });

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
                  <SignatureCanvas
                    ref={(ref) => (signatureRef.current[index] = ref)}
                    canvasProps={{
                      className:
                        "border border-gray-500 rounded-md bg-white hover:cursor-crosshair",
                      width: 300,
                      height: 150,
                    }}
                  />
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
          <button className="bg-gray-200 w-28 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none">
            Next <ChevronRightIcon className="w-4 h-4 font-bold" />
          </button>
          <button className="bg-gray-200 w-36 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none">
            Previous{" "}
            <ChevronLeftIcon className="className=" w-4 h-4 font-bold />
          </button>
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
    </div>
  );
};

export default SignDocuments;
