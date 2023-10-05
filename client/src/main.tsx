import "vite/modulepreload-polyfill";
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.scss";
import Login from "./Login";
import { RouterProvider, createBrowserRouter, defer } from "react-router-dom";
import Register from "./Register";
import WritePage from "./Writer";
import {
  createJournalEntryRequest,
  fetchAllJournalEntriesRequest,
  fetchJournalEntryRequest,
} from "./utils/network";
import { TokenError } from "./utils/errors";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Register />,
    loader: ({}) => {
      if (sessionStorage.getItem("token")) {
        return Response.redirect("/write");
      }
      return {};
    },
  },
  {
    path: "/register",
    element: <Register />,
    loader: ({ params }) => {
      if (sessionStorage.getItem("token")) {
        if (params.then) return Response.redirect(params.then);
        else return Response.redirect("/write");
      }
      return {};
    },
  },
  {
    path: "/api/users/sign_up",
    action: async ({ params, request }) => {
      const form = await request.formData();
      console.log("method", request.url, request, form);

      for (const pair of form.entries()) {
        console.log(`${pair[0]}, ${pair[1]}`);
      }

      return await fetch(request.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(form as any),
      })
        .then(async (res) => {
          return res.json();
        })
        .then(async (json) => {
          sessionStorage.setItem("token", json.session);
          if (params.then) return Response.redirect(params.then);
          else return Response.redirect("/write");
        })
        .catch((err) => {
          console.error("Error during auth", err);
          sessionStorage.removeItem("token");
          let newParams = {
            ...params,
            error: "AuthError",
          };
          return Response.redirect(
            "/register?" +
              Object.entries(newParams)
                .map((kv) => kv.map(encodeURIComponent).join("="))
                .join("&")
          );
        });
    },
  },
  {
    path: "/api/users/login",
    action: async ({ params, request }) => {
      return await fetch(request.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams((await request.formData()) as any),
      })
        .then(async (res) => {
          return res.json();
        })
        .then(async (json) => {
          console.log("token", json);
          sessionStorage.setItem("token", json.session);
          if (params.then) return Response.redirect(params.then);
          else return Response.redirect("/write");
        })
        .catch(() => {
          sessionStorage.removeItem("token");
          console.error("");
          const newParams = {
            ...params,
            error: "AuthError",
          };
          return Response.redirect(
            "/register?" +
              Object.entries(newParams)
                .map((kv) => kv.map(encodeURIComponent).join("="))
                .join("&")
          );
        });
    },
  },
  {
    path: "/login",
    element: <Login />,
    loader: ({ params }) => {
      if (sessionStorage.getItem("token")) {
        if (params.then) return Response.redirect(params.then);
        else return Response.redirect("/write");
      }
      return {};
    },
  },
  {
    path: "/write",
    loader: async ({ params }) => {
      console.log("initial load", params);
      if (!sessionStorage.getItem("token")) {
        return Response.redirect("/register?then=/write");
      } else {
        const journalId = Math.round(Math.random() * 1000000);
        const entry = await createJournalEntryRequest({
          title: `Journal #${journalId}`,
          entry: "",
        });
        return Response.redirect(`/write/${entry.id}`);
      }
    },
  },
  {
    path: "/write/:entryId",
    element: <WritePage />
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
