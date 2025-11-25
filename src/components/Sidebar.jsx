import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { UserList } from "./UserList";
import { getInitials } from "../utils/chatUtils";
import "../styles/Sidebar.css";

export const Sidebar = ({ currentUser, selectedUser, onSelectUser, onSignOut }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            onSignOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    if (!currentUser) {
        return <div className="sidebar">Loading...</div>;
    }

    return (
        <div className="sidebar">
            {/* Current User Section */}
            <div className="current-user-section">
                <div className="current-user-info">
                    {currentUser.avatar ? (
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="current-user-avatar"
                        />
                    ) : (
                        <div className="current-user-avatar-fallback">
                            {getInitials(currentUser.name)}
                        </div>
                    )}
                    <div className="current-user-details">
                        <h3 className="current-user-name">{currentUser.name}</h3>
                        <p className="current-user-email">{currentUser.email}</p>
                    </div>
                </div>
                <button className="sign-out-button" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* User List */}
            <div className="users-section">
                <h4 className="users-section-title">Users</h4>
                <UserList
                    currentUserId={currentUser.uid}
                    searchQuery={searchQuery}
                    selectedUser={selectedUser}
                    onSelectUser={onSelectUser}
                />
            </div>
        </div>
    );
};
