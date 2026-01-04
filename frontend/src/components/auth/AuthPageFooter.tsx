import { Link } from "react-router-dom";
import type { AuthType } from "../../types/declaration";

function AuthPageFooter({ type }: { type: AuthType }) {
  return (
    <div className="text-center h-[20px] flex flex-row space-x-1 font-reg">
      <p className="text-base text-gray-600">
        {type === "login"
          ? "Don't have an account?"
          : "Already have an account?"}
      </p>
      <Link
        to={type === "login" ? "/register" : "/login"}
        className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
      >
        {type === "login" ? "Sign Up" : "Sign In"}
      </Link>
    </div>
  );
}

export default AuthPageFooter;