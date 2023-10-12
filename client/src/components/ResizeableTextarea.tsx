import {
  CSSProperties,
  ChangeEventHandler,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

type ResizeableTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const ResizeableTextarea = ({
  id,
  value,
  style,
  className,
  defaultValue,
  onChange,
  ...otherProps
}: ResizeableTextareaProps) => {
  const shadowRef = useRef<HTMLTextAreaElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [height, setHeight] = useState(0);

  const shadowStyles: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: 0,
    width: "100%",
    visibility: "hidden",
    ...style,
  };

  useEffect(() => {
    if (!shadowRef.current) return;
    shadowRef.current.value =
      defaultValue !== undefined && typeof defaultValue === "string"
        ? defaultValue
        : "";
    const newHeight = shadowRef.current.scrollHeight;
    console.log("setting height", defaultValue, newHeight);
    setHeight(newHeight);
  }, []);

  const wrapChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    if (!textRef.current || !shadowRef.current) return;
    shadowRef.current.value = e.target.value;
    const newHeight = shadowRef.current.scrollHeight;
    console.log("setting height", e.target.value, newHeight);
    setHeight(newHeight);
    if (onChange) onChange(e);
  };

  return (
    <>
      <textarea
        id={id || undefined}
        ref={textRef}
        className={className}
        defaultValue={defaultValue}
        onChange={wrapChange}
        style={{
          height,
          ...style,
        }}
        {...otherProps}
      />
      <textarea ref={shadowRef} style={shadowStyles} className={className} />
    </>
  );
};

export default ResizeableTextarea;
