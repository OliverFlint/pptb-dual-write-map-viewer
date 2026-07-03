import React, { useCallback, useEffect, useState } from "react";
import {
  FluentProvider,
  ProgressBar,
  webLightTheme,
  webDarkTheme,
  ToolbarButton,
} from "@fluentui/react-components";
import {
  useConnection,
  useEventLog,
  useToolboxEvents,
} from "./hooks/useToolboxAPI";
import { ArrowCounterclockwiseFilled } from "@fluentui/react-icons";
import { SolutionPicker } from "./components/SolutionPicker";
import { DualWriteMapList } from "./components/DualWriteMapList";
import {
  DualWriteMap,
  useDualWriteMaps,
  useSolutionList,
} from "./hooks/useDataverseApi";
import { DualWriteMapPreview } from "./components/DualWriteMapPreview";

function App() {
  const { connection, refreshConnection } = useConnection();
  const { addLog } = useEventLog();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [solutionRefresh, setSolutionRefresh] = useState(0);
  const {
    solutions,
    isLoading: solutionsLoading,
    message: solutionsMessage,
  } = useSolutionList([connection, solutionRefresh]);
  const [selectedSolutionId, setSelectedSolutionId] = useState<
    string | undefined
  >(undefined);
  const {
    maps,
    isLoading: mapsLoading,
    message: mapsMessage,
  } = useDualWriteMaps(selectedSolutionId);
  const [selectedMap, setSelectedMap] = useState<DualWriteMap | undefined>(
    undefined,
  );

  // Handle platform events
  const handleEvent = useCallback(
    (event: string, _data: any) => {
      switch (event) {
        case "connection:updated":
        case "connection:created":
          refreshConnection();
          break;

        case "connection:deleted":
          refreshConnection();
          break;

        case "terminal:output":
        case "terminal:command:completed":
        case "terminal:error":
          // Terminal events handled by dedicated components
          break;
      }
    },
    [refreshConnection],
  );

  useToolboxEvents(handleEvent);

  // Add initial log (run only once on mount)
  useEffect(() => {
    addLog("React Sample Tool initialized", "success");
  }, [addLog]);

  // Get theme from Toolbox API
  useEffect(() => {
    const getTheme = async () => {
      try {
        const currentTheme = await window.toolboxAPI.utils.getCurrentTheme();
        setTheme(currentTheme === "dark" ? "dark" : "light");
      } catch (error) {
        console.error("Error getting theme:", error);
      }
    };
    getTheme();
  }, []);

  return (
    <FluentProvider theme={theme === "dark" ? webDarkTheme : webLightTheme}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "var(--colorNeutralBackground2)",
        }}
      >
        {solutionsLoading || mapsLoading ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--colorNeutralBackground2)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
            }}
          >
            <ProgressBar style={{ width: "250px" }} />
            <div style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--colorNeutralForeground2)" }}>
              {solutionsLoading ? solutionsMessage : mapsMessage}
            </div>
          </div>
        ) : null}
        <div
          style={{
            backgroundColor: "var(--colorNeutralBackground3)",
            borderBottom: "1px solid var(--colorNeutralStroke1)",
            padding: "0.75rem 1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <SolutionPicker
                solutions={solutions}
                onSolutionSelected={(data) => {
                  setSelectedSolutionId(data.solutionId);
                  addLog(
                    `Selected solution: ${data.solutionName} (${data.solutionId})`,
                    "info",
                  );
                }}
              />
            </div>
            <ToolbarButton
              aria-label="Refresh Solutions"
              appearance="primary"
              title="Refresh Solutions"
              icon={<ArrowCounterclockwiseFilled />}
              onClick={() => {
                setSelectedSolutionId(undefined);
                setSelectedMap(undefined);
                setSolutionRefresh((prev) => prev + 1);
              }}
            >
              Refresh
            </ToolbarButton>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--colorNeutralStroke1)",
              minWidth: "280px",
              maxWidth: "400px",
              padding: "1rem",
              gap: "1rem",
            }}
          >
            <DualWriteMapList
              dualwritemaps={selectedSolutionId ? maps : undefined}
              onMapSelected={(data) => setSelectedMap(data.dualwritemap)}
            />
          </div>
<div
           style={{
             flex: 3,
             padding: "1.5rem",
             overflow: "auto",
           }}
         >
            <DualWriteMapPreview dualwritemap={selectedMap} />
          </div>
        </div>
      </div>
    </FluentProvider>
  );
}

export default App;
