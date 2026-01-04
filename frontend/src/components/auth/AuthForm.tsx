import type { AuthType } from "../../types/declaration";
import LoginComponent from "./LoginComponent";
import RegisterComponent from "./RegisterComponent";

function AuthForm({ type }: { type: AuthType }) {
  if (type === "login") {
    return <LoginComponent />;
  } else {
    return <RegisterComponent />;
  }
}

export default AuthForm;