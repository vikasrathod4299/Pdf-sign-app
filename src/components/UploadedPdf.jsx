/* eslint-disable react/prop-types */
import { Cross2Icon } from "@radix-ui/react-icons";

const UploadedPdf = ({ selectedDoc, setSelectedDoc, index, setDocs, name }) => {
  const handleClose = (e) => {
    e.stopPropagation();
    setDocs((prevDocs) => {
      if (prevDocs.length - 1 === index && selectedDoc !== 0) {
        setSelectedDoc((p) => p - 1);
      }
      return prevDocs.filter((item, docIndex) => docIndex !== index);
    });
  };

  return (
    <div
      className={`
          ${
            selectedDoc === index ? "bg-slate-400/30" : "bg-slate-400/15"
          }  rounded-lg h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-400/30`}
      onClick={() => setSelectedDoc(index)}
    >
      <span className="text-ellipsis">{name}</span>
      {setDocs && (
        <Cross2Icon
          className={`bg-slate-400/15 w-5 h-5 p-1 rounded-full`}
          onClick={handleClose}
        />
      )}
    </div>
  );
};

export default UploadedPdf;
