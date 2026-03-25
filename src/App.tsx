import React, { useCallback, useEffect, useState } from "react";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Toolbar,
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
  const { solutions } = useSolutionList([connection, solutionRefresh]);
  const [selectedSolutionId, setSelectedSolutionId] = useState<
    string | undefined
  >(undefined);
  const { maps } = useDualWriteMaps(selectedSolutionId);
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
    <FluentProvider
      theme={theme === "dark" ? webDarkTheme : webLightTheme}
      style={{ maxWidth: "98%", maxHeight: "98%" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "98%",
          maxHeight: "98%",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--colorNeutralBackground3)",
            borderBottomColor: "var(--colorNeutralBackgroundInverted)",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
          }}
        >
          <Toolbar>
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
            {/* <ToolbarDivider />
            <ToolbarButton
              aria-label="Generate Documentation"
              appearance="primary"
              title="Generate Documentation"
              icon={<DocumentSaveRegular />}
            >
              Generate
            </ToolbarButton> */}
          </Toolbar>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            maxWidth: "98%",
            maxHeight: "98%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRightColor: "var(--colorNeutralBackgroundInverted)",
              borderRightWidth: "1px",
              borderRightStyle: "solid",
              minWidth: "200px",
              maxWidth: "400px",
              padding: "0.5rem",
            }}
          >
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
            <DualWriteMapList
              dualwritemaps={selectedSolutionId ? maps : undefined}
              onMapSelected={(data) => setSelectedMap(data.dualwritemap)}
            />
          </div>
          <div
            style={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              padding: "0.5rem",
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
