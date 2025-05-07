// components/UsersList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Link } from "react-router-dom";
import UserLoader from "./UserLoader";


const UsersList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleListerProfileClick = async (listerId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/mongo/${listerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/user", { state: { user: response.data } });
    } catch (error) {
      console.error("Error fetching lister's profile:", error);
    }
  };

  if (loading) {
    return <UserLoader/>;
  }
 return (
   <div className="min-h-screen bg-gray-50 pt-6 px-2">
     {/* Background Animation */}
     <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0 pointer-events-none" />

     <div className="relative z-10 max-w-2xl mx-auto">
       <h1 className="text-2xl font-bold text-center text-violet-800 mb-4">
         Community
       </h1>

       <div className="flex flex-col">
         {users.map((user) => (
           <div
             key={user._id}
             onClick={() => handleListerProfileClick(user._id)}
             className="cursor-pointer flex items-center bg-white hover:bg-gray-50 transition-colors border-b px-3 py-2">
             <img
               src={
                 user.dp_url ||
                 "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
               }
               alt="profile"
               className="w-10 h-10 rounded-full object-cover"
             />
             <div className="ml-3 flex-1 min-w-0">
               <h2 className="text-sm font-medium text-gray-900 truncate">
                 {user.username}
               </h2>
               <p className="text-xs text-gray-500">
                 {user.dogsListed?.length || 0}{" "}
                 {user.dogsListed?.length === 1 ? "rescue" : "rescues"}
               </p>
             </div>
             <div className="opacity-60">
               <svg
                 xmlns="http://www.w3.org/2000/svg"
                 className="h-4 w-4 text-violet-600"
                 viewBox="0 0 20 20"
                 fill="currentColor">
                 <path
                   fillRule="evenodd"
                   d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                   clipRule="evenodd"
                 />
               </svg>
             </div>
           </div>
         ))}
       </div>
     </div>
   </div>
 );

};

export default UsersList;