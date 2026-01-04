import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DContent from "../components/dashboard/DContent";
import DHeader from "../components/dashboard/DHeader";
import type { Tabs } from "../types/declaration";
import { TabRoutes } from "../types/declaration";

// Convert route (e.g., "explore") to tab (e.g., "Explore")
function routeToTab(route: string): Tabs {
  const entry = Object.entries(TabRoutes).find(
    ([key, _value]) => key === route
  );
  return entry ? (entry[1] as Tabs) : "Explore";
}

function Dashboard() {
  const { panel_id } = useParams<{ panel_id: string }>();
  const [isTabletHeader, setIsTabletHeader] = useState<boolean>(false);
  const [isTabletContent, setIsTabletContent] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<Tabs>(() =>
    panel_id ? routeToTab(panel_id) : "Explore"
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTabletHeader(window.innerWidth < 1080);
      setIsTabletContent(window.innerWidth < 940);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isTabletContent, isTabletHeader, setIsTabletContent, setIsTabletHeader]);

  useEffect(() => {
    if (panel_id) {
      const tabFromRoute = routeToTab(panel_id);
      if (tabFromRoute !== currentTab) {
        setCurrentTab(tabFromRoute);
      }
    }
  }, [panel_id]);

  return (
    <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">
      <DHeader
        isTablet={isTabletHeader}
        setCurrentTab={setCurrentTab}
        currentTab={currentTab}
      />
      <div className="flex-1 overflow-x-hidden">
        <DContent isTablet={isTabletContent} currentTab={currentTab} />
      </div>
    </div>
  );
}
export default Dashboard;
