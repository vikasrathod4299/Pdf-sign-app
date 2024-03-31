import { ExitIcon } from "@radix-ui/react-icons";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, setUser } = useAuth();
  return (
    <div className="w-full bg-blue-400 h-16 flex justify-between px-8 items-center">
      <div className="text-3xl p-3 font-bold text-white">
        Miracle OnBoard Documentation
      </div>
      {user && (
        <div
          className="font-bold flex cursor-pointer text-white gap-x-2 items-center"
          onClick={() => {
            setUser(null);
          }}
        >
          Logout
          <ExitIcon className="text-white w-8 h-8 " />
        </div>
      )}
    </div>
  );
};

export default Navbar;
