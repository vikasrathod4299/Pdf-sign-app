import { useParams } from "react-router-dom";
import UploadedPdf from "../components/UploadedPdf";
import { useQuery } from "@tanstack/react-query";
import { getDocToSign } from "../lib/apiCalls";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";

const ViewDocs = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [numPages, setNumPages] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [docs, setDocs] = useState(null);
  const { data: docsData, isPending } = useQuery({
    queryKey: ["signeDocs", id],
    queryFn: getDocToSign,
    enabled: !!user._id || !!id,
  });
  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const renderPages = () => {
    const pages = [];
    for (let i = 0; i < numPages; i++) {
      pages.push(
        <div key={i} style={{ position: "relative" }}>
          <Page pageNumber={i + 1} renderTextLayer={false} />
        </div>
      );
    }
    return pages;
  };

  if (!isPending) {
    console.log(docsData.data.data.docs[selectedDoc].doc);
  }
  const handleDownload = (e) => {
    e.stopPropagation();
    const url = docsData?.data?.data?.docs?.[selectedDoc]?.docUrl;
    if (url) {
      const fileUrl = `${import.meta.env.VITE_SERVER_API}/uploads/${url}`;
      window.open(fileUrl, "_blank");
    }
  };
  return (
    <div className="flex " style={{ height: "calc(100vh - 64px)" }}>
      <div className="w-96 p-4">
        <div className={" flex flex-col gap-y-3"}>
          {!isPending &&
            docsData?.data?.data?.docs?.map((item, index) => {
              return (
                <UploadedPdf
                  key={index}
                  index={index}
                  setSelectedDoc={setSelectedDoc}
                  docs={docsData.data.data.docs[selectedDoc]}
                  selectedDoc={selectedDoc}
                  name={docsData.data.data.docs[index].doc}
                  handleDownload={handleDownload}
                  view
                />
              );
            })}
        </div>
      </div>

      <div
        className="w-full bg-slate-300 overflow-y-auto"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {docsData?.data?.data?.docs && (
          <Document
            file={`${import.meta.env.VITE_SERVER_API}/uploads/${
              docsData?.data?.data?.docs[selectedDoc].docUrl
            }`}
            onLoadSuccess={onLoadSuccess}
          >
            <div className="flex flex-col justify-center items-center">
              {renderPages()}
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};

export default ViewDocs;
