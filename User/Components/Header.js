import React from "react";
import Link from "next/link";
// import { useEffect, useState } from "react";
// import Router from "next/router";

const Header = () => {
  // const [user, setUser] = useState(null);

  // const SignOut = () => {
  //   localStorage.clear();
  //   Router.push("/Login");
  //   setUser(null);
  // };

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("User");
  //   if (storedUser) {
  //     setUser(storedUser);
  //   }
  // }, []);

  return (
    <div className="flex justify-between bg-[#34495e] text-[#ecf0f1] p-3">
      <div className="Left flex list-none space-x-3">
        <Link href="/">
          <li>Lotteries</li>
        </Link>
      </div>
      {/* <div className="Right flex list-none space-x-3">
        {!user ? (
          <>
            <Link href="/Login">
              <li>Log In</li>
            </Link>
          </>
        ) : (
          <>
            <li>{JSON.parse(user)?.Name}</li>
            <li
              onClick={() => {
                SignOut();
              }}
            >
              Sign Out
            </li>
          </>
        )}
      </div> */}
    </div>
  );
};

export default Header;
