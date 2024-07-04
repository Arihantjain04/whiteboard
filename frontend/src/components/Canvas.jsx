import React, { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";
import imgSrc from "../../public/grid.png";

const roughGenerator = rough.generator();

const Canvas = ({
  canvasRef,
  ctx,
  color,
  setElements,
  elements,
  tool,
  socket,
  user,
}) => {
  const [img, setImg] = useState(null);

  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgURL);
    });
  }, []);

  if (!user?.presenter) {
    return (
      <div
        className="col-md-8 overflow-hidden border border-dark px-0 mx-auto mt-3"
        style={{
          height: "500px",
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src={img}
          alt="real image"
          className="w-100 h-100"
          style={{ height: "500px", width: "100%" }}
        />
      </div>
    );
  }
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const context = canvas.getContext("2d");

    context.strokeWidth = 5;
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = 2;
    ctx.current = context;
  }, [color, ctx, canvasRef]);

  useEffect(() => {
    ctx.current.strokeStyle = color;
  }, [color]);

  useLayoutEffect(() => {
    if (canvasRef) {
      const roughGen = rough.canvas(canvasRef.current);

      if (elements.length > 0) {
        ctx.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }

      elements.forEach((element) => {
        if (element.type === "pencil") {
          roughGen.linearPath(element.path, {
            stroke: element.stroke,
            strokeWidth: 2,
            roughness: 0,
          });
        } else if (element.type === "line") {
          roughGen.draw(
            roughGenerator.line(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 2,
                roughness: 0,
              }
            )
          );
        } else if (element.type === "rect") {
          roughGen.draw(
            roughGenerator.rectangle(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 2,
                roughness: 0,
              }
            )
          );
        }
      });
    }

    const canvasImage = canvasRef.current.toDataURL();
    socket.emit("whiteBoardData", canvasImage);
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
          element: tool,
        },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color,
        },
      ]);
    } else if (tool === "rect") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "rect",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    }

    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
      if (tool === "pencil") {
        setElements((prevElements) => {
          const newElements = [...prevElements];
          const path = newElements[newElements.length - 1].path;
          newElements[newElements.length - 1] = {
            ...newElements[newElements.length - 1],
            path: [...path, [offsetX, offsetY]],
          };
          return newElements;
        });
      } else if (tool === "line") {
        setElements((prevElements) => {
          const newElements = [...prevElements];
          newElements[newElements.length - 1] = {
            ...newElements[newElements.length - 1],
            width: offsetX,
            height: offsetY,
          };
          return newElements;
        });
      } else if (tool === "rect") {
        setElements((prevElements) => {
          const newElements = [...prevElements];
          const startX = newElements[newElements.length - 1].offsetX;
          const startY = newElements[newElements.length - 1].offsetY;
          newElements[newElements.length - 1] = {
            ...newElements[newElements.length - 1],
            width: offsetX - startX,
            height: offsetY - startY,
          };
          return newElements;
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <>
      {/* {JSON.stringify(elements)} */}
      <div
        className="col-md-8 overflow-hidden border border-dark px-0 mx-auto mt-3"
        style={{
          height: "500px",
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default Canvas;
