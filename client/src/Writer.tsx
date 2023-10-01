import { Writer, AdvaitaWriterRef } from "@advaita-tech/writer";
import { useEffect, useRef, useState } from "react";

const WritePage = () => {
  const count = Math.round(Math.random() * 100000);
  const [html, setHtml] = useState<string>("");
  // const [html, setHtml] = useState<any>(`<h1>Journal #${count}</h1>`);
  const editorRef = useRef<AdvaitaWriterRef>();

  return (
    <div id="writer-page" className="w-full h-full bg-background-200 flex items-center justify-center">
      <Writer
        setEditorRef={(ref: AdvaitaWriterRef) => (editorRef.current = ref)}
        placeholder="Your thoughts..."
        content={html}
        styles="editor"
      />
    </div>
  );
};

export default WritePage;
