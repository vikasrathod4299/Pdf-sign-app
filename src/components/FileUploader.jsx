// eslint-disable-next-line react/prop-types
const FileUploader = ({ setDocs }) => {
  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setDocs((p) => [{ doc: selectedFile, coordinates: [] }, ...p]);
  };
  return (
    <label htmlFor="fileInput" className="relative">
      <button className="bg-gray-200 rounded-full px-4 py-2 font-bold text-black focus:outline-none">
        Upload a document 📃
      </button>
      <input
        id="fileInput"
        type="file"
        accept=".pdf"
        className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
        onChange={handleChange}
      />
    </label>
  );
};

export default FileUploader;
