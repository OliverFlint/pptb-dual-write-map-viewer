import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Caption1,
  Card,
  FluentProvider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  ProgressBar,
  Text,
  Title2,
  ToolbarButton,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import {
  ArrowCounterclockwiseFilled,
  PlugConnected20Regular,
  PlugDisconnected20Regular,
} from "@fluentui/react-icons";
import {
  useConnection,
  useEventLog,
  useToolboxEvents,
} from "./hooks/useToolboxAPI";
import { SolutionPicker } from "./components/SolutionPicker";
import { DualWriteMapList } from "./components/DualWriteMapList";
import {
  DualWriteMap,
  useDualWriteMaps,
  useSolutionList,
} from "./hooks/useDataverseApi";
import { DualWriteMapPreview } from "./components/DualWriteMapPreview";

function App() {
  const { connection, isLoading: connectionLoading, refreshConnection } = useConnection();
  const { addLog } = useEventLog();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [solutionRefresh, setSolutionRefresh] = useState(0);
  const {
    solutions,
    isLoading: solutionsLoading,
    error: solutionsError,
  } = useSolutionList(!!connection, connection?.id, solutionRefresh);
  const [selectedSolutionId, setSelectedSolutionId] = useState<
    string | undefined
  >(undefined);
  const {
    maps,
    isLoading: mapsLoading,
    error: mapsError,
  } = useDualWriteMaps(selectedSolutionId);
  const [selectedMap, setSelectedMap] = useState<DualWriteMap | undefined>();

  const handleEvent = useCallback(
    (event: string) => {
      if (
        event === "connection:updated" ||
        event === "connection:created" ||
        event === "connection:deleted"
      ) {
        refreshConnection();
      }
    },
    [refreshConnection],
  );

  useToolboxEvents(handleEvent);

  useEffect(() => {
    addLog("Dual Write Map Viewer initialized", "success");
  }, [addLog]);

  useEffect(() => {
    window.toolboxAPI.utils
      .getCurrentTheme()
      .then((currentTheme) => setTheme(currentTheme === "dark" ? "dark" : "light"))
      .catch((error) => console.error("Error getting theme:", error));
  }, []);

  const refresh = () => {
    setSelectedSolutionId(undefined);
    setSelectedMap(undefined);
    setSolutionRefresh((previous) => previous + 1);
  };

  return (
    <FluentProvider theme={theme === "dark" ? webDarkTheme : webLightTheme}>
      <main className="app-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <img src="./icons/app-icon.svg" alt="" />
            </div>
            <div className="brand-copy">
              <Title2 className="app-title">Dual Write Map Viewer</Title2>
            </div>
          </div>
          <div className="connection-state" aria-live="polite">
            <Badge
              appearance="tint"
              color={connection ? "success" : connectionLoading ? "informative" : "danger"}
              icon={connection ? <PlugConnected20Regular /> : <PlugDisconnected20Regular />}
            >
              {connection ? "Connected" : connectionLoading ? "Checking connection" : "No connection"}
            </Badge>
            {connection && (
              <span className="connection-name" title={connection.url}>
                {connection.name}
              </span>
            )}
          </div>
        </header>

        <section className="workspace-toolbar" aria-label="Solution selection">
          <div className="toolbar-label">
            <Caption1 className="eyebrow">BROWSE BY SOLUTION</Caption1>
            <Text className="toolbar-hint">
              Choose a solution to explore its entity maps.
            </Text>
          </div>
          <div className="solution-control">
            <SolutionPicker
              solutions={solutions}
                isConnected={!!connection || connectionLoading}
              onSolutionSelected={(data) => {
                setSelectedSolutionId(data.solutionId);
                setSelectedMap(undefined);
                addLog(`Selected solution: ${data.solutionName}`, "info");
              }}
            />
          </div>
          <ToolbarButton
            aria-label="Refresh solutions"
            title="Refresh solutions"
            icon={<ArrowCounterclockwiseFilled />}
            onClick={refresh}
          >
            Refresh
          </ToolbarButton>
        </section>

        {solutionsError && (
          <MessageBar intent="error" className="status-message">
            <MessageBarBody>
              <MessageBarTitle>Unable to load solutions</MessageBarTitle>
              {solutionsError}
            </MessageBarBody>
          </MessageBar>
        )}
        {mapsError && (
          <MessageBar intent="error" className="status-message">
            <MessageBarBody>
              <MessageBarTitle>Unable to load maps</MessageBarTitle>
              {mapsError}
            </MessageBarBody>
          </MessageBar>
        )}

        {(!connection || solutionsLoading || mapsLoading) && (
          <div className="inline-status" aria-live="polite">
            {!connection ? connectionLoading ? (
              <>
                <ProgressBar className="inline-progress" />
                <Text>Checking ToolBox connection…</Text>
              </>
            ) : (
              <>
                <PlugDisconnected20Regular />
                <div>
                  <Text weight="semibold">Connect an environment to get started</Text>
                  <Caption1>
                    Select a Dataverse connection for this tool in Power Platform ToolBox.
                  </Caption1>
                </div>
              </>
            ) : (
              <>
                <ProgressBar className="inline-progress" />
                <Text>{solutionsLoading ? "Loading solutions…" : "Loading Dual Write maps…"}</Text>
              </>
            )}
          </div>
        )}

        <div className="workspace-grid">
          <Card className="map-panel" appearance="filled-alternative">
            <div className="panel-heading">
              <div className="panel-copy">
                <Caption1 className="eyebrow">SOLUTION CONTENTS</Caption1>
                <Title2 className="panel-title">Dual Write maps</Title2>
              </div>
              {selectedSolutionId && maps && (
                <Badge appearance="tint" color="informative">{maps.length}</Badge>
              )}
            </div>
            <div className="map-list-body">
              {solutionsLoading || mapsLoading ? (
                <div className="panel-placeholder">
                  <ProgressBar />
                  <Caption1>Loading map library…</Caption1>
                </div>
              ) : !connection ? (
                <div className="panel-placeholder">
                  <PlugDisconnected20Regular />
                  <Text weight="semibold">Waiting for a connection</Text>
                  <Caption1>Connect an environment to browse its solutions.</Caption1>
                </div>
              ) : !selectedSolutionId ? (
                <div className="panel-placeholder">
                  <Text weight="semibold">Choose a solution</Text>
                  <Caption1>Your Dual Write maps will appear here.</Caption1>
                </div>
              ) : (
                <DualWriteMapList
                  dualwritemaps={maps}
                  onMapSelected={(data) => setSelectedMap(data.dualwritemap)}
                />
              )}
            </div>
          </Card>

          <Card className="preview-panel" appearance="filled-alternative">
            {selectedMap ? (
              <DualWriteMapPreview dualwritemap={selectedMap} />
            ) : (
              <div className="preview-empty">
                <div className="preview-glyph" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <i />
                </div>
                <Caption1 className="eyebrow">MAP DOCUMENTATION</Caption1>
                <Title2 className="panel-title">Your map, made readable.</Title2>
                <Text>
                  Select a Dual Write map to inspect its field mappings, sync direction,
                  value maps, source JSON, and generated diagram.
                </Text>
                {selectedSolutionId && maps?.length === 0 && (
                  <Button appearance="subtle" onClick={refresh}>Refresh solution data</Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </FluentProvider>
  );
}

export default App;
