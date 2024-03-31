import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { register as registerUser } from "../lib/apiCalls";
import { useState } from "react";

const Register = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  console.log();
  const { mutate: signUp, isPending } = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      navigate("/login");
    },
    onError: (data) => {
      setError(data.response.data.message);
    },
  });
  const onSubmit = (data) => {
    const { confirmPass, ...rest } = data;
    signUp(rest);
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
            <div className="flex flex-col p-3 w-96     shadow-lg gap-y-3 shrink-0">
              {/* heading div */}
              <div className="flex flex-col items-center gap-y-3">
                <h1 className="text-2xl font-semibold">Welcome</h1>
                <p>
                  {"Don't have account?"}{" "}
                  <Link
                    to={"/login"}
                    className="text-blue-500 font-semibold cursor-pointer"
                  >
                    Log in Here!
                  </Link>
                </p>
              </div>
              {/* login form */}
              <form
                className="flex flex-col gap-y-2"
                action="onSubmit"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex gap-x-2">
                  <div>
                    <label>First Name</label>
                    <input
                      className="w-full border border-gray-300 rounded-md outline-1 outline-blue-500"
                      type="text"
                      name="firstName"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                    {errors.firstName && (
                      <span className="text-xs text-red-500">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label>Last name</label>
                    <input
                      className="w-full border border-gray-300 rounded-md outline-1 outline-blue-500"
                      type="text"
                      name="lastName"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                    {errors.lastName && (
                      <span className="text-xs text-red-500">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-x-2">
                  <div>
                    <label>Email</label>
                    <input
                      className="w-full border border-gray-300 rounded-md outline-1 outline-blue-500"
                      type="email"
                      name="email"
                      {...register("email", {
                        required: "Email is required",
                      })}
                    />
                    {errors.email && (
                      <span className="text-xs text-red-500">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label>Mobile</label>
                    <input
                      className="w-full border border-gray-300 rounded-md outline-1 outline-blue-500"
                      type="text"
                      name="mobile"
                      {...register("mobile")}
                    />
                    {errors.mobile && (
                      <span className="text-xs text-red-500">
                        {errors.mobile.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-x-2">
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
                  <div>
                    <label>Confirm </label>
                    <input
                      className="w-full border border-gray-300 rounded-md outline-1 outline-blue-500"
                      type="password"
                      name="confirmPass"
                      {...register("confirmPass", {
                        validate: (value) => {
                          const { password } = getValues();
                          return (
                            password === value || "Password doesn't match!"
                          );
                        },
                      })}
                    />
                    {errors.confirmPass && (
                      <span className="text-xs text-red-500">
                        {errors.confirmPass.message}
                      </span>
                    )}
                  </div>
                </div>
                {error && <span className="text-xs text-red-500">{error}</span>}
                <div className="mt-4">
                  <button
                    className={`${
                      isPending ? "bg-gray-400" : "bg-blue-400"
                    }  text-white w-full rounded-sm p-1 `}
                    type="submit"
                  >
                    Register
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

export default Register;
