import { Writer, AdvaitaWriterRef } from "@advaita-tech/writer";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  MutableRefObject,
  useState,
} from "react";
import {
  Link,
  ScrollRestoration,
  useLoaderData,
  useParams,
} from "react-router-dom";
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
    <div className="w-[800px]">
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
              "border-b border-primary-200 px-5 py-2 cursor-pointer block",
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
      <div className="w-[400px] border-r border-primary-200 bg-white-500 flex flex-col">
        <div className="flex justify-between px-5 border-b-2 border-primary-200">
          <span className="font-bold capitalize text-2xl">Entries</span>
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
      <div className="flex-1 pt-5 px-[150px] flex justify-center overflow-y-scroll bg-white-500">
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
