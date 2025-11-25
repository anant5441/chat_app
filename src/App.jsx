import { useState, useRef } from 'react'
import './App.css'
import { Auth } from './components/Auth.jsx'
import Cookies from 'universal-cookie'
import { Chat } from './components/chat.jsx'
import { signOut } from 'firebase/auth'
import { auth } from './firebase-config.js'

function App() {
  const cookies = new Cookies()
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
  const [room, setRoom] = useState("")
  const roomInputRef = useRef(null)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      cookies.remove("auth-token")
      setIsAuth(false)
      setRoom("")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (!isAuth) {
    return (
      <div className="App">
        <Auth setIsAuth={setIsAuth}/>
      </div>
    )
  }

  return (
    <>
      {room ? (
        <div>
          <Chat room={room}/>
          <div className='sign-out'>
            <button onClick={() => setRoom("")}>Leave Room</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      ) : (
        <div className="room">
          <label>Enter Room Name:</label>
          <input ref={roomInputRef} />
          <button onClick={() => setRoom(roomInputRef.current.value)}>
            Enter Chat
          </button>
          <div className='sign-out'>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      )}
    </>
  )
}

export default App