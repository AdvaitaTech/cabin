import { Writer, AdvaitaWriterRef } from "@advaita-tech/writer";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  MutableRefObject,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  JournalEntry,
  saveJournalEntryRequest,
  useAllJournalEntries,
  useJournalEntry,
} from "./utils/network";
import PlusIcon from "./icons/PlusIcon";
import SaveIcon from "./icons/SaveIcon";
import clsx from "clsx";
import EntryLoading from "./components/skeletons/EntryLoading";
import ListLoadingSkeleton from "./components/skeletons/ListLoading";
import ListIcon from "./icons/ListIcon";
import CloseIcon from "./icons/CloseIcon";

const fetchSummary = (html: string) => {
  const parser = new DOMParser();
  const tree = parser.parseFromString(html, "text/html");
  const firstLine =
    tree.querySelector("p:first-child")?.firstChild?.textContent;
  return firstLine?.substring(0, 200);
};

const EntryEditor = ({
  entry,
  editorRef,
  setDirty,
}: {
  entry: JournalEntry;
  editorRef: MutableRefObject<AdvaitaWriterRef | undefined>;
  setDirty: (value: boolean) => void;
}) => {
  return (
    <div className="max-w-xl md:max-w-[800px] w-full">
      <div className="flex mb-5 w-full items-center">
        <input
          id="journal-title"
          className="text-xl sm:text-2xl md:text-3xl placeholder:text-white-700 outline-none bg-transparent flex-1"
          style={{
            width: "calc(100% - 30px)",
          }}
          defaultValue={entry.title}
          type="text"
          onChange={() => {
            setDirty(true);
          }}
        />
        <button
          className="text-2xl text-primary-500 disabled:text-primary-200 w-[30px]"
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
        autofocus="end"
        placeholder="Your thoughts..."
        content={entry.content}
        styles="editor"
        onUpdate={() => {
          setDirty(true);
        }}
      />
    </div>
  );
};

const EntryList = ({
  entries,
  entryId,
  setEntryId,
}: {
  entries: JournalEntry[];
  entryId: string | undefined;
  setEntryId: (id: string) => void;
}) => {
  return (
    <div className="overflow-auto">
      {entries.map(({ id, title, content }) => {
        const summary = fetchSummary(content);
        return (
          <Link
            to={`/write/${id}`}
            key={id}
            onClick={() => setEntryId(id)}
            className={clsx(
              "border-b border-primary-200 px-5 py-2 cursor-pointer block last:border-0",
              {
                "bg-white-600 pointer-events-none select-none": id === entryId,
              }
            )}
          >
            <h3
              className={clsx("text-xl text-primary-500", {
                "text-black": id === entryId,
              })}
            >
              {title}
            </h3>
            {summary ? (
              <p className="text-lg text-white-900 h-[60px] overflow-hidden">
                {summary}
              </p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
};

const WritePage = () => {
  const { entryId: entryParam } = useParams();
  const [sliderShown, setSliderShown] = useState(false);
  const [entryId, setEntryId] = useState(entryParam);
  const {
    entry,
    error: entryError,
    isLoading: isEntryLoading,
  } = useJournalEntry(entryId || "invalid");
  const { entries, error, isLoading } = useAllJournalEntries();
  const dirty = useRef(false);
  const editorRef = useRef<AdvaitaWriterRef>();

  const setDirty = (value: boolean) => {
    dirty.current = value;
    const elem = document.getElementById("save-button");
    if (value) elem?.removeAttribute("disabled");
    else elem?.setAttribute("disabled", "true");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!editorRef.current) return;
      if (!dirty.current) return;
      if (!entryId) return;
      const content = editorRef.current?.exportHTML();
      const title = (
        document.getElementById("journal-title") as HTMLInputElement
      ).value;
      saveJournalEntryRequest(entryId, { title, content });
      setDirty(false);
    }, 5000);

    window.onbeforeunload = () => {
      if (!editorRef.current) return;
      if (!entryId) return;
      const content = editorRef.current.exportHTML();
      const title = (
        document.getElementById("journal-title") as HTMLInputElement
      ).value;
      saveJournalEntryRequest(entryId, { title, content }).then(() => {
        console.log("entry saved");
      });
    };

    return () => {
      window.onbeforeunload = null;
      clearInterval(interval);
    };
  }, [entryId]);

  useLayoutEffect(() => {
    setDirty(false);
  }, []);

  return (
    <div
      id="writer-page"
      className="w-full h-full flex justify-center overflow-hidden flex-col-reverse md:flex-row"
    >
      <div className="w-[320px] border-r border-primary-200 bg-white-500 hidden flex-col md:flex">
        <div className="flex justify-between px-5 border-b-2 border-primary-200">
          <span className="font-bold capitalize text-2xl text-primary-500">
            Entries
          </span>
          <Link
            to="/write"
            className="flex items-center text-primary-500 text-[45px]"
            reloadDocument
          >
            <PlusIcon />
          </Link>
        </div>
        {isLoading ? (
          <div className="px-5 py-2">
            <ListLoadingSkeleton />
            <ListLoadingSkeleton />
            <ListLoadingSkeleton />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-primary-900">
            {error.message}
          </div>
        ) : entries ? (
          <EntryList
            entries={entries}
            entryId={entryId}
            setEntryId={setEntryId}
          />
        ) : null}
      </div>
      <div className="w-full md:hidden block">
        <div className="flex justify-between px-5 border-t-2 border-primary-500 shadow-xl shadow-primary-900">
          <span
            className="text-primary-500 flex items-center text-[40px]"
            onClick={() => setSliderShown(true)}
          >
            <ListIcon />
          </span>
          <Link
            to="/write"
            className="flex items-center text-primary-500 text-[45px]"
            reloadDocument
          >
            <PlusIcon />
          </Link>
        </div>
        <div
          className={clsx(
            "absolute left-0 top-0 h-full w-0 transition-[width] ease-in-out duration-200 bg-white-500 z-10 overflow-hidden flex flex-col-reverse",
            {
              "w-full": sliderShown,
            }
          )}
        >
          <div className="flex justify-between px-5 border-t-2 border-primary-500 h-[50px]">
            <span className="font-bold capitalize text-2xl">Entries</span>
            <span
              className="flex items-center text-[45px]"
              onClick={() => setSliderShown(false)}
            >
              <CloseIcon />
            </span>
          </div>
          <div
            style={{ height: "calc(100% - 50px)" }}
            className="overflow-auto"
          >
            {entries ? (
              <EntryList
                entries={entries}
                entryId={entryId}
                setEntryId={(id: string) => {
                  setEntryId(id);
                  setSliderShown(false);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex-1 pt-5 px-[50px] flex justify-center overflow-y-scroll bg-white-500">
        {isEntryLoading ? (
          <div>
            <EntryLoading />
          </div>
        ) : entryError ? (
          <div className="flex items-center justify-center text-primary-900">
            {entryError.message}
          </div>
        ) : entry ? (
          <EntryEditor
            key={entryId}
            entry={entry}
            editorRef={editorRef}
            setDirty={setDirty}
          />
        ) : null}
      </div>
    </div>
  );
};

export default WritePage;
