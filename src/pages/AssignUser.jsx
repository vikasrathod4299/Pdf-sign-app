import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AssignUser = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);

  const handleAddUser = () => {
    if (email && name) {
      const newUsers = [...users, { email, name }];
      setUsers(newUsers);
      localStorage.setItem("assignedUsers", JSON.stringify(newUsers));
      setEmail("");
      setName("");
    } else {
      alert("Please enter name and email");
    }
  };

  const handleDeleteUser = (index) => {
    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
    localStorage.setItem("assignedUsers", JSON.stringify(updatedUsers));
  };

  useEffect(() => {
    const data = localStorage.getItem("assignedUsers");
    const users = data ? JSON.parse(data) : [];
    setUsers(users);
  }, []);

  return (
    <div className="container mx-auto px-52">
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-4">
            <h1 className="text-2xl font-bold">Who needs to sign</h1>
            <div className="flex flex-col">
              <label>Name</label>
              <input
                value={name}
                className="p-1 border-2 border-gray-300 rounded-lg outline-2 outline-blue-400"
                placeholder="Enter recipient's name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label>Email</label>
              <input
                value={email}
                className="p-1 border-2 border-gray-300 rounded-lg outline-2 outline-blue-400"
                placeholder="Enter recipient's email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              className="bg-blue-400 text-white text-center rounded-full p-2 px-3 font-medium hover:bg-blue-600"
              onClick={handleAddUser}
            >
              Add User
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-y-8  ">
          <h1 className="font-bold text-2xl">{"User's list"}</h1>
          <div>
            <table className="border-collapse w-full">
              <thead className="border-b-2">
                <tr className="w-full flex gap-x-32 justify-around ">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item, index) => (
                  <tr
                    key={index}
                    className="w-full flex gap-x-32 justify-around items-center border-b "
                  >
                    <td className="">{item.name}</td>
                    <td className="">{item.email}</td>
                    <td className="">
                      <button
                        className="bg-red-400 text-white text-center rounded-full p-1 my-2 px-3 font-medium hover:bg-red-600"
                        onClick={() => handleDeleteUser(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <Link
              to="/prepareDocument"
              className="bg-blue-400 text-white text-center rounded-full p-2 px-3 font-medium hover:bg-blue-600"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUser;
