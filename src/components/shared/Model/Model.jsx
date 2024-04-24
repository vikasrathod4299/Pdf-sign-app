const Model = ({ children }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-10 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white w-[30%] h-[25%] p-6 justify-between flex flex-col rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default Model;
