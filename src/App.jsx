import React from "react"

import ChatWidget from "./components/ChatWidget"
function App(){
  return (
    <>
    {/* <Chatbot/> */}
    {/* <Chat/> */}
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <h1 className="text-center text-3xl font-bold text-gray-800">
        Welcome to My Website
      </h1>
      <ChatWidget />
    </div>
    </>
  )
}
export default App