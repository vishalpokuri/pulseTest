import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BlueGradientButton from "../ui/BlueGradientButton";
import LabeledField from "../ui/LabeledField";
import { checkEmail, checkPassword } from "../../utils/validationUtils";

interface LoginFormData {
  username: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
  };
}

function LoginComponent() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormData>({
    username: "alice",
    password: "passwordA",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        }
      );

      if (response.ok) {
        const data: AuthResponse = await response.json();
        localStorage.setItem("accessToken", data.token);
        toast.success("Logged in successfully");
        navigate("/dashboard/explore");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Login failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const getEmailError = () => {
    if (form.username.length > 0 && !checkEmail(form.username)) {
      return "Please enter a valid username.";
    }
    return undefined;
  };

  const getPasswordError = () => {
    if (form.password.length > 0 && !checkPassword(form.password)) {
      return "Password must be at least 6 characters.";
    }
    return undefined;
  };

  return (
    <form
      className="space-y-6 flex flex-col items-center w-full max-w-sm mx-auto"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2 w-full">
        <LabeledField
          title="Username"
          type="text"
          placeholder="Enter your username"
          value={form.username}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, username: e.target.value }))
          }
          errorMessage={getEmailError()}
          required
        />
        <LabeledField
          title="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, password: e.target.value }))
          }
          errorMessage={getPasswordError()}
          required
        />
      </div>

      <div className="flex items-center justify-between py-1 w-full">
        <label className="flex items-center cursor-pointer">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Remember me</span>
        </label>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <BlueGradientButton
        loading={isLoading}
        title="Sign In"
        classes="h-12 w-full"
        rounded="rounded-xl"
        type="submit"
      />
    </form>
  );
}

export default LoginComponent;
