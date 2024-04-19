import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { login } from "../lib/apiCalls";
import { useState } from "react";
import { encrypt } from "../lib/Crypt";
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { user, setUser } = useAuth();
  const [error, setError] = useState(null);
  const { mutate: signIn, isPending } = useMutation({
    mutationFn: (data) => login(data),
    onSuccess: (res) => {
      setUser(res.data);
    },
    onError: (data) => {
      setError(data.response.data.message);
    },
  });
  const onSubmit = (data) => {
    const loginData = {
      loginId: encrypt(import.meta.env.VITE_ENCRYPT_KEY, data.loginId),
      password: encrypt(import.meta.env.VITE_ENCRYPT_KEY, data.password),
    };
    signIn(loginData);
  };

  if (user) {
    return <Navigate to={"/"} />;
  }

  return (
    <div
      className="bg-gray-100 flex justify-center items-center"
      style={{ height: `calc(100vh - 64px)` }}
    >
      <div className="bg-white h-[95%] w-[97%] shadow-lg">
        <div className="flex justify-center h-full items-center">
          <div className="flex w-[50%] gap-x-32">
            <div className="shrink-1">
              <h1 className="text-blue-400 text-3xl font-bold">
                Miracle interview
              </h1>
              <h1 className="text-blue-400 text-3xl font-bold">
                Management Portal
              </h1>
              <h1 className="text-3xl font-bold text-gray-700">https://</h1>
              <h1 className="text-3xl font-bold text-gray-700">
                mim.miraclesoft.com
              </h1>
              <p>
                This application will help you to track and manage your
                interviews.
              </p>
              <p>
                Being a interviewer this portal will be a one stop for all your
                candidate status and feedback presented.
              </p>
            </div>
            <div className="flex flex-col p-3 w-80 shadow-lg gap-y-3 shrink-0">
              {/* heading div */}
              <div className="flex flex-col items-center gap-y-3">
                <h1 className="text-2xl font-semibold">Welcome back</h1>
                <p>
                  {"Don't have account?"}{" "}
                  <Link
                    to={"/register"}
                    className="text-blue-500 cursor-pointer font-semibold"
                  >
                    Signup here!
                  </Link>
                </p>
              </div>
              {/* login form */}
              <form
                className="flex flex-col gap-y-2"
                action="onSubmit"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label>Email</label>
                  <input
                    className="w-full border border-gray-300 rounded-md outline-1 outline-blue-500"
                    type="text"
                    name="loginId"
                    {...register("loginId", {
                      required: "Email is required",
                    })}
                  />
                  {errors.loginId && (
                    <span className="text-xs text-red-500">
                      {errors.loginId.message}
                    </span>
                  )}
                </div>
                <div>
                  <label>Password</label>
                  <input
                    className="w-full border outline-1 outline-blue-500 border-gray-300 rounded-md"
                    type="password"
                    name="password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  {errors.password && (
                    <span className="text-xs text-red-500">
                      {errors.password.message}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    className="h-5 outline-2 outline-blue-500 w-4 rounded-md border border-gray-300"
                    type="checkbox"
                    id="rememberme"
                  />
                  <label id="rememberme">Remember me</label>
                </div>
                {error && <span className="text-xs text-red-500">{error}</span>}
                <div className="mt-8">
                  <button
                    className={`${
                      isPending ? "bg-gray-400" : "bg-blue-400"
                    }  text-white w-full rounded-sm p-1 `}
                    type="submit"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
