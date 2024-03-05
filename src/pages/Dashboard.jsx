import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container mx-[30%] flex justify-start">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Sign Documents</h1>
          <p>You do not have any documents to sign</p>
        </div>
        <Link
          to={"/assignUser"}
          className="bg-blue-400 text-white text-center rounded-full p-2 font-medium"
        >
          Prepare Documents for Signing
        </Link>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Review Signed Documents</h1>
          <p>You do not have any documents to sign</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
