import { useEffect, useState } from "react";
import Header from "../Components/Header";
import Router from "next/router";
import { SERVER_URL } from "../utils/const";

export default function Home() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState("");
  const [schedule, setSchedule] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [id, setId] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Add");

  const getUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("User"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      Router.push("/Login");
    }
  };

  const addSchedule = async () => {
    if (time && schedule && name) {
      const data = { time, schedule, name };
      const url = id
        ? `${SERVER_URL}/update-schedule/${id}`
        : `${SERVER_URL}/add-schedule`;
      const method = id ? "PUT" : "POST";

      try {
        const response = await fetch(url, {
          method,
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${JSON.parse(
              localStorage.getItem("Token")
            )}`,
          },
        });

        if (response.ok) {
          getSchedule();
          setTime("");
          setSchedule("");
          setId("");
          setName("");
          setError("");
          setButtonLabel("Add");
        } else {
          const resData = await response.json();
          setError(resData.message || "An error occurred.");
        }
      } catch (error) {
        setError("Internal server error");
      }
    } else {
      setError("Please input valid numbers");
    }
  };

  const getSchedule = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/schedules`, {
        headers: {
          authorization: `Bearer ${JSON.parse(localStorage.getItem("Token"))}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSchedules(data);
      } else {
        setError(data.message || "Failed to fetch schedules.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const deleteSchedule = async (id) => {
    const token = JSON.parse(localStorage.getItem("Token"));
    if (!token) {
      Router.push("/Login");
    }

    try {
      const response = await fetch(`${SERVER_URL}/delete-schedule/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        getSchedule();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete the schedule.");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError("An error occurred while deleting the schedule.");
    }
  };

  useEffect(() => {
    getUser();
    getSchedule();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 flex flex-col min-h-[80vh] w-full items-center">
        <div className="overflow-auto w-full">
          <table className="w-fit text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Time
                </th>
                <th scope="col" className="px-6 py-3">
                  Number of Lottery
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                {user && user.role === "admin" && (
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {user && user.role === "admin" && (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">
                    <input
                      type="time"
                      onChange={(e) => setTime(e.target.value)}
                      value={time}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => setSchedule(e.target.value)}
                      value={schedule}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <input
                      type="text"
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                    />
                  </td>
                  <td>
                    <button
                      onClick={addSchedule}
                      className="text-white bg-blue-700 px-5 py-2.5"
                    >
                      {buttonLabel}
                    </button>
                  </td>
                </tr>
              )}
              {schedules.length > 0 &&
                schedules.map((item) => (
                  <tr
                    key={item._id}
                    className="bg-white border-b dark:bg-gray-800"
                  >
                    <td className="px-6 py-4 font-medium">{item.time}</td>
                    <td className="px-6 py-4 font-medium">{item.schedule}</td>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    {user && user.role === "admin" && (
                      <td>
                        <button
                          onClick={() => {
                            setTime(item.time);
                            setSchedule(item.schedule);
                            setId(item._id);
                            setName(item.name);
                            setButtonLabel("Confirm");
                          }}
                          className="text-white bg-green-700 px-5 py-2.5"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => deleteSchedule(item._id)}
                          className="text-white bg-red-700 px-5 py-2.5 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </>
  );
}
