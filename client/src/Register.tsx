import { useState } from "react";
import MaterialInput from "./components/MaterialInput/MaterialInput";
import WritersCabin from "./assets/writers-cabin.png";
import { Form, useNavigate, useSearchParams } from "react-router-dom";

const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center relative text-white-500">
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
            className="block text-2xl font-semibold text-center"
            style={{
              textShadow: "1px 1px black",
            }}
          >
            A cozy space for your daily journals
          </h3>
        </div>
        <img
          src={WritersCabin}
          className="object-cover w-full h-full absolute opacity-70"
        />
      </div>
      <div
        className="flex-1 flex items-center justify-center md:bg-background-200 md:relative absolute top-[200px] 
        bg-transparent left-[10px] right-[10px] rounded-lg md:rounded-none md:top-0 md:left-0 md:right-0"
      >
        <Form
          className="flex flex-col w-[500px] border-primary-200 border rounded-lg shadow-secondary-400 bg-white-500 py-10 px-5"
          method="POST"
          action="/api/users/sign_up"
        >
          <h2 className="mb mx-auto text-lg md:text-xl font-bold">
            Sign up for the free beta
          </h2>
          <h4 className="mx-auto text-md text-white-800">
            To start journaling
          </h4>
          {searchParams.get("error") &&
          searchParams.get("error") === "AuthError" ? (
            <h4 className="mt-2 text-sm text-red-500 text-center">
              User already exists. Try logging in instead.
            </h4>
          ) : null}
          <MaterialInput
            name="email"
            title="Email"
            type="text"
            className="mt-10"
            onChange={(e) => setEmail(e.target.value)}
          />
          <MaterialInput
            name="password"
            title="Password"
            type="password"
            className="mt-2"
            onChange={(e) => setPassword(e.target.value)}
          />
          <MaterialInput
            name="confirm"
            title="Confirm Password"
            type="password"
            className="mt-2"
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="submit"
            className="w-full mt-10 py-3 bg-primary-500 text-white-500 font-semibold rounded-lg  disabled:bg-white-700"
            disabled={email === "" || password === "" || confirm === ""}
          >
            Register
          </button>
          <div className="text-sm text-white-800 mt-[60px] mx-auto">
            <span>Already have an account? </span>
            <a href="/login" className="text-md text-primary-500 font-semibold">
              Login
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
