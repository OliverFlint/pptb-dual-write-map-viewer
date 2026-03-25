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
} from "@fluentui/react-components";
import { DualWriteMap } from "../hooks/useDataverseApi";
import { Key, memo, useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mustache from "mustache";
import rehypeRaw from "rehype-raw";

export interface DualWriteMapPreview {
  dualwritemap?: DualWriteMap;
}

export const DualWriteMapPreview = (props: DualWriteMapPreview) => {
  const { dualwritemap } = props;
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
        <div style={{ maxWidth: "100%" }}>
          <p>No Map Selected.</p>
        </div>
      );
    }
    return (
      <div style={{ maxWidth: "100%" }}>
        <p>
          <Title1>{data ? data.name : "No Data Available"}</Title1>
        </p>
        <p>
          Source Schema: <strong>{data?.legs[0]?.sourceSchema}</strong>
          <br />
          Destination Schema:{" "}
          <strong>{data?.legs[0]?.destinationSchema}</strong>
          <br />
          Source Filter: <strong>{data?.legs[0]?.sourceFilter || "N/A"}</strong>
        </p>

        <Divider style={{ margin: "16px 0" }} />

        {/* Mapping Details */}
        <Subtitle1>Field Mapping</Subtitle1>
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
        <br />
        {/* Value Maps */}
        <Subtitle1>Value Maps</Subtitle1>
        <br />
        {valueMapKeys && valueMapKeys.length > 0 && valueMapKeys[0]?.name ? (
          valueMapKeys?.map((vm: any, index: number) => (
            <div key={index}>
              <Subtitle2 style={{ marginTop: 16 }}>{vm.name}</Subtitle2>
              <Table size="small" style={{ width: "fit-content" }}>
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
          ))
        ) : (
          <Caption1>No value maps defined.</Caption1>
        )}
      </div>
    );
  });

  const MarkdownTab = memo(() => {
    const [renderedMarkdown, setRenderedMarkdown] = useState<string>();
    useEffect(() => {
      if (!dualwritemap) {
        setRenderedMarkdown("No map selected.");
        return;
      }
      try {
        const template = `  
## {{name}}  
<br /><br />
{{#legs}}  
Source Schema      : **{{sourceSchema}}**  
Destination Schema : **{{destinationSchema}}**  
<br /><br />
### Mapping Details
| Source Field | Direction | Destination Field | Default Value |   
| :- | :-: | :- | :- |
{{#fieldMappings}}
| {{sourceField}} | {{syncDirection}} | {{destinationField}} | {{#valueTransforms}}{{defaultValue}}{{/valueTransforms}} |
{{/fieldMappings}}
{{/legs}}
<br /><br />
### Value Maps  
{{#valueMaps}}
##### {{name}}  
| D365 | - | Dataverse |  
| :- | - | -: |
{{#valueMap}}
| \`{{key}}\` || \`{{value}}\` |  
{{/valueMap}}
{{/valueMaps}}
{{^valueMaps}}
No value maps defined.
{{/valueMaps}}
`;
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
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {renderedMarkdown}
        </Markdown>
        <SyntaxHighlighter language="markdown" style={docco}>
          {renderedMarkdown || "No mapping data available."}
        </SyntaxHighlighter>
      </div>
    );
  });

  const DiagramTab = memo(() => {
    return (
      <div>
        <p>Diagram view is not implemented yet.</p>
      </div>
    );
  });

  const SourceTab = memo(() => {
    return (
      <div>
        <h4>Mapping JSON:</h4>
        <div style={{ overflow: "auto", maxWidth: "100%" }}>
          <SyntaxHighlighter language="json" style={docco}>
            {dualwritemap?.Mapping
              ? JSON.stringify(JSON.parse(dualwritemap.Mapping), null, 2)
              : "No mapping data available."}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  });

  return (
    <div style={{ maxWidth: "100%", maxHeight: "100%" }}>
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
      <div style={{ paddingTop: "1em" }}>
        {selectedTab === "detailTab" && <DetailsTab />}
        {selectedTab === "markdownTab" && <MarkdownTab />}
        {selectedTab === "diagramTab" && <DiagramTab />}
        {selectedTab === "sourceTab" && <SourceTab />}
      </div>
    </div>
  );
};
