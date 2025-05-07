import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import PostDPLoader from "./PostDPLoader";
import MapViewLoader from "./MapViewLoader";
import ListDogLoader from "./ListDogLoader";
import UserLoader from "./UserLoader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: location.pathname },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, location]);

  const getLoadingComponent = (pathname) => {
    switch (pathname) {
      case "/map":
        return <MapViewLoader />;
      case "/list-dog":
        return <ListDogLoader />;
      case "/PostDP":
        return <PostDPLoader />;
      case "/users":
        return <UserLoader />;
      default:
        return <div>Loading...</div>;
    }
  };

  if (isLoading) return getLoadingComponent(location.pathname);

  if (isAuthenticated) return children;

  

  return null;
};

export default ProtectedRoute;
