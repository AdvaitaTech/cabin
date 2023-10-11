import "vite/modulepreload-polyfill";
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.scss";
import Login from "./Login";
import { RouterProvider, createBrowserRouter, defer } from "react-router-dom";
import Register from "./Register";
import WritePage from "./Writer";
import { createJournalEntryRequest } from "./utils/network";
import { AuthError, BadDataError, TokenError } from "./utils/errors";
import ErrorPage from "./ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Register />,
    errorElement: <ErrorPage />,
    loader: ({}) => {
      if (sessionStorage.getItem("token")) {
        return Response.redirect("/write");
      } else return Response.redirect("/register");
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
          if (res.status === 400) {
            throw new BadDataError("no such user");
          } else if (res.status === 401) {
            // show incorrect password message
            throw new AuthError('incorrect password');
          }
          return res.json();
        })
        .then(async (json) => {
          sessionStorage.setItem("token", json.session);
          if (params.then) return Response.redirect(params.then);
          else return Response.redirect("/write");
        })
        .catch((e) => {
          sessionStorage.removeItem("token");
          console.error("");
          let error = e.name;
          const newParams = {
            ...params,
            error
          };
          return Response.redirect(
            "/login?" +
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
        return Response.redirect("/login?then=/write&error=TokenError");
      } else {
        const journalId = Math.round(Math.random() * 1000000);
        let redirectPath;
        const entry = await createJournalEntryRequest({
          title: `Journal #${journalId}`,
          entry: "",
        }).catch((e) => {
          console.log("caught");
          if (e instanceof TokenError) {
            sessionStorage.removeItem("token");
            redirectPath = "/login?error=TokenError";
          }
        });
        console.log("return");
        if (redirectPath) return Response.redirect(redirectPath);
        else return Response.redirect(`/write/${entry.id}`);
      }
    },
  },
  {
    path: "/write/:entryId",
    element: <WritePage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
