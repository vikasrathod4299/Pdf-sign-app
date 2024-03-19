import { useState } from "react";
import { Document, Page } from "react-pdf";
import FileUploader from "../components/FileUploader";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { sendDoc } from "../lib/apiCalls";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const PrepareDocuments = () => {
  const navigate = useNavigate();
  const [model, setModel] = useState(false);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [inputPositions, setInputPositions] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [email, setEmail] = useState("");
  const { mutate: send, isPending } = useMutation({
    mutationFn: sendDoc,
    onSuccess: (res) => {
      setModel(false);
      navigate("/");
    },
    onError: (err) => {
      setError(err.response.data.message);
    },
  });

  const handleDrop = (e, pageIndex) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + e.target.scrollLeft;
    const offsetY = e.clientY - rect.top + e.target.scrollTop;
    const pageHeight = e.target.scrollHeight / numPages;

    const page = pageIndex + 1;
    const pageTop = (page - 1) * pageHeight;
    const pageLeft = 0;
    const adjustedOffsetX = offsetX - pageLeft;
    const adjustedOffsetY = offsetY - pageTop;

    const type = e.dataTransfer.getData("type");

    const newPosition = {
      page,
      left: adjustedOffsetX,
      top: adjustedOffsetY,
      type: type,
    };

    setInputPositions([...inputPositions, newPosition]);
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("type", type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputDragStart = (e, index) => {
    const type = inputPositions[index].type;
    e.dataTransfer.setData("type", type);

    e.dataTransfer.setData("inputIndex", index.toString());
  };

  const handleInputDragEnd = (e, pageIndex) => {
    const index = e.dataTransfer.getData("inputIndex");
    if (index !== "") {
      handleInputDrop(e, pageIndex, parseInt(index));
    }
  };

  const handleInputDrop = (e, pageIndex, index) => {
    e.preventDefault();

    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + e.target.scrollLeft;
    const offsetY = e.clientY - rect.top + e.target.scrollTop;
    const pageHeight = e.target.scrollHeight / numPages;

    const page = pageIndex + 1;
    const pageTop = (page - 1) * pageHeight;
    const pageLeft = 0;
    const adjustedOffsetX = offsetX - pageLeft;
    const adjustedOffsetY = offsetY - pageTop;

    const updatedPositions = [...inputPositions];

    if (updatedPositions[index]) {
      updatedPositions.splice(index, 1);
      console.log(updatedPositions);
    }

    updatedPositions.push({
      page,
      left: adjustedOffsetX,
      top: adjustedOffsetY,
      type: inputPositions[index].type,
    });

    setInputPositions(updatedPositions);
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
                draggable
                onDragStart={(e) => handleInputDragStart(e, index)}
                onDragEnd={(e) => handleInputDragEnd(e, i)}
                onDrop={(e) => handleInputDrop(e, i, index)}
                onDragOver={handleDragOver}
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
    setModel(true);
  };

  const handleSendDoc = () => {
    const data = {
      coordinates: inputPositions,
      doc: selectedDoc,
      email,
    };
    send(data);
  };
  console.log(selectedDoc);
  return (
    <>
      {model && (
        <div className="fixed top-0 left-0 w-full h-full z-10 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-[30%] h-[25%] p-6 justify-between flex flex-col rounded-lg">
            <div className="text-start">
              <h1 className="text-3xl font-thin tracking-wider italic ">
                {"Enter email."}
              </h1>
            </div>
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
                onClick={handleSendDoc}
                className={`${
                  isPending ? "bg-gray-400" : "bg-blue-400 shadow-md"
                }  text-white px-6 py-2 mt-2 rounded-md`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
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
              className="bg-gray-200 rounded-full px-4 w-36 cursor-pointer py-2 font-bold text-black focus:outline-none"
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
    </>
  );
};

export default PrepareDocuments;
