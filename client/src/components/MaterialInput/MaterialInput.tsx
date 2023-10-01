import clsx from "clsx";
import { InputHTMLAttributes, useRef, useState } from "react";

interface MaterialInputProps extends InputHTMLAttributes<HTMLInputElement> {
  title: string;
}

type InputMode = "" | "focused";

const MaterialInput = ({
  title,
  className,
  ...inputProps
}: MaterialInputProps) => {
  const [mode, setMode] = useState<InputMode>("");
  const ref = useRef<HTMLInputElement | null>(null);

  return (
    <fieldset
      className={clsx(
        (className || " ") +
          " px-3 py-2 rounded-md border border-primary-500 relative ",
        {
          "border-white-700": mode !== "focused",
        }
      )}
    >
      <legend
        className={clsx(
          "top-[-10px] left-0 text-sm bg-white mx-[-4px] h-[11px]",
          {
            "w-0": mode === "",
          }
        )}
      >
        <div className="visible opacity-0 px-[5px]">{title}</div>
      </legend>
      <label
        className={clsx(
          "transition-all duration-200 absolute top-0 left-[12px] pointer-events-none",
          {
            "absolute text-md text-white-700 translate-y-[5px] translate-x-[-4px]":
              mode === "",
            "absolute text-sm text-primary-500 translate-y-[-14px]":
              mode === "focused",
          }
        )}
      >
        {title}
      </label>
      <input
        ref={ref}
        className={"w-full outline-none"}
        {...inputProps}
        onBlur={(e) => {
          if (ref.current && !ref.current.value) setMode("");
          if (inputProps.onBlur) inputProps.onBlur(e);
        }}
        onFocus={(e) => {
          setMode("focused");
          if (inputProps.onFocus) inputProps.onFocus(e);
        }}
      />
    </fieldset>
  );
};

export default MaterialInput;
