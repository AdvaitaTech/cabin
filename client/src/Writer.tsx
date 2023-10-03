import { Writer, AdvaitaWriterRef } from "@advaita-tech/writer";
import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { JournalEntry, saveJournalEntryRequest } from "./utils/network";

const WritePage = () => {
  const { entry } = useLoaderData() as {
    entry: JournalEntry;
  };
  const dirty = useRef(false);
  const [title, setTitle] = useState(entry.title);
  const editorRef = useRef<AdvaitaWriterRef>();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!editorRef.current) return;
      if (!dirty.current) return;
      const content = editorRef.current?.exportHTML();
      saveJournalEntryRequest(entry.id, { title, content });
      dirty.current = false;
    }, 5000);

    window.onbeforeunload = () => {
      if (!editorRef.current) return;
      const content = editorRef.current.exportHTML();
      saveJournalEntryRequest(entry.id, { title, content }).then(() => {});
    };

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      id="writer-page"
      className="w-full h-full flex justify-center bg-background-200"
    >
      <div className="w-[1000px] pt-5">
        <input
          className="mb-5 w-full text-3xl placeholder:text-white-700 outline-none bg-transparent"
          type="text"
          value={title}
          onChange={(e) => {
            dirty.current = true;
            setTitle(e.target.value);
          }}
        />
        <Writer
          setEditorRef={(ref: AdvaitaWriterRef) => (editorRef.current = ref)}
          placeholder="Your thoughts..."
          content={entry.content}
          styles="editor"
          onUpdate={() => {
            console.log('setting dirty');
            dirty.current = true;
          }}
        />
      </div>
    </div>
  );
};

export default WritePage;
