import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  console.log("error", error);
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="text-3xl">
        You are requesting a page that does not exist
        </div>
        <Link to="/" className="px-10 py-4 bg-primary-500 text-white-500 rounded-lg text-center mt-[100px]">Go back home</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
