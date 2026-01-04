import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BlueGradientButton from "../ui/BlueGradientButton";
import LabeledField from "../ui/LabeledField";
import {
  checkEmail,
  checkPassword,
  checkPasswordMatch,
} from "../../utils/validationUtils";

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
  };
}

function RegisterComponent() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormData>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!form.username || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
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
        toast.success("Account created successfully!");
        navigate("/dashboard/explore");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
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

  const getConfirmPasswordError = () => {
    if (
      form.confirmPassword.length > 0 &&
      !checkPasswordMatch(form.confirmPassword, form.password)
    ) {
      return "Passwords doesn't match";
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
          placeholder="Enter your email"
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
        <LabeledField
          title="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
          }
          errorMessage={getConfirmPasswordError()}
          required
        />
      </div>

      <div className="flex items-center py-1 w-full">
        <label className="flex items-center cursor-pointer">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="mr-2"
            required
          />
          <span className="text-sm text-gray-700 font-light">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <BlueGradientButton
        loading={loading}
        title="Create Account"
        classes="h-12 w-full"
        rounded="rounded-xl"
        type="submit"
      />
    </form>
  );
}

export default RegisterComponent;
