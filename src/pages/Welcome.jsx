import React from "react";

function Welcome() {
  const currentHour = new Date().getHours();

  let greeting;
  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return (
    <div className="login-container">
      <div className="flex justify-center items-center h-screen">
        <div className="p-8 rounded-lg shadow-lg border border-gray-300 w-96">
          <h2 className="text-2xl font-bold text-center mb-10">{greeting}</h2>
          <div className="text-3xl text-center mb-10 text-gray-500 font-semibold">
            Welcome, Vignesh!
          </div>
          <div className="text-lg text-center mb-4 text-green-700 font-semibold">
            You're now logged in
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
