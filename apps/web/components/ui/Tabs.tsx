"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onTabChange, className = "" }: TabsProps) {
  return (
    <div
      className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              let nextIndex: number | null = null;

              if (e.key === "ArrowRight") {
                nextIndex = (currentIndex + 1) % tabs.length;
              } else if (e.key === "ArrowLeft") {
                nextIndex =
                  (currentIndex - 1 + tabs.length) % tabs.length;
              } else if (e.key === "Home") {
                nextIndex = 0;
              } else if (e.key === "End") {
                nextIndex = tabs.length - 1;
              }

              if (nextIndex !== null) {
                e.preventDefault();
                const nextTabData = tabs[nextIndex];
                if (nextTabData) {
                  onTabChange(nextTabData.id);
                  const nextTab = document.getElementById(
                    `tab-${nextTabData.id}`
                  );
                  nextTab?.focus();
                }
              }
            }}
            className={[
              "rounded-full px-5 py-2 text-sm font-semibold",
              "transition-all duration-200 cursor-pointer",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive
                ? "bg-primary text-text-on-primary shadow-[0_2px_8px_rgba(180,105,66,0.2)]"
                : "text-muted hover:text-body hover:bg-surface",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };
export type { TabsProps, Tab };
