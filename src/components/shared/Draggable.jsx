const Draggable = ({ handleDragStart, type, children, index, ...rest }) => {
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, type, index)}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Draggable;
