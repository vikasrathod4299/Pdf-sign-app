import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AssignUser = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const handleAddUser = () => {
    if (email && name) {
      setUsers([...users, { email, name }]);
      localStorage.setItem(
        "assignedUsers",
        JSON.stringify([...users, { email, name }])
      );
      setEmail("");
      setName("");
    } else {
      alert("Please enter name and email");
    }
  };
  useEffect(() => {
    const data = localStorage.getItem("assignedUsers");
    const users = data ? JSON.parse(data) : [];
    setUsers(users);
  }, []);
  return (
    <div className="container mx-auto px-52">
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col gap-y-3">
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
          <div>
            <button
              className="bg-blue-500 text-white text-center rounded-full p-2 px-3 font-medium hover:bg-blue-600 "
              onClick={handleAddUser}
            >
              Add User
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-y-3">
          <div>
            <table>
              <thead className="border-b-2">
                <tr className="w-full flex gap-x-32 justify-center">
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users
                  ? users.map((item) => {
                      return (
                        <tr
                          key={item.email}
                          className="w-full flex gap-x-32 justify-center"
                        >
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
          <div>
            <Link
              to="/prepareDocument"
              className="bg-blue-500 text-white text-center rounded-full p-2 px-3 font-medium hover:bg-blue-600 "
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
