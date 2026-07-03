import {
  Caption1,
  Divider,
  Subtitle1,
  Subtitle2,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TabList,
  TabValue,
  Title1,
  makeStyles,
  Body1,
} from "@fluentui/react-components";
import { DualWriteMap } from "../hooks/useDataverseApi";
import { Key, memo, useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mustache from "mustache";
import rehypeRaw from "rehype-raw";
import mermaid, { RenderResult } from "mermaid";

const useStyles = makeStyles({
  header: {
    marginBottom: "0.5rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "var(--colorNeutralBackground3)",
    borderRadius: "8px",
    marginBottom: "1rem",
    width: "100%",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  section: {
    marginTop: "1.5rem",
  },
  table: {
    maxWidth: "100%",
    overflow: "auto",
    marginTop: "0.5rem",
  },
  emptyMessage: {
    padding: "2rem",
    textAlign: "center",
    color: "var(--colorNeutralForeground3)",
    width: "100%",
  },
  diagramContainer: {
    backgroundColor: "var(--colorNeutralBackground3)",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "0.5rem",
    overflow: "auto",
  },
});

export interface DualWriteMapPreview {
  dualwritemap?: DualWriteMap;
}

export const DualWriteMapPreview = (props: DualWriteMapPreview) => {
  const { dualwritemap } = props;
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>("detailTab");

  const DetailsTab = memo(() => {
    const data = dualwritemap ? JSON.parse(dualwritemap.Mapping) : undefined;
    const directions: { [key: string]: string } = {
      "1": "→",
      "2": "←",
      "3": "⇆",
    };
    const valueMapKeys = data?.legs?.flatMap((leg: any) =>
      leg.fieldMappings?.flatMap((fm: any) =>
        fm.valueTransforms
          ? fm.valueTransforms.flatMap((vt: any) => {
              if (vt.valueMap && vt.transformType === "ValueMap") {
                const keys = Object.keys(vt.valueMap);
                return {
                  name: `${fm.sourceField} = ${fm.destinationField}`,
                  valueMap: keys
                    .map((k) => ({ key: k, value: vt.valueMap[k] }))
                    .sort((a: any, b: any) => a.key.localeCompare(b.key)),
                };
              }
              return {};
            })
          : [],
      ),
    );
    if (!data) {
      return (
        <div className={styles.emptyMessage}>
          <Body1>
            No map selected. Choose a solution and select a map from the list.
          </Body1>
        </div>
      );
    }
    return (
      <div style={{ maxWidth: "100%" }}>
        <Title1 className={styles.header}>{data.name}</Title1>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Caption1>Source Schema</Caption1>
            <Body1>{data?.legs[0]?.sourceSchema}</Body1>
          </div>
          <div className={styles.infoItem}>
            <Caption1>Destination Schema</Caption1>
            <Body1>{data?.legs[0]?.destinationSchema}</Body1>
          </div>
          <div className={styles.infoItem}>
            <Caption1>Source Filter</Caption1>
            <Body1>{data?.legs[0]?.sourceFilter || "N/A"}</Body1>
          </div>
        </div>

        <Divider style={{ margin: "1rem 0" }} />

        <Subtitle1 className={styles.header}>Field Mapping</Subtitle1>
        <div className={styles.table}>
          <Table size="medium">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>
                  <strong>Source Field</strong>
                </TableHeaderCell>
                <TableHeaderCell style={{ width: "100px" }}>
                  <strong>Direction</strong>
                </TableHeaderCell>
                <TableHeaderCell>
                  <strong>Destination Field</strong>
                </TableHeaderCell>
                <TableHeaderCell>
                  <strong>Default Value</strong>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.legs[0]?.fieldMappings?.map(
                (
                  m: {
                    valueTransforms: any;
                    sourceField: unknown;
                    syncDirection: string;
                    destinationField: unknown;
                  },
                  i: Key | null | undefined,
                ) => (
                  <TableRow key={i}>
                    <TableCell>{m.sourceField}</TableCell>
                    <TableCell>
                      {directions[m.syncDirection] || m.syncDirection}
                    </TableCell>
                    <TableCell>{m.destinationField}</TableCell>
                    <TableCell>
                      {m.valueTransforms
                        ? m.valueTransforms[0]?.defaultValue
                        : undefined}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>

        <Subtitle1 className={styles.section}>Value Transforms</Subtitle1>
        {valueMapKeys && valueMapKeys.length > 0 && valueMapKeys[0]?.name ? (
          valueMapKeys?.map((vm: any, index: number) => (
            <div key={index}>
              <Subtitle2 style={{ marginTop: "1rem" }}>{vm.name}</Subtitle2>
              <div className={styles.table}>
                <Table size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell style={{ width: "300px" }}>
                        <strong>D365 Value</strong>
                      </TableHeaderCell>
                      <TableHeaderCell style={{ width: "200px" }}>
                        <strong>Dataverse Value</strong>
                      </TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm?.valueMap?.map((v: any, i: Key | null | undefined) => (
                      <TableRow key={i}>
                        <TableCell>{v.key}</TableCell>
                        <TableCell>{v.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <Caption1>No value transforms defined.</Caption1>
          </div>
        )}
      </div>
    );
  });

  const MarkdownTab = memo(() => {
    const [renderedMarkdown, setRenderedMarkdown] = useState<string>();
    const [selectedMarkdownTab, setSelectedMarkdownTab] =
      useState<TabValue>("markdownPreviewTab");
    useEffect(() => {
      if (!dualwritemap) {
        setRenderedMarkdown("No map selected.");
        return;
      }
      try {
        const template = [
          "## {{name}}  ",
          "<br /><br />",
          "{{#legs}}  ",
          "Source Schema      : **{{sourceSchema}}**  ",
          "Destination Schema : **{{destinationSchema}}**  ",
          "<br /><br />",
          "### Mapping Details",
          "| Source Field | Direction | Destination Field | Default Value |   ",
          "| :- | :-: | :- | :- |",
          "{{#fieldMappings}}",
          "| {{sourceField}} | {{syncDirection}} | {{destinationField}} | {{#valueTransforms}}{{defaultValue}}{{/valueTransforms}} |",
          "{{/fieldMappings}}",
          "{{/legs}}",
          "<br /><br />",
          "### Value Transforms  ",
          "{{#valueMaps}}",
          "##### {{name}}  ",
          "| D365 | - | Dataverse |  ",
          "| :- | - | -: |",
          "{{#valueMap}}",
          "| ` {{key}} ` || ` {{value}} ` |  ",
          "{{/valueMap}}",
          "{{/valueMaps}}",
          "{{^valueMaps}}",
          "No value transforms defined.",
          "{{/valueMaps}}",
        ].join("\n");
        const view = JSON.parse(dualwritemap?.Mapping || "{}");
        const valueMapKeys = view.legs?.flatMap((leg: any) =>
          leg.fieldMappings?.flatMap((fm: any) =>
            fm.valueTransforms
              ? fm.valueTransforms.flatMap((vt: any) => {
                  if (vt.valueMap && vt.transformType === "ValueMap") {
                    const keys = Object.keys(vt.valueMap);
                    return {
                      name: `${fm.sourceField} = ${fm.destinationField}`,
                      valueMap: keys
                        .map((k) => ({ key: k, value: vt.valueMap[k] }))
                        .sort((a: any, b: any) => a.key.localeCompare(b.key)),
                    };
                  }
                  return {};
                })
              : [],
          ),
        );
        const newView = {
          ...view,
          ...{ valueMaps: valueMapKeys.filter((v: any) => v.name) },
        };
        newView.legs.forEach((leg: any) => {
          leg.fieldMappings.forEach((fm: any) => {
            if (fm.syncDirection === "1") {
              fm.syncDirection = "->";
            } else if (fm.syncDirection === "2") {
              fm.syncDirection = "<-";
            } else {
              fm.syncDirection = "<->";
            }
          });
        });
        const output = mustache.render(template, newView);
        setRenderedMarkdown(output);
      } catch (error: any) {
        setRenderedMarkdown("Error rendering details: " + error.message);
      }
    }, [dualwritemap]);
    return (
      <div>
        <TabList
          selectedValue={selectedMarkdownTab}
          onTabSelect={(_, data) => setSelectedMarkdownTab(data.value)}
          appearance="subtle"
        >
          <Tab value="markdownPreviewTab">Markdown Preview</Tab>
          <Tab value="markdownSourceTab">Markdown Source</Tab>
        </TabList>
        {selectedMarkdownTab === "markdownPreviewTab" && (
          <div style={{ marginTop: "1rem" }}>
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {renderedMarkdown}
            </Markdown>
          </div>
        )}
        {selectedMarkdownTab === "markdownSourceTab" && (
          <div style={{ marginTop: "1rem" }}>
            <SyntaxHighlighter language="markdown" style={docco}>
              {renderedMarkdown || "No mapping data available."}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    );
  });

  const DiagramTab = memo(() => {
    const [svgContent, setSvgContent] = useState<string>("");
    const [mermaidCode, setMermaidCode] = useState<string>("");
    const [selectedDiagramTab, setSelectedDiagramTab] =
      useState<TabValue>("diagramPreviewTab");

    useEffect(() => {
      if (!dualwritemap) {
        setSvgContent("");
        setMermaidCode("");
        return;
      }
      try {
        const view = JSON.parse(dualwritemap.Mapping || "{}");
        const sourceSchema = view?.legs?.[0]?.sourceSchema || "Source";
        const destinationSchema =
          view?.legs?.[0]?.destinationSchema || "Destination";
        const fieldMappings = view?.legs?.[0]?.fieldMappings || [];

        let mdCode = "graph LR\n";
        mdCode += `    subgraph ${sourceSchema}\n`;
        fieldMappings.forEach((fm: any, index: number) => {
          if (fm.sourceField) {
            mdCode += `        src${index}["${fm.sourceField}"]\n`;
          } else {
            mdCode += `        src${index}["Default Value:${fm.valueTransforms?.[0]?.defaultValue || ""}"]\n`;
          }
        });
        mdCode += "    end\n";
        mdCode += `    subgraph ${destinationSchema}\n`;
        fieldMappings.forEach((fm: any, index: number) => {
          if (fm.destinationField) {
            mdCode += `        dst${index}["${fm.destinationField}"]\n`;
          } else {
            mdCode += `        dst${index}["Default Value:${fm.valueTransforms?.[0]?.defaultValue || ""}"]\n`;
          }
        });
        mdCode += "    end\n\n";

        fieldMappings.forEach((fm: any, index: number) => {
          const vt = fm.valueTransforms?.find(
            (v: any) => v.transformType === "ValueMap",
          );

          if (vt?.valueMap) {
            const mapEntries = Object.entries(vt.valueMap || {})
              .map(([k, v]) => `${k} → ${v}`)
              .join("<br/>");
            mdCode += `    vm${index}["${mapEntries}"]\n`;
            if (fm.syncDirection === "1") {
              mdCode += `    src${index} --> vm${index}\n`;
              mdCode += `    vm${index} --> dst${index}\n`;
            } else if (fm.syncDirection === "2") {
              mdCode += `    dst${index} --> vm${index}\n`;
              mdCode += `    vm${index} --> src${index}\n`;
            } else {
              mdCode += `    src${index} <--> vm${index}\n`;
              mdCode += `    vm${index} <--> dst${index}\n`;
            }
          } else {
            if (fm.syncDirection === "1") {
              mdCode += `    src${index} --> dst${index}\n`;
            } else if (fm.syncDirection === "2") {
              mdCode += `    dst${index} --> src${index}\n`;
            } else {
              mdCode += `    src${index} <--> dst${index}\n`;
            }
          }
        });

        mermaid.initialize({ startOnLoad: false });
        mermaid
          .render("mermaid-diagram", mdCode)
          .then((result: RenderResult) => {
            setSvgContent(result.svg);
            setMermaidCode(mdCode);
          });
      } catch (error: any) {
        setSvgContent(
          `<p style="color: red;">Error generating diagram: ${error.message}</p>`,
        );
      }
    }, [dualwritemap]);

    return (
      <div>
        {dualwritemap ? (
          <>
            <TabList
              selectedValue={selectedDiagramTab}
              onTabSelect={(_, data) => setSelectedDiagramTab(data.value)}
              appearance="subtle"
            >
              <Tab value="diagramPreviewTab">Diagram Preview</Tab>
              <Tab value="diagramSourceTab">Diagram Source</Tab>
            </TabList>

            {selectedDiagramTab === "diagramPreviewTab" && svgContent && (
              <div
                style={{
                  backgroundColor: "var(--colorNeutralBackground3)",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginTop: "0.5rem",
                  overflow: "auto",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              </div>
            )}
            {selectedDiagramTab === "diagramSourceTab" && (
              <div style={{ marginTop: "1rem" }}>
                <SyntaxHighlighter language="mermaid" style={docco}>
                  {mermaidCode}
                </SyntaxHighlighter>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--colorNeutralForeground3)",
              width: "100%",
            }}
          >
            <Body1>Select a map to view the diagram.</Body1>
          </div>
        )}
      </div>
    );
  });

  const SourceTab = memo(() => {
    const styles = useStyles();
    return (
      <div style={{ paddingTop: "1rem", width: "100%" }}>
        <Subtitle2 className={styles.header}>Mapping JSON</Subtitle2>
        <div style={{ overflow: "auto", maxWidth: "100%", marginTop: "1rem" }}>
          <SyntaxHighlighter language="json" style={docco} showLineNumbers>
            {dualwritemap?.Mapping
              ? JSON.stringify(JSON.parse(dualwritemap.Mapping), null, 2)
              : "No mapping data available."}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  });

  return (
    <div>
      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value)}
        appearance="subtle"
      >
        <Tab value="detailTab">Details</Tab>
        <Tab value="markdownTab">Markdown</Tab>
        <Tab value="diagramTab">Diagram</Tab>
        <Tab value="sourceTab">Source</Tab>
      </TabList>
      <Divider />
      <div style={{ paddingTop: "1rem", width: "100%" }}>
        {selectedTab === "detailTab" && <DetailsTab />}
        {selectedTab === "markdownTab" && <MarkdownTab />}
        {selectedTab === "diagramTab" && <DiagramTab />}
        {selectedTab === "sourceTab" && <SourceTab />}
      </div>
    </div>
  );
};
