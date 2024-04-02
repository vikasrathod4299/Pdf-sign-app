import { useState } from "react";
import { Document, Page } from "react-pdf";
import FileUploader from "../components/FileUploader";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { sendDoc } from "../lib/apiCalls";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import Draggable from "../components/shared/Draggable";
import Model from "../components/shared/Model/Model";

const EnterEmailPopUp = ({ setModel, error, handleSendDoc, isPending }) => {
  const [email, setEmail] = useState("");
  <>
    <h1 className="text-3xl font-thin tracking-wider italic ">
      {"Enter email."}
    </h1>
    <div className="flex flex-col text-sm">
      <input
        type="email"
        value={email}
        className=" border-2 border-blue-400 p-2 rounded-md outline-2 outline-blue-400"
        placeholder={"Enter employee's email address."}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
    <div className="flex gap-x-2 justify-end">
      <button
        onClick={() => setModel(false)}
        className="bg-gray-400 shadow-md text-white px-4 py-2 mt-2 rounded-md"
      >
        Cancel
      </button>
      <button
        onClick={() => handleSendDoc(email)}
        className={`${
          isPending ? "bg-gray-400" : "bg-blue-400 shadow-md"
        }  text-white px-6 py-2 mt-2 rounded-md`}
      >
        Send
      </button>
    </div>
  </>;
};

const PrepareDocuments = () => {
  const navigate = useNavigate();
  const [model, setModel] = useState(false);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [inputPositions, setInputPositions] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const { mutate: send, isPending } = useMutation({
    mutationFn: sendDoc,
    onSuccess: () => {
      setModel(false);
      navigate("/");
    },
    onError: (err) => {
      setError(err.response.data.message);
    },
  });

  const handleDrop = (e, pageIndex) => {
    e.preventDefault();
    const inputIndex = e.dataTransfer.getData("inputIndex");
    if (!inputIndex) {
      const rect = e.target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left + e.target.scrollLeft;
      const offsetY = e.clientY - rect.top + e.target.scrollTop;
      const pageHeight = e.target.scrollHeight / numPages;

      const page = pageIndex + 1;
      const pageTop = (page - 1) * pageHeight;
      const pageLeft = 0;
      const adjustedOffsetX = offsetX - pageLeft;
      const adjustedOffsetY = offsetY - pageTop + pageIndex * pageHeight;

      const type = e.dataTransfer.getData("type");
      const newPosition = {
        page,
        left: adjustedOffsetX,
        top: adjustedOffsetY,
        type: type,
      };

      setInputPositions([...inputPositions, newPosition]);
    } else {
      // Handle the case when inputIndex is provided (repositioning an existing input)
      const rect = e.target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left + e.target.scrollLeft;
      const offsetY = e.clientY - rect.top + e.target.scrollTop;
      const pageHeight = e.target.scrollHeight / numPages;

      const page = pageIndex + 1;
      const pageTop = (page - 1) * pageHeight;
      const pageLeft = 0;
      const adjustedOffsetX = offsetX - pageLeft;
      const adjustedOffsetY = offsetY - pageTop + pageIndex * pageHeight;

      const type = e.dataTransfer.getData("type");
      const newPosition = {
        page,
        left: adjustedOffsetX,
        top: adjustedOffsetY,
        type: type,
      };
      const updatedData = inputPositions.map((pos, index) =>
        index === parseInt(inputIndex) ? newPosition : pos
      );

      setInputPositions(updatedData);
    }
  };

  const handleDragStart = (e, type, index = null) => {
    e.dataTransfer.setData("type", type);
    if (index || index === 0) {
      e.dataTransfer.setData("inputIndex", index?.toString());
    }
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
              <Draggable
                handleDragStart={handleDragStart}
                index={index}
                key={index}
                type={position.type}
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
                <button
                  className="rounded-full text-white w-4 h-4 flex items-center pb-1 font-semibold justify-center absolute top-2 right-2 -mt-2 -mr-2"
                  onClick={() => removeInput(index)}
                >
                  x
                </button>
              </Draggable>
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
    setModel(true);
  };

  const handleSendDoc = (email) => {
    const data = {
      coordinates: inputPositions,
      doc: selectedDoc,
      email,
    };
    send(data);
  };

  return (
    <>
      {model && (
        <Model>
          <EnterEmailPopUp
            setModel={setModel}
            error={error}
            isPending={isPending}
            handleSendDoc={handleSendDoc}
          />
        </Model>
      )}
      <div className="flex " style={{ height: "calc(100vh - 64px)" }}>
        {/* Left bar */}
        <div className="w-96 p-4">
          <h1 className="text-2xl font-bold mb-8">Prepare Document</h1>
          <div className="flex flex-col gap-y-3">
            <p>Step 1</p>
            <FileUploader setSelectedDoc={setSelectedDoc} />
            <p>Step 2</p>
            <Draggable
              handleDragStart={handleDragStart}
              type={"text"}
              className="bg-gray-200 rounded-full px-4 w-44 cursor-pointer py-2 font-bold text-black focus:outline-none"
            >
              Add text ✏
            </Draggable>
            <Draggable
              handleDragStart={handleDragStart}
              type={"signature"}
              className="bg-gray-200 rounded-full px-4 w-44 cursor-pointer py-2 font-bold text-black focus:outline-none"
            >
              Add signature ✍
            </Draggable>
            <Button onClick={handleContinue}>Continue ▶</Button>
          </div>
        </div>

        {/* Main container */}
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
    </>
  );
};

export default PrepareDocuments;
