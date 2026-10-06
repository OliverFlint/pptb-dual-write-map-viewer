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
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  ProgressBar,
  Text,
  Title2,
  ToolbarButton,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import {
  ArrowCounterclockwiseFilled,
  ArrowDownload20Regular,
  ChevronDown20Regular,
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
import { generateMapMarkdown } from "./utils/generateMapMarkdown";
import { generateMapDiagram } from "./utils/generateMapDiagram";

type ExportFormat = "markdown" | "diagram" | "both";

function safeFilename(name: string, extension: "md" | "mmd"): string {
  const safeName = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/[. ]+$/g, "")
    .trim();
  return `${safeName || "dual-write-map"}.${extension}`;
}

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
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{
    intent: "success" | "error" | "info";
    title: string;
    message: string;
  }>();

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

  const exportMapSet = async (
    targetMaps: DualWriteMap[],
    format: ExportFormat,
    exportAll: boolean,
  ) => {
    if (!targetMaps.length) return;
    setIsExporting(true);
    setExportFeedback(undefined);
    try {
      const files = targetMaps.flatMap((map) => {
        const generated: { filename: string; content: string; type: string }[] = [];
        if (format === "markdown" || format === "both") {
          generated.push({
            filename: safeFilename(map.Name, "md"),
            content: generateMapMarkdown(map),
            type: "Markdown",
          });
        }
        if (format === "diagram" || format === "both") {
          generated.push({
            filename: safeFilename(map.Name, "mmd"),
            content: generateMapDiagram(map),
            type: "Mermaid diagram",
          });
        }
        return generated;
      });
      const usedFilenames = new Set<string>();
      for (const file of files) {
        const extensionIndex = file.filename.lastIndexOf(".");
        const baseName = file.filename.slice(0, extensionIndex);
        const extension = file.filename.slice(extensionIndex);
        let filename = file.filename;
        let suffix = 2;
        while (usedFilenames.has(filename.toLowerCase())) {
          filename = `${baseName}-${suffix++}${extension}`;
        }
        file.filename = filename;
        usedFilenames.add(filename.toLowerCase());
      }

      if (!exportAll && files.length === 1) {
        const file = files[0];
        const extension = file.filename.split(".").pop() || "md";
        const path = await window.toolboxAPI.fileSystem.saveFile(
          file.filename,
          file.content,
          [{ name: file.type, extensions: [extension] }],
        );
        setExportFeedback(
          path
            ? { intent: "success", title: "Export complete", message: `Saved ${file.filename}.` }
            : { intent: "info", title: "Export cancelled", message: "No file was saved." },
        );
        return;
      }

      const folder = await window.toolboxAPI.fileSystem.selectPath({
        type: "folder",
        title: `Choose a folder for ${format === "both" ? "Markdown and diagram" : format === "diagram" ? "Mermaid diagram" : "Markdown"} exports`,
        buttonLabel: "Export here",
      });
      if (!folder) {
        setExportFeedback({ intent: "info", title: "Export cancelled", message: "No files were saved." });
        return;
      }

      const separator = folder.includes("\\") ? "\\" : "/";
      const folderPath = folder.endsWith(separator) ? folder : `${folder}${separator}`;
      let written = 0;
      for (const file of files) {
        await window.toolboxAPI.fileSystem.writeText(
          `${folderPath}${file.filename}`,
          file.content,
        );
        written += 1;
      }
      setExportFeedback({
        intent: "success",
        title: "Export complete",
        message: `Saved ${written} ${written === 1 ? "file" : "files"} to ${folder}.`,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setExportFeedback({ intent: "error", title: "Export failed", message: detail });
    } finally {
      setIsExporting(false);
    }
  };

  const exportSelectedMap = (format: ExportFormat) => {
    if (selectedMap) void exportMapSet([selectedMap], format, false);
  };

  const exportAllMaps = (format: ExportFormat) => {
    if (maps?.length) void exportMapSet(maps, format, true);
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
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="secondary"
                icon={<ChevronDown20Regular />}
                iconPosition="after"
                disabled={!selectedMap || isExporting}
              >
                Export selected
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<ArrowDownload20Regular />} onClick={() => exportSelectedMap("markdown")}>Markdown (.md)</MenuItem>
                <MenuItem icon={<ArrowDownload20Regular />} onClick={() => exportSelectedMap("diagram")}>Diagram (.mmd)</MenuItem>
                <MenuItem icon={<ArrowDownload20Regular />} onClick={() => exportSelectedMap("both")}>Both formats</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="primary"
                icon={<ChevronDown20Regular />}
                iconPosition="after"
                disabled={!selectedSolutionId || !maps?.length || mapsLoading || isExporting}
              >
                {isExporting ? "Exporting…" : "Export all maps"}
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<ArrowDownload20Regular />} onClick={() => exportAllMaps("markdown")}>Markdown (.md)</MenuItem>
                <MenuItem icon={<ArrowDownload20Regular />} onClick={() => exportAllMaps("diagram")}>Diagram (.mmd)</MenuItem>
                <MenuItem icon={<ArrowDownload20Regular />} onClick={() => exportAllMaps("both")}>Both formats</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </section>

        {exportFeedback && (
          <MessageBar intent={exportFeedback.intent} className="status-message">
            <MessageBarBody>
              <MessageBarTitle>{exportFeedback.title}</MessageBarTitle>
              {exportFeedback.message}
            </MessageBarBody>
          </MessageBar>
        )}

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
              <DualWriteMapPreview dualwritemap={selectedMap} theme={theme} />
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
