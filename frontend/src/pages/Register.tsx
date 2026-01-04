import Logo from "../components/ui/LogoWText";

import Divider from "../components/auth/Divider";
import SocialTray from "../components/auth/SocialTray";
import AuthPageFooter from "../components/auth/AuthPageFooter";
import AuthHeaderText from "../components/auth/AuthHeaderText";
import RegisterComponent from "../components/auth/RegisterComponent";

function Register() {
  return (
    <div className="w-full h-full flex p-8">
      <div className="w-1/2 h-full flex">
        <img
          src="/sideImage.png"
          alt=""
          className="rounded-lg h-full w-full object-cover"
        />
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center px-16 bg-gray-50/30">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <div className="w-full max-w-lg space-y-6 flex-1 flex flex-col justify-center">
          {/* Welcome Header */}
          <AuthHeaderText type="register" />

          {/* Register Form */}
          <RegisterComponent />

          {/* Divider */}
          <Divider />

          {/* Social Login Icons */}
          <SocialTray />
        </div>
        {/* Sign In Link */}
        <AuthPageFooter type="register" />
      </div>
    </div>
  );
}

export default Register;
