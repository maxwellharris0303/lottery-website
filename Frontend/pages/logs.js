import { useEffect, useState } from "react";
import Header from "../Components/Header";
import Router from "next/router";
import { SERVER_URL } from "../utils/const";

export default function Logs() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  const getUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("User"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      Router.push("/Login");
    }
  };

  const getLogs = async () => {
    const token = JSON.parse(localStorage.getItem("Token"));
    try {
      const response = await fetch(`${SERVER_URL}/logs`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const logData = await response.json();
      if (response.ok) {
        setLogs(logData);
        console.log(logData)
      } else {
        setError(data.error || "Failed to fetch logs.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    getUser();
    getLogs();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 flex flex-col min-h-[80vh] w-full items-center">
        <div className="overflow-auto w-full max-h-[70vh]">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
                <th scope="col" className="px-6 py-3">
                  Schedule Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Schedule Time
                </th>
                <th scope="col" className="px-6 py-3">
                  Added Prizes
                </th>
                <th scope="col" className="px-6 py-3">
                  Updated Prizes
                </th>
                <th scope="col" className="px-6 py-3">
                  Provider
                </th>
                <th scope="col" className="px-6 py-3">
                  Updated date
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 &&
                logs.map((item) => {
                  return (
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      key={item._id}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white uppercase">
                        {item.action}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.schedule.name}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.lottery && item.lottery.date}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.schedule.time}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.old_data.join(", ")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.new_data.join(", ")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.user && item.user.username}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.updated_at}
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
}
