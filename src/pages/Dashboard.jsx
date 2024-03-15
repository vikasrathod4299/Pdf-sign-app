import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getReviewDocuments } from "../lib/apiCalls";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: docs, isPending } = useQuery({
    queryKey: ["docs"],
    queryFn: getReviewDocuments,
    // enabled: !!user._id,
  });
  if (!isPending) {
    console.log(docs.data.data);
  }
  if (!user) {
    return <Navigate to={"login"} />;
  }
  return (
    <div className="container mx-auto flex">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Sign Documents</h1>
          <p>You do not have any documents to sign</p>
        </div>
        <Link
          to={"/prepareDocument"}
          className="bg-blue-400 text-white text-center rounded-full p-2 font-medium"
        >
          Prepare Documents for Signing
        </Link>
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Review Signed Documents</h1>
          <p>You do not have any documents to review</p>
          <div>
            <table className="border-collapse w-full">
              <thead className="border-b-2">
                <tr className="w-full flex justify-around">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Document</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {!isPending &&
                  docs?.data?.data.map((item, index) => (
                    <tr
                      key={index}
                      className="w-full flex justify-around items-center border-b"
                    >
                      <td className="h-12 flex items-center justify-center px-4 py-2 truncate">
                        {item?.name ? item.name : "No Data"}
                      </td>
                      <td className="h-12 flex items-center justify-center px-4 py-2 truncate">
                        {item.receiverEmail}
                      </td>
                      <td className="h-12 flex items-center justify-center px-4 py-2 truncate">
                        {item.doc}
                      </td>
                      <td className="h-12 flex items-center justify-center px-4 py-2 truncate">
                        <span
                          className={`${
                            item.status === "pending"
                              ? "bg-yellow-400/60"
                              : "bg-green-400/60"
                          } flex items-center rounded-full p-1 px-3 text-white font-semibold  `}
                        >
                          {item.status === "pending" ? "Pending" : "Accepted"}
                        </span>
                      </td>
                      <td className="h-12 flex items-center justify-center px-4 py-2">
                        <a
                          href={`${import.meta.env.VITE_SERVER_API}/uploads/${
                            item.docUrl
                          }`}
                          target="_blank"
                          className="bg-blue-400 text-white text-center rounded-full p-1 px-3 font-medium hover:bg-blue-600"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
