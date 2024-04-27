import { useEffect, useState, useRef } from "react";
import { Page, Document } from "react-pdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";
import { InfoCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { addSign, getDocToSign } from "../lib/apiCalls";
import CedarvilleCursive from "/public/CedarvilleCursive-Regular.ttf";
import fontkit from "@pdf-lib/fontkit";
import UploadedPdf from "../components/UploadedPdf";

const SignDocuments = () => {
  const { id } = useParams();

  const [numPages, setNumPages] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(0);

  const [renderInputs, setRenderInputs] = useState([]);
  const [singatureInputs, setSignatureInputes] = useState([[]]);

  const [signatureType, setSignatureType] = useState("canvas");
  const [currentSignatureIndex, setCurrentSignatureIndex] = useState(null);

  const queryClient = useQueryClient();

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
    if (docData?.data?.data) {
      const data = docData?.data?.data.docs[selectedDoc];
      setRenderInputs(
        data.coordinates.map((item) => {
          return {
            left: parseFloat(item.left),
            top: parseFloat(item.top),
            page: parseInt(item.page),
            type: item.type,
          };
        })
      );
    }
  }, [docData, selectedDoc, docIsPending]);

  // useEffect(() => {
  //   if (!docIsPending) {
  //     if (docData?.data?.data) {
  //       const data = docData?.data?.data.docs[selectedDoc];
  //       singatureInputs((p) =>
  //         Array(docData.data.data.docs.length).fill(
  //           Array(data.coordinates.length).fill(null)
  //         )
  //       );
  //     }
  //   }

  // }, [docData, docIsPending]);

  const signatureRef = useRef([]);

  const handleTextChange = (e, curInputIndex) => {
    const { value } = e.target;

    setSignatureInputes((prevInputTexts) => {
      const data = docData.data.data.docs.map((item, index) => {
        if (index === selectedDoc) {
          const inputData = renderInputs.map((inputItem, inputIndex) => {
            if (curInputIndex === inputIndex) {
              return value;
            }
            return prevInputTexts?.[selectedDoc]?.[inputIndex];
          });
          return inputData;
        }
        return prevInputTexts?.[index];
      });
      return data;
    });
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
          setSignatureInputes((preInput) => {
            const data = docData?.data?.data?.docs?.map((item, index) => {
              if (selectedDoc === index) {
                const inputData = renderInputs.map((inputItem, inputIndex) => {
                  if (currentSignatureIndex === inputIndex) {
                    return {
                      type,
                      value: signatureCanvas.getTrimmedCanvas().toDataURL(),
                    };
                  }
                  return preInput?.[selectedDoc]?.[inputIndex];
                });
                return inputData;
              }
              return preInput[index];
            });
            return data;
          });

          // const newSignatureImages = signatureImages.map((item, index) => {
          //   if (index === selectedDoc) {
          //     return item.map((docItem, docIndex) => {
          //       if (currentSignatureIndex === docIndex) {
          //         return {
          //           type,
          //           value: signatureCanvas.getTrimmedCanvas().toDataURL(),
          //         };
          //       }
          //       return docItem;
          //     });
          //   }
          //   return item;
          // });
          // setSignatureImages([...newSignatureImages]);
        } else if (type === "text") {
          setSignatureInputes((preInput) => {
            const data = docData?.data?.data?.docs?.map((item, index) => {
              if (selectedDoc === index) {
                const inputData = renderInputs.map((inputItem, inputIndex) => {
                  if (currentSignatureIndex === inputIndex) {
                    return {
                      type,
                      value: signatureCanvas.value,
                    };
                  }
                  return preInput?.[selectedDoc]?.[inputIndex];
                });
                return inputData;
              }
              return preInput[index];
            });
            return data;
          });

          // const newSignatureImages = signatureImages.map((item, index) => {
          //   if (index === selectedDoc) {
          //     return item.map((docItem, docIndex) => {
          //       if (currentSignatureIndex === docIndex) {
          //         return {
          //           type,
          //           value: signatureCanvas.value,
          //         };
          //       }
          //       return docItem;
          //     });
          //   }
          //   return item;
          // });

          // setSignatureImages([...newSignatureImages]);
        }
        closeSignatureModal();
      }
    }
  };
  const printToPdf = async () => {
    try {
      const docs = [];
      await Promise.all(
        docData.data.data.docs.map(async (item, docIndex) => {
          const existingPdfBytes = await fetch(
            `${import.meta.env.VITE_SERVER_API}/uploads/${item.docUrl}`,
            { method: "GET" }
          ).then((res) => res.arrayBuffer());

          const pdfDoc = await PDFDocument.load(existingPdfBytes);
          pdfDoc.registerFontkit(fontkit);
          const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          for (let index = 0; index < item.coordinates.length; index++) {
            const input = item?.coordinates?.[index];
            const page = pdfDoc.getPage(input.page - 1);
            const x = parseInt(input.left);
            const y = page.getHeight() - parseInt(input.top) - 25;
            if (input.type === "text") {
              const textToPrint = singatureInputs[docIndex][index] || "";
              page.drawText(textToPrint, {
                x,
                y,
                size: 12,
                font: helveticaFont,
                color: rgb(0, 0, 0),
              });
            } else if (input.type === "signature") {
              if (singatureInputs?.[docIndex]?.[index]) {
                // Check if signature image is available
                if (singatureInputs[docIndex][index].type === "canvas") {
                  const signatureImageBytes = await fetch(
                    singatureInputs[docIndex][index].value
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
                  const textToPrint =
                    singatureInputs[docIndex][index].value || "";
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
          const blob = new Blob([modifiedPdfBytes], {
            type: "application/pdf",
          });
          // saveAs(blob, "modified_document.pdf");
          docs.push(blob);
        })
      );
      completeSign({ id: docData.data.data._id, docs });
    } catch (err) {
      console.log(err);
    }
  };

  console.log(singatureInputs);

  const renderPages = () => {
    const pages = [];
    for (let i = 0; i < numPages; i++) {
      pages.push(
        <div key={i} style={{ position: "relative" }}>
          <Page pageNumber={i + 1} renderTextLayer={false} />
          {renderInputs.map((position, index) =>
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
                    value={singatureInputs?.[selectedDoc]?.[index] || ""}
                  />
                )}
                {position.type === "signature" && (
                  <>
                    {singatureInputs?.[selectedDoc]?.[index] ? (
                      <div className="flex gap-x-2 items-center">
                        {singatureInputs[selectedDoc][index].type ===
                        "canvas" ? (
                          <img
                            className="border border-blue-400"
                            src={singatureInputs[selectedDoc][index].value}
                            width={100}
                            height={50}
                            alt="Signature"
                          />
                        ) : (
                          <p className="font-cursive font-bold text-xl">
                            {singatureInputs?.[selectedDoc]?.[index]?.value}
                          </p>
                        )}
                        <button
                          onClick={() =>
                            openSignatureModal(
                              index,
                              singatureInputs[selectedDoc][index]
                            )
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
            Next ⏭
          </button>
          <button className="bg-gray-200 w-44 gap-x-2 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none">
            Previous ⏮
          </button>

          <button
            onClick={() => {
              setConfirmModel(true);
            }}
            disabled={docData?.data?.data.status !== "pending"}
            className="bg-gray-200 w-44 gap-x-2 flex items-center justify-center rounded-full px-4  cursor-pointer py-2 font-bold text-black focus:outline-none"
          >
            Complete sign ✍
          </button>
        </div>
        <hr className="my-8" />
        <div className={" flex flex-col gap-y-3"}>
          {docData?.data?.data?.docs?.length > 0 &&
            docData?.data?.data?.docs?.map((item, index) => {
              return (
                <UploadedPdf
                  key={index}
                  index={index}
                  setSelectedDoc={setSelectedDoc}
                  docs={docData?.data?.data.docs[index]}
                  selectedDoc={selectedDoc}
                  name={docData?.data?.data.docs[index].doc}
                />
              );
            })}
        </div>
      </div>

      <div
        className="w-full bg-slate-300 overflow-y-auto"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {!docIsPending && docData?.data?.data?.status === "pending" ? (
          <Document
            file={`${import.meta.env.VITE_SERVER_API}/uploads/${
              docData.data.data.docs[selectedDoc].docUrl
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
