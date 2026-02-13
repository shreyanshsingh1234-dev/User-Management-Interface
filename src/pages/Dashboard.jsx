import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UserList from '../components/UserList';
import './Dashboard.css';

function Dashboard({ onLogout }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Fetch users from API
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = (newUser) => {
        // In a real app, this would be an API call
        const userWithId = {
            ...newUser,
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
        };

        setUsers(prev => [userWithId, ...prev]);
        setFilteredUsers(prev => [userWithId, ...prev]);
    };

    const handleEditUser = (updatedUser) => {
        setUsers(prev =>
            prev.map(user => user.id === updatedUser.id ? updatedUser : user)
        );
        setFilteredUsers(prev =>
            prev.map(user => user.id === updatedUser.id ? updatedUser : user)
        );
    };

    const handleDeleteUser = (userId) => {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setFilteredUsers(prev => prev.filter(user => user.id !== userId));
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="dashboard">
            <Sidebar
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
            />

            <div className={`dashboard-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <UserList
                                users={filteredUsers}
                                isLoading={isLoading}
                                error={error}
                                onAddUser={handleAddUser}
                                onEditUser={handleEditUser}
                                onDeleteUser={handleDeleteUser}
                                onSearch={handleSearch}
                                searchQuery={searchQuery}
                                onRetry={fetchUsers}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
}

export default Dashboard;
