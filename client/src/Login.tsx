import { useState } from "react";
import MaterialInput from "./components/MaterialInput/MaterialInput";
import { Form } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col items-center justify-center relative text-white-500">
        <div className="z-10 flex flex-col items-center justify-center">
          <h1
            className="block font-extrabold text-3xl mb-5"
            style={{
              textShadow: "1px 1px black",
            }}
          >
            Cabin
          </h1>
          <h3
            className="block text-2xl font-semibold"
            style={{
              textShadow: "1px 1px black",
            }}
          >
            A safe space for your journals
          </h3>
        </div>
        <img
          src="/writers-cabin.png"
          className="object-cover w-full h-full absolute opacity-70"
        />
      </div>
      <div className="flex-1 flex items-center justify-center bg-background-200">
        <Form className="flex flex-col w-[500px] border-primary-200 border rounded-lg shadow-secondary-400 bg-white-500 py-10 px-5" method="POST" action="/api/users/login">
          <h2 className="mb mx-auto text-xl font-bold">Start writing</h2>
          <h4 className="mb-10 mx-auto text-md text-white-800">
            By entering your details
          </h4>
          <MaterialInput name="email" title="Email" type="text" />
          <MaterialInput name="password" title="Password" type="password" className="mt-2" />
          <button className="w-full mt-10 py-3 bg-primary-500 text-white-500 font-semibold rounded-lg disabled:bg-white-700">
            Login
          </button>
          <div className="text-sm text-white-800 mt-20 mx-auto">
            <span>Don't have an account? </span>
            <a
              href="/register"
              className="text-md text-primary-500 font-semibold"
            >
              Sign up
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
