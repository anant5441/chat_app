import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import { isUserOnline, getInitials } from "../utils/chatUtils";
import "../styles/UserList.css";

export const UserList = ({ currentUserId, searchQuery, selectedUser, onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for all users
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("name"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const usersList = [];
                snapshot.forEach((doc) => {
                    // Exclude current user from the list
                    if (doc.id !== currentUserId) {
                        usersList.push({ id: doc.id, ...doc.data() });
                    }
                });
                setUsers(usersList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUserId]);

    // Filter users based on search query
    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="user-list-loading">Loading users...</div>;
    }

    if (filteredUsers.length === 0) {
        return (
            <div className="user-list-empty">
                {searchQuery ? "No users found" : "No other users yet"}
            </div>
        );
    }

    return (
        <div className="user-list">
            {filteredUsers.map((user) => {
                const online = isUserOnline(user.lastOnline);
                const isSelected = selectedUser?.id === user.id;

                return (
                    <div
                        key={user.id}
                        className={`user-item ${isSelected ? "selected" : ""}`}
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="user-avatar-container">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                            ) : (
                                <div className="user-avatar-fallback">
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <span className={`online-indicator ${online ? "online" : "offline"}`}></span>
                        </div>

                        <div className="user-info">
                            <h4 className="user-name">{user.name}</h4>
                            <p className="user-email">{user.email}</p>
                        </div>

                        <button
                            className="connect-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectUser(user);
                            }}
                        >
                            + Connect
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
