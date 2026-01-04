import type { Tabs } from "../../types/declaration";

function DContent({
  isTablet,
  currentTab,
}: {
  isTablet: boolean;
  currentTab: Tabs;
}) {
  return (
    <div className="p-6">
      {(() => {
        switch (currentTab) {
          case "Explore":
            return <div>Explore Content</div>;
          case "Upload":
            return <div>Upload Content</div>;
          default:
            return <div>Explore Content</div>;
        }
      })()}
    </div>
  );
}

export default DContent;
