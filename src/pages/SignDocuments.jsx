import { useEffect, useState, useRef } from "react";
import { Page, Document } from "react-pdf";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";
import { InfoCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { addSign, getDocToSign } from "../lib/apiCalls";
import CedarvilleCursive from "/public/CedarvilleCursive-Regular.ttf";
import fontkit from "@pdf-lib/fontkit"; // Import fontkit

const SignDocuments = () => {
  const { id } = useParams();
  const [signaturePositions, setSignaturePositions] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [inputTexts, setInputTexts] = useState({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureIndex, setCurrentSignatureIndex] = useState(null);
  const [signatureImages, setSignatureImages] = useState([]);
  const [confirmModel, setConfirmModel] = useState(false);
  const [signatureType, setSignatureType] = useState("canvas");
  const queryClient = useQueryClient();
  const [textSignature, setTextSignature] = useState("");
  const { data: docData, isPending: docIsPending } = useQuery({
    queryKey: ["fetchDocData", id],
    queryFn: getDocToSign,
    enabled: !!id,
    onSuccess: (res) => {
      console.log(res);
    },
  });

  const { mutate: completeSign } = useMutation({
    mutationFn: addSign,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["fetchDocData", id] });
      setConfirmModel(false);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    try {
      if (!docIsPending) {
        if (docData?.data?.data) {
          const data = docData?.data?.data;
          setSignaturePositions(
            data.coordinates.map((item) => {
              return {
                left: parseFloat(item.left),
                top: parseFloat(item.top),
                page: parseInt(item.page),
                type: item.type,
              };
            })
          );
          setSignatureImages(Array(data.coordinates.length).fill(null));
        }
      }
    } catch (error) {
      console.error(
        "Error retrieving or parsing data from localStorage:",
        error
      );
    }
  }, [docData]);

  const signatureRef = useRef([]);

  const handleTextChange = (e, pageIndex) => {
    const { value } = e.target;
    setInputTexts((prevInputTexts) => ({
      ...prevInputTexts,
      [pageIndex]: value,
    }));
  };

  const openSignatureModal = (index, signatureDataURL) => {
    setShowSignatureModal(true);
    setCurrentSignatureIndex(index);
    if (signatureDataURL) {
      // Load the previously added signature onto the canvas
      const signatureCanvas = signatureRef.current[index];
      if (signatureCanvas) {
        signatureCanvas.fromDataURL(signatureDataURL);
      }
    }
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setCurrentSignatureIndex(null);
  };

  const addSignature = (type) => {
    if (currentSignatureIndex !== null) {
      const signatureCanvas = signatureRef.current[currentSignatureIndex];

      if (signatureCanvas) {
        if (type === "canvas") {
          const newSignatureImages = [...signatureImages];
          newSignatureImages[currentSignatureIndex] = {
            type,
            value: signatureCanvas.getTrimmedCanvas().toDataURL(),
          };
          setSignatureImages(newSignatureImages);
        } else if (type === "text") {
          const newSignatureImages = [...signatureImages];
          newSignatureImages[currentSignatureIndex] = {
            type,
            value: signatureCanvas.value,
          };
          setSignatureImages(newSignatureImages);
        }
        closeSignatureModal();
      }
    }
  };
  const printToPdf = async () => {
    try {
      const existingPdfBytes = await fetch(
        `${import.meta.env.VITE_SERVER_API}/uploads/${
          docData.data.data.docUrl
        }`,
        { method: "GET" }
      ).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
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
            if (signatureImages[index].type === "canvas") {
              const signatureImageBytes = await fetch(
                signatureImages[index].value
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
            } else {
              const fontBytes = await fetch(CedarvilleCursive).then((res) =>
                res.arrayBuffer()
              );
              const textToPrint = signatureImages[index].value || "";
              const customFont = await pdfDoc.embedFont(fontBytes);

              page.setFont(customFont);
              page.drawText(textToPrint, {
                x,
                y,
                size: 24,
                color: rgb(0, 0, 0),
              });
            }
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      // completeSign({ id: docData.data.data._id, doc: blob });
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
                      <div className="flex gap-x-2 items-center">
                        {signatureImages[index].type === "canvas" ? (
                          <img
                            className="border border-blue-400"
                            src={signatureImages[index].value}
                            width={100}
                            height={50}
                            alt="Signature"
                          />
                        ) : (
                          <p className="font-cursive font-bold text-xl">
                            {signatureImages[index].value}
                          </p>
                        )}
                        <button
                          onClick={() =>
                            openSignatureModal(index, signatureImages[index])
                          }
                          className="bg-blue-400/80 rounded-full h-6 w-6 p-1 flex justify-center items-center"
                        >
                          <Pencil1Icon className="text-white w-6 h-6 font-bold" />
                        </button>
                      </div>
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
        <div className="flex flex-col gap-y-4">
          <button className="bg-gray-200 w-44 gap-x-2 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none">
            Next ⏭ {/*<Pencil2Icon /> */}
          </button>
          <button className="bg-gray-200 w-44 gap-x-2 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none">
            Previous ⏮ {/*<Pencil2Icon /> */}
          </button>

          <button
            onClick={() => {
              setConfirmModel(true);
            }}
            disabled={docData?.data?.data.status !== "pending"}
            className="bg-gray-200 w-44 gap-x-2 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none"
          >
            Complete sign ✍ {/*<Pencil2Icon /> */}
          </button>
        </div>
      </div>

      <div
        className="w-full bg-slate-300 overflow-y-auto"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {!docIsPending && docData?.data?.data.status === "pending" ? (
          <Document
            file={`${import.meta.env.VITE_SERVER_API}/uploads/${
              docData?.data?.data.docUrl
            }`}
            onLoadSuccess={onLoadSuccess}
          >
            <div className="flex flex-col justify-center items-center">
              {renderPages()}
            </div>
          </Document>
        ) : (
          !docIsPending && (
            <div className="flex  justify-center items-center h-full w-full">
              <h1 className="font-extrabold tracking-widest text-3xl text-slate-600/20 italic ">
                Thank you for signature!
              </h1>
            </div>
          )
        )}
      </div>

      {showSignatureModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex  justify-center items-center">
          <div className="bg-white p-4 flex flex-col  rounded-lg">
            <div className="flex gap-x-4 my-2 self-center">
              <p
                className={`${
                  signatureType === "canvas" ? "border-b-4 border-blue-400" : ""
                } cursor-pointer`}
                onClick={() => setSignatureType("canvas")}
              >
                Canvas
              </p>
              <p
                className={`${
                  signatureType === "text" ? "border-b-4 border-blue-400" : ""
                } cursor-pointer`}
                onClick={() => setSignatureType("text")}
              >
                Text
              </p>
            </div>
            {signatureType === "canvas" ? (
              <SignatureCanvas
                ref={(ref) =>
                  (signatureRef.current[currentSignatureIndex] = ref)
                }
                canvasProps={{
                  className:
                    "border border-gray-500 rounded-md bg-white hover:cursor-crosshair",
                  width: 300,
                  height: 150,
                }}
              />
            ) : (
              <input
                className="border-2 border-blue-400 p-2 rounded-md outline-2 outline-blue-400 font-cursive text-2xl font-bold"
                placeholder="Type signature"
                onChange={(e) => setTextSignature(e.target.value)}
                ref={(ref) =>
                  (signatureRef.current[currentSignatureIndex] = ref)
                }
              />
            )}
            <div className="flex gap-x-2 items-center justify-end">
              <button
                onClick={closeSignatureModal}
                className="bg-gray-400 shadow-md text-white px-4 py-2 mt-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => addSignature(signatureType)}
                className="bg-blue-500 shadow-md text-white px-4 py-2 mt-2 rounded-md"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModel && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white flex flex-col gap-4 items-center p-4 rounded-lg w-[20%]">
            <InfoCircledIcon className="w-8 h-8" />
            <div className="flex justify-center text-center font-bold">
              {
                "By clicking 'Submit', you are acknowledging that your signature will be permanently submitted. Are you sure you want to proceed?"
              }
            </div>
            <div className="flex gap-x-2 w-full">
              <button
                onClick={() => setConfirmModel(false)}
                className="bg-gray-400 w-full shadow-md text-white px-4 py-2 mt-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={printToPdf}
                className="bg-blue-500 w-full shadow-md text-white px-4 py-2 mt-2 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignDocuments;
