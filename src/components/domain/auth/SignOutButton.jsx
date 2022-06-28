import { useAuth } from "~/lib/firebase";

export const SignOutButton = (props) => {
  const handleClick = () => {
    const auth = useAuth();
    auth.signOut();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="btn normal-case"
    >
      Sign Out
    </button>
  );
};
