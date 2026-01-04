import type { Tabs } from "../../types/declaration";
import UploadContent from "./content/UploadContent";
import ExploreContent from "./content/ExploreContent";
import UsersContent from "./content/UsersContent";

function DContent({ currentTab }: { isTablet: boolean; currentTab: Tabs }) {
  return (
    <div className="p-6">
      {(() => {
        switch (currentTab) {
          case "Explore":
            return <ExploreContent />;
          case "Upload":
            return <UploadContent />;
          case "Users":
            return <UsersContent />;
          default:
            return <ExploreContent />;
        }
      })()}
    </div>
  );
}

export default DContent;
