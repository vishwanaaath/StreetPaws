// LoginButton.jsx
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = ({ returnTo }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() =>
        loginWithRedirect({
          appState: { returnTo: returnTo || window.location.pathname },
        })
      }>
      Log In
    </button>
  );
};

export default LoginButton;
