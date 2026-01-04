import {
  AppleIcon,
  FacebookIcon,
  GithubIcon,
  GoogleIcon,
  MicrosoftIcon,
} from "../../Svg/SocialIcons";

const socialButtons: Record<string, React.ReactNode> = {
  microsoft: <MicrosoftIcon />,
  google: <GoogleIcon />,
  facebook: <FacebookIcon />,
  apple: <AppleIcon />,
  github: <GithubIcon />,
};
function SocialTray() {
  return (
    <div className="flex justify-center space-x-4">
      {Object.entries(socialButtons).map(([key, icon]) => (
        <button
          key={key}
          className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

export default SocialTray;