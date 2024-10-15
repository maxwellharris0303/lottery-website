import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import { SERVER_URL } from "../utils/const";

const Lotteries = () => {
  const [error, setError] = useState("");
  const [lotteryData, setLotteryData] = useState([]);

  const getTodaysLotteries = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/all-lotteries`, {
        headers: {
          "Content-Type": "application/json",
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
    getTodaysLotteries();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 flex flex-col min-h-[80vh] w-full items-center">
        <div className="overflow-auto max-h-[70vh]">
          <table className="min-w-[768px] text-sm text-left border-8 border-red-300">
            <tbody>
              {lotteryData.length > 0 &&
                lotteryData.map((lottery) => (
                  <tr key={lottery._id} className="border-b">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {lottery.schedule.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {lottery.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap gap-2 flex flex-col">
                      {lottery.data.length > 0 &&
                        lottery.data.map((item, index) => {
                          return (
                            <div className="flex gap-2 items-center">
                              <span>Prize {index + 1}: </span>
                              {item.toString().split("").map((letter) => (
                                <span className="bg-blue-300 text-white p-4">{letter}</span>
                              ))}
                            </div>
                          );
                        })}
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

export default Lotteries;
