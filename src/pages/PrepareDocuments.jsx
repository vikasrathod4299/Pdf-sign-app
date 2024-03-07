import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import FileUploader from "../components/FileUploader";

import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

const PrepareDocuments = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [signaturePositions, setSignaturePositions] = useState([]);
  const [numPages, setNumPages] = useState(null);

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

    setSignaturePositions([
      ...signaturePositions,
      { page, left: adjustedOffsetX, top: adjustedOffsetY },
    ]);
  };

  const handleInputChange = (e, index) => {};

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnInput = (e, pageIndex) => {
    e.preventDefault();
    const index = parseInt(e.dataTransfer.getData("index"));
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + e.target.scrollLeft;
    const offsetY = e.clientY - rect.top + e.target.scrollTop;
    const pageHeight = e.target.scrollHeight / numPages;

    const page = pageIndex + 1;
    const pageTop = (page - 1) * pageHeight;
    const pageLeft = 0; // Assuming pages are always aligned to the left
    const adjustedOffsetX = offsetX - pageLeft;
    const adjustedOffsetY = offsetY - pageTop;

    const updatedPositions = [...signaturePositions];
    updatedPositions[index] = {
      ...updatedPositions[index],
      page,
      left: adjustedOffsetX,
      top: adjustedOffsetY,
    };
    setSignaturePositions(updatedPositions);
  };

  const renderPages = () => {
    const pages = [];
    for (let i = 0; i < numPages; i++) {
      pages.push(
        <div
          key={i}
          onDrop={(e) => handleDrop(e, i)}
          onDragOver={(e) => e.preventDefault()}
          style={{ position: "relative" }}
        >
          <Page pageNumber={i + 1} renderTextLayer={false} />
          {signaturePositions.map((position, index) =>
            position.page === i + 1 ? (
              <input
                className="border border-gray-500 rounded-full outline-blue-400 p-3"
                key={index}
                type="text"
                name="left"
                onChange={(e) => handleInputChange(e, index)}
                style={{
                  position: "absolute",
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnInput(e, i)}
                placeholder="Enter text here"
              />
            ) : null
          )}
        </div>
      );
    }
    return pages;
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
          >
            Add text
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
