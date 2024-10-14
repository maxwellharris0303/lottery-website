import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Router from "next/router";
import { SERVER_URL } from "../../utils/const";

const AddLottery = () => {
  const today = new Date().toISOString().split("T")[0];
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [date, setDate] = useState(today);
  const [schedules, setSchedules] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState("");
  const [lotteryData, setLotteryData] = useState([]);
  const [lotteryId, setLotteryId] = useState("");

  const handleInputChange = (prizeIndex, value) => {
    const updatedData = [...data];
    updatedData[prizeIndex] = value;
    setData(updatedData);
  };

  const addLottery = async () => {
    if (activeSchedule && date && data.length > 0) {
      const requestData = {
        schedule: activeSchedule,
        date,
        data,
      };
      const url = lotteryId
        ? `${SERVER_URL}/update-lottery/${lotteryId}`
        : `${SERVER_URL}/add-lottery`;
      const method = lotteryId ? "PUT" : "POST";

      try {
        const response = await fetch(url, {
          method,
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${JSON.parse(
              localStorage.getItem("Token")
            )}`,
          },
        });

        if (response.ok) {
          setData([]);
          setDate(today);
          setActiveSchedule("");
          setLotteryId("");
          setError("");
          getTodaysLotteries();
        } else {
          const errorData = await response.json();
          setError(errorData.message || "An error occurred.");
        }
      } catch (error) {
        setError(error);
      }
    } else {
      setError("Please input valid lottery");
    }
  };

  const getSchedule = async () => {
    const token = JSON.parse(localStorage.getItem("Token"));
    try {
      const response = await fetch(`${SERVER_URL}/schedules`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setSchedules(data);
      } else {
        setError(data.error || "Failed to fetch lotteries.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const getTodaysLotteries = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/all-lotteries`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${JSON.parse(localStorage.getItem("Token"))}`,
        },
      });
      const lotteries = await response.json();

      if (response.ok) {
        setLotteryData(lotteries);
      } else {
        setError(lotteries.message || "Failed to fetch today's lotteries.");
      }
    } catch (error) {
      setError("Network error. Please try again later.");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("User")) {
      Router.push("/Login");
    }
    getSchedule();
    getTodaysLotteries();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 flex flex-col min-h-[80vh] w-full items-center">
        <div className="overflow-auto w-full max-h-[70vh]">
          <table className="min-w-[768px] w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Time
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Lotteries
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 && (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <select
                      onChange={(e) => {
                        setActiveSchedule(e.target.value);
                        setData([]);
                      }}
                      value={activeSchedule}
                      disabled={lotteryId !== ""}
                    >
                      <option>Select Schedule</option>
                      {schedules.map((schedule, scheduleIndex) => {
                        return (
                          <option value={schedule._id} key={scheduleIndex}>
                            {schedule.name}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {schedules.find(
                      (schedule) => schedule._id === activeSchedule
                    )?.time || "00:00"}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={lotteryId !== ""}
                      max={today}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({
                        length: schedules.find(
                          (schedule) => schedule._id === activeSchedule
                        )?.schedule,
                      }).map((_, prizeIndex) => (
                        <input
                          key={prizeIndex}
                          type="number"
                          placeholder={`Prize ${prizeIndex + 1}`}
                          value={data[prizeIndex] ? data[prizeIndex] : ""}
                          onChange={(e) =>
                            handleInputChange(prizeIndex, e.target.value)
                          }
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={addLottery}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                      {lotteryId === "" ? "Add" : "Confirm"}
                    </button>
                  </td>
                </tr>
              )}
              {lotteryData.length > 0 &&
                lotteryData.map((lottery) => (
                  <tr key={lottery._id} className="border-b">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {lottery.schedule.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {lottery.schedule.time}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {lottery.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {lottery.data.join(", ")}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setActiveSchedule(lottery.schedule._id);
                          setData(lottery.data);
                          setDate(lottery.date);
                          setLotteryId(lottery._id);
                        }}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </>
  );
};

export default AddLottery;
