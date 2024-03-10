import { useState, useRef } from "react";
import { Document, Page } from "react-pdf";
import FileUploader from "../components/FileUploader";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";

const PrepareDocuments = () => {
  const navigate = useNavigate();

  const [selectedDoc, setSelectedDoc] = useState("public/demo.pdf");
  const [inputPositions, setInputPositions] = useState([]);
  const [numPages, setNumPages] = useState(null);

  const signatureRef = useRef(null);

  const handleDrop = (e, pageIndex) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + e.target.scrollLeft;
    const offsetY = e.clientY - rect.top + e.target.scrollTop;
    const pageHeight = e.target.scrollHeight / numPages;

    const page = pageIndex + 1;
    const pageTop = (page - 1) * pageHeight;
    const pageLeft = 0; // Assuming pages are always aligned to the left
    const adjustedOffsetX = offsetX - pageLeft;
    const adjustedOffsetY = offsetY - pageTop;

    const type = e.dataTransfer.getData("type"); // Get the type of the dragged item

    const newPosition = {
      page,
      left: adjustedOffsetX,
      top: adjustedOffsetY,
      type: type, // Assign the type of input
    };

    setInputPositions([...inputPositions, newPosition]);
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("type", type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderPages = () => {
    const removeInput = (indexToRemove) => {
      setInputPositions(
        inputPositions.filter((_, index) => index !== indexToRemove)
      );
    };

    const pages = [];
    for (let i = 0; i < numPages; i++) {
      pages.push(
        <div
          key={i}
          onDrop={(e) => handleDrop(e, i)}
          onDragOver={handleDragOver}
          style={{ position: "relative" }}
        >
          <Page pageNumber={i + 1} renderTextLayer={false} />
          {inputPositions
            .filter((pos) => pos.page === i + 1)
            .map((position, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                }}
              >
                <div className="bg-gray-400 py-2 px-3 font-bold tracking-wider gap-x-2 cursor-grab text-white rounded-md flex items-center active:cursor-grabbing">
                  <DragHandleDots2Icon className="h-5 w-5" />
                  {position.type}
                </div>
                {/* <button
                  className="rounded-full text-white w-4 h-4 flex items-center pb-1 font-semibold justify-center absolute top-2 right-2 -mt-2 -mr-2"
                  onClick={() => removeInput(index)}
                >
                  x
                </button> */}
              </div>
            ))}
        </div>
      );
    }
    return pages;
  };

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleContinue = () => {
    localStorage.setItem("coordinates", JSON.stringify(inputPositions));
    navigate("/signDocument");
  };

  return (
    <div className="flex " style={{ height: "calc(100vh - 64px)" }}>
      <div className="w-96 p-4">
        <h1 className="text-2xl font-bold mb-8">Prepare Document</h1>
        <div className="flex flex-col gap-y-3">
          <p>Step 1</p>
          <div>
            <FileUploader setSelectedDoc={setSelectedDoc} />
          </div>
          <p>Step 2</p>
          <div
            draggable
            className="bg-gray-200 rounded-full px-4 w-28 cursor-pointer py-2 font-bold text-black focus:outline-none"
            onDragStart={(e) => handleDragStart(e, "text")}
          >
            Add text
          </div>
          <div
            draggable
            className="bg-gray-200 rounded-full px-4 w-28 cursor-pointer py-2 font-bold text-black focus:outline-none"
            onDragStart={(e) => handleDragStart(e, "signature")}
          >
            Add signature
          </div>

          <div
            onClick={handleContinue}
            className="bg-gray-200 mt-8 rounded-full px-4 w-28 cursor-pointer py-2 font-bold text-black focus:outline-none"
          >
            Continue
          </div>
        </div>
      </div>

      <div
        className="w-full bg-slate-300 overflow-y-auto"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {selectedDoc && (
          <Document file={selectedDoc} onLoadSuccess={onLoadSuccess}>
            <div className="flex flex-col justify-center items-center">
              {renderPages()}
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};

export default PrepareDocuments;
