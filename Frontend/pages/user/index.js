import React, { useState, useEffect } from "react";
import Router from "next/router";
import Header from "../../Components/Header";
import { SERVER_URL } from "../../utils/const";

const AddUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  const getUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("User"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      Router.push("/Login");
    }
  };

  const handleNewUser = async () => {
    if (username && password) {
      try {
        const response = await fetch(`${SERVER_URL}/add-user`, {
          method: "POST",
          body: JSON.stringify({ username, password, role: "user" }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${JSON.parse(
              localStorage.getItem("Token")
            )}`, // Removed JSON.parse
          },
        });

        if (response.ok) {
          setUsername("");
          setPassword("");
          getUsers();
        } else {
          const errorData = await response.json();
          setError(
            errorData.error
              ? `Error: ${errorData.error}`
              : "Unknown error occurred"
          );
        }
      } catch (error) {
        console.error("Error occurred:", error);
        setError("Network error. Please try again later.");
      }
    } else {
      setError("Invalid User info");
    }
  };

  const getUsers = async () => {
    const token = JSON.parse(localStorage.getItem("Token"));
    try {
      const response = await fetch(`${SERVER_URL}/users`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.error || "Failed to fetch lotteries.");
      }
    } catch (error) {
      console.error("Error fetching lotteries:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const deleteUser = async (id) => {
    const token = JSON.parse(localStorage.getItem("Token"));
    if (!token) {
      Router.push("/Login");
    }

    try {
      const response = await fetch(`${SERVER_URL}/delete-user/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        getUsers(); // Refresh the lotteries list after deletion
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete the user.");
      }
    } catch (error) {
      console.error("Error deleting lottery:", error);
      setError("An error occurred while deleting the lottery.");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("User");
    if (JSON.parse(user)?.role !== "admin") {
      Router.push("/");
    }
    getUser();
    getUsers();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 flex flex-col min-h-[80vh] w-full items-center">
        <div className="overflow-auto w-full">
          <table className="w-fit text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Username
                </th>
                <th scope="col" className="px-6 py-3">
                  Password
                </th>
                {user && user.role === "admin" && (
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <input
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <input
                    type="text"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                </td>
                <td>
                  <button
                    onClick={handleNewUser}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                    Add
                  </button>
                </td>
              </tr>
              {users.length > 0 &&
                users.map((item) => {
                  return (
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      key={item._id}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.username}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        ********
                      </td>
                      <td>
                        <button
                          onClick={() => deleteUser(item._id)}
                          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </>
  );
};

export default AddUser;
