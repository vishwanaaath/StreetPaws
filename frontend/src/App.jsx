import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdoptionStats from "./components/AdoptionStats";
import MapView from "./components/MapView.jsx";
import ListDog from "./components/ListDog.jsx";
import Profile from "./components/Profile.jsx";
import PostDP from "./components/PostDP.jsx";
import EditDog from "./components/EditDog.jsx";
import UsersList from "./components/UsersList";
import User from "./components/User.jsx";
import Explore from "./components/explore.jsx";
 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdoptionStats />} />
        <Route
          path="/map"
          element={ 
            <MapView /> 
          }
        />
        <Route
          path="/PostDP"
          element={
            <ProtectedRoute>
              <PostDP />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-dog"
          element={
            <ProtectedRoute>
              <ListDog />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-dog" element={<EditDog />} />
        <Route path="/users" element={<UsersList />} />;
        <Route path="/user" element={<User />} />;
        <Route path="/explore" element={<Explore />} />;
      </Routes>
    </Router>
  );
}

export default App;
