function AuthHeaderText({ type = "login" }: { type?: "login" | "register" }) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-sb text-gray-900 tracking-tight leading-tight">
        {type === "login" ? "Welcome Back" : "Create Account"}
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed font-light">
        {type === "login" 
          ? "Enter your email and password to access your account"
          : "Fill in your details to create a new account"}
      </p>
    </div>
  );
}

export default AuthHeaderText;