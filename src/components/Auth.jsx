import { auth, provider, db } from "../firebase-config.js"
import { signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useState } from "react"
import Cookies from "universal-cookie"
const cookies = new Cookies()

export const Auth = (props) => {
    const { setIsAuth } = props;

    // Save or update user in Firestore
    const saveUserToFirestore = async (user) => {
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // New user - create document
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName || "Anonymous",
                    email: user.email,
                    avatar: user.photoURL || "",
                    createdAt: serverTimestamp(),
                    lastOnline: serverTimestamp()
                });
                console.log("New user created in Firestore");
            } else {
                // Existing user - update lastOnline
                await updateDoc(userRef, {
                    lastOnline: serverTimestamp()
                });
                console.log("User lastOnline updated");
            }
        } catch (error) {
            console.error("Error saving user to Firestore:", error);
        }
    };

    const [error, setError] = useState(null);

    const signInWithGoogle = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, provider)
            console.log("Sign in successful:", result)

            // Save user to Firestore
            await saveUserToFirestore(result.user);

            // Use accessToken instead of refreshToken for better security
            cookies.set("auth-token", result.user.accessToken)
            setIsAuth(true)
        } catch (error) {
            console.error("Authentication error:", error);
            setError(error.message);
        }
    }

    return (
        <div className="auth">
            <p>Sign In With Google To Continue</p>
            <button onClick={signInWithGoogle}>Sign In With Google</button>
            {error && <p style={{ color: 'red', marginTop: '10px', maxWidth: '300px', textAlign: 'center' }}>{error}</p>}
        </div>
    )
}