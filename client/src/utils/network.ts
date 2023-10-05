import useSWR from "swr";
import { AuthError, NetworkError, TokenError } from "./errors";
import { NavigateFunction, useNavigate } from "react-router-dom";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
}

export const createJournalEntryRequest = async ({
  title,
  entry,
}: {
  title: string;
  entry: string;
}) => {
  const token = sessionStorage.getItem("token");
  if (!token) throw new TokenError("Token not available");
  return await fetch("/api/entries/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content: entry }),
  })
    .then((res) => {
      if (res.ok) {
        return res;
      } else {
        if (res.status === 401) throw new TokenError("invalid token");
        else if (res.status === 403) throw new AuthError("not authorized");
        else throw new NetworkError(`request failed ${res.url}`);
      }
    })
    .then(async (res) => await res.json());
};

export const fetchJournalEntryRequest = async (
  id: string
): Promise<JournalEntry> => {
  const token = sessionStorage.getItem("token");
  if (!token) throw new TokenError("Token not available");
  return await fetch(`/api/entries/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res;
      } else {
        if (res.status === 401) throw new TokenError("invalid token");
        else if (res.status === 403) throw new AuthError("not authorized");
        else throw new NetworkError(`request failed ${res.url}`);
      }
    })
    .then(async (res) => res.json())
    .catch((err) => {
      console.error("caught network error", err);
      throw err;
    });
};

export const saveJournalEntryRequest = async (
  id: string,
  { title, content }: { title: string; content: string }
) => {
  const token = sessionStorage.getItem("token");
  if (!token) throw new TokenError("Token not available");
  return await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  }).then((res) => {
    if (res.ok) {
      return res;
    } else {
      if (res.status === 401) throw new TokenError("invalid token");
      else if (res.status === 403) throw new AuthError("not authorized");
      else throw new NetworkError(`request failed ${res.url}`);
    }
  });
};

export const fetchAllJournalEntriesRequest = async (): Promise<
  JournalEntry[]
> => {
  const token = sessionStorage.getItem("token");
  if (!token) throw new TokenError("Token not available");
  return await fetch(`/api/entries/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res;
      } else {
        if (res.status === 401) throw new TokenError("invalid token");
        else if (res.status === 403) throw new AuthError("not authorized");
        else throw new NetworkError(`request failed ${res.url}`);
      }
    })
    .then(async (res) => res.json())
    .then((json) => json.entries)
    .catch((err) => {
      console.error("caught network error", err);
      throw err;
    });
};

const getFetcher = <T>(navigate: NavigateFunction, errorHandler?: (e: Error) => void) => {
  return async (url: string) => {
    const token = sessionStorage.getItem("token");
    return (
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as T)
        .catch((e) => {
          console.log('fetch error', e);
          if (e instanceof TokenError) {
            sessionStorage.removeItem("token");
            navigate(`/?then=${window.location.pathname}`);
          }
          if (errorHandler)
            errorHandler(e);
        })
    );
  };
};

export const useJournalEntry = (id: string) => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useSWR(
    `/api/entries/${id}`,
    getFetcher<JournalEntry>(navigate, () => {
      throw new NetworkError("Error fetching entry. Try creating a new one?");
    })
  );

  return {
    entry: data,
    error,
    isLoading,
  };
};

export const useAllJournalEntries = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useSWR(
    "/api/entries/",
    getFetcher<{ entries: JournalEntry[] }>(navigate, () => {
      throw new NetworkError("Could not fetch Journal Entries")
    })
  );

  return {
    entries: data?.entries || [],
    error,
    isLoading,
  };
};
