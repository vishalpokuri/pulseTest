import type React from "react";
import { useNavigate } from "react-router-dom";
import type { Tabs } from "../../types/declaration";
import AltLogo from "../ui/AltLogo";
import Avatar from "../ui/Avatar";
import Popover from "../ui/Popover";
import PopoverItem from "../ui/PopoverItem";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { SearchIcon, UploadIcon } from "@/Svg/DashboardIcons";

const tabs: Record<Tabs, React.ReactNode> = {
  Explore: <SearchIcon />,
  Upload: <UploadIcon />,
};

function DHeader({
  isTablet,
  setCurrentTab,
  currentTab,
}: {
  isTablet: boolean;
  setCurrentTab: any;
  currentTab: Tabs;
}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    toast.success("Logged out successfully");
    window.location.href = "/login";
  };
  return (
    <>
      <div className="w-full h-[60px] bg-white border-b-[1px] border-black/20 flex font-reg justify-between items-center px-6 ">
        {!isTablet && <AltLogo />}
        <div className=" flex items-end my-auto mx-auto">
          {Object.entries(tabs).map(([key, icon]) => (
            <TabButton
              isTablet={isTablet}
              key={key}
              title={key}
              svgIcon={icon}
              selected={key === currentTab}
              onClick={() => {
                setCurrentTab(key as Tabs);
                navigate(`/dashboard/${normaliseTab(key)}`);
              }}
            />
          ))}
        </div>
        <Popover trigger={<Avatar />} position="bottom" align="end">
          <PopoverItem
            onClick={handleLogout}
            destructive
            icon={<LogOut size={16} />}
          >
            Logout
          </PopoverItem>
        </Popover>
      </div>
    </>
  );
}

export default DHeader;

function TabButton({
  svgIcon,
  title,
  selected,
  onClick,
  isTablet,
}: {
  svgIcon: React.ReactNode;
  title: string;
  selected: boolean;
  onClick: () => void;
  isTablet: boolean;
}) {
  return (
    <button
      className={`flex items-center space-x-2 mx-1 px-3 py-2 hover:bg-black/6 hover:rounded-md cursor-pointer transform duration-150  ${
        selected && "bg-black/6 rounded-md"
      }`}
      onClick={onClick}
    >
      <div>{svgIcon}</div>
      {!isTablet && (
        <span className="text-xs font-medium text-black">{title}</span>
      )}
    </button>
  );
}

function normaliseTab(tab: string) {
  return tab.toLowerCase().replace(" ", "_");
}
