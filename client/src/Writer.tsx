import { Writer, AdvaitaWriterRef } from "@advaita-tech/writer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { JournalEntry, saveJournalEntryRequest } from "./utils/network";
import PlusIcon from "./icons/PlusIcon";
import SaveIcon from "./icons/SaveIcon";

const fetchSummary = (html: string) => {
  const parser = new DOMParser();
  const tree = parser.parseFromString(html, "text/html");
  const firstLine =
    tree.querySelector("p:first-child")?.firstChild?.textContent;
  return firstLine?.substring(0, 200);
};

const WritePage = () => {
  const { entry, entries } = useLoaderData() as {
    entry: JournalEntry;
    entries: JournalEntry[];
  };
  const dirty = useRef(false);
  const editorRef = useRef<AdvaitaWriterRef>();

  const setDirty = (value: boolean) => {
    dirty.current = value;
    const elem = document.getElementById("save-button");
    console.log("setting dirty", value, elem);
    if (value) elem?.removeAttribute("disabled");
    else elem?.setAttribute("disabled", "true");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!editorRef.current) return;
      if (!dirty.current) return;
      const content = editorRef.current?.exportHTML();
      const title = (
        document.getElementById("journal-title") as HTMLInputElement
      ).value;
      saveJournalEntryRequest(entry.id, { title, content });
      setDirty(false);
    }, 15000);

    window.onbeforeunload = () => {
      if (!editorRef.current) return;
      const content = editorRef.current.exportHTML();
      const title = (
        document.getElementById("journal-title") as HTMLInputElement
      ).value;
      saveJournalEntryRequest(entry.id, { title, content }).then(() => {
        console.log("entry saved");
      });
    };

    return () => {
      clearInterval(interval);
    };
  }, []);

  useLayoutEffect(() => {
    setDirty(false);
  }, []);

  return (
    <div
      id="writer-page"
      className="w-full h-full flex justify-center overflow-hidden"
    >
      <div className="w-[400px] border-r border-primary-200 bg-white-500">
        <div className="flex justify-between px-5 border-b-2 border-primary-200">
          <span className="font-bold capitalize text-2xl">Entries</span>
          <i className="flex items-center text-primary-500 text-[45px]">
            <PlusIcon />
          </i>
        </div>
        <div className="overflow-auto">
          {entries
            .filter((e) => e.id !== entry.id)
            .map((entry) => {
              const summary = fetchSummary(entry.content);
              return (
                <Link
                  to={`/write/${entry.id}`}
                  className="border-b border-primary-200 px-5 py-2 cursor-pointer block"
                >
                  <h3 className="text-xl text-primary-500">{entry.title}</h3>
                  {summary ? (
                    <p className="text-lg text-white-900 h-[60px] overflow-hidden">
                      {summary}
                    </p>
                  ) : null}
                </Link>
              );
            })}
        </div>
      </div>
      <div className="flex-1 pt-5 px-[150px] flex justify-center overflow-scroll bg-white-500">
        <div className="max-w-[800px]">
          <div className="flex mb-5 w-full items-center">
            <input
              id="journal-title"
              className="text-3xl placeholder:text-white-700 outline-none bg-transparent flex-1"
              defaultValue={entry.title}
              type="text"
              onChange={() => {
                setDirty(true);
              }}
            />
            <button
              className="text-2xl text-primary-500 disabled:text-primary-200"
              id="save-button"
              onClick={() => {
                if (!editorRef.current) return;
                const content = editorRef.current?.exportHTML();
                const title = (
                  document.getElementById("journal-title") as HTMLInputElement
                ).value;
                setDirty(false);
                saveJournalEntryRequest(entry.id, { title, content });
              }}
            >
              <SaveIcon />
            </button>
          </div>
          <Writer
            setEditorRef={(ref: AdvaitaWriterRef) => (editorRef.current = ref)}
            placeholder="Your thoughts..."
            content={entry.content}
            styles="editor"
            onUpdate={() => {
              setDirty(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WritePage;