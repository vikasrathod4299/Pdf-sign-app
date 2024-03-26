import React from "react";

const Button = ({ children, ...rest }) => {
  return (
    <button
      className="bg-gray-200 rounded-full px-4 w-44 cursor-pointer py-2 font-bold text-black focus:outline-none"
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
