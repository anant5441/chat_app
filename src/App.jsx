import { useState, useEffect } from 'react'
import './App.css'
import { Auth } from './components/Auth.jsx'
import Cookies from 'universal-cookie'
import { Chat } from './components/Chat.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { signOut } from 'firebase/auth'
import { auth, db } from './firebase-config.js'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { generateChatId } from './utils/chatUtils'

function App() {
  const cookies = new Cookies()
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeChatId, setActiveChatId] = useState(null)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        setIsAuth(true);
        cookies.set("auth-token", user.accessToken);

        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setCurrentUser({ id: userSnap.id, ...userSnap.data() });
          } else {
            // Fallback if user is in Auth but not Firestore (shouldn't happen with correct flow)
            console.warn("User authenticated but not found in Firestore");
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      } else {
        // User is signed out
        setIsAuth(false);
        setCurrentUser(null);
        cookies.remove("auth-token");
      }
    });

    return () => unsubscribe();
  }, []);

  // Update lastOnline when component unmounts or user leaves
  useEffect(() => {
    const updatePresence = async () => {
      if (auth.currentUser && isAuth) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            lastOnline: serverTimestamp()
          });
        } catch (error) {
          console.error("Error updating presence:", error);
        }
      }
    };

    // Update presence on unmount
    return () => {
      updatePresence();
    };
  }, [isAuth]);

  // Handle user selection and chat initialization
  const handleUserSelect = async (user) => {
    if (!currentUser) return;

    setSelectedUser(user);

    try {
      // Generate unique chat ID
      const chatId = generateChatId(currentUser.uid, user.uid);
      console.log("Initializing chat:", chatId, "for users:", currentUser.uid, user.uid);

      // Check if chat already exists
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        console.log("Chat does not exist, creating new one...");
        const chatData = {
          users: [currentUser.uid, user.uid],
          createdAt: serverTimestamp()
        };
        console.log("Chat data:", chatData);

        // Create new chat
        await setDoc(chatRef, chatData);
        console.log("New chat created successfully:", chatId);
      } else {
        console.log("Chat already exists");
      }

      setActiveChatId(chatId);
    } catch (error) {
      console.error("Error initializing chat:", error);
      alert("Failed to open chat. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      // Update lastOnline before signing out
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          lastOnline: serverTimestamp()
        });
      }

      await signOut(auth)
      cookies.remove("auth-token")
      setIsAuth(false)
      setCurrentUser(null)
      setSelectedUser(null)
      setActiveChatId(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (!isAuth) {
    return (
      <div className="App">
        <Auth setIsAuth={setIsAuth} />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSelectUser={handleUserSelect}
        onSignOut={handleSignOut}
      />

      {activeChatId && selectedUser && currentUser ? (
        <Chat
          chatId={activeChatId}
          currentUser={currentUser}
          recipient={selectedUser}
        />
      ) : (
        <div className="no-chat-selected">
          <div className="no-chat-content">
            <h2>Welcome to Chat App</h2>
            <p>Select a user from the sidebar to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App