import mustache from "mustache";
import { DualWriteMap } from "../hooks/useDataverseApi";

const markdownTemplate = [
  "## {{name}}  ",
  "<br /><br />",
  "{{#legs}}  ",
  "Source Schema      : **{{sourceSchema}}**  ",
  "Destination Schema : **{{destinationSchema}}**  ",
  "Source Filter      : **{{sourceFilter}}**  ",
  "<br /><br />",
  "### Mapping Details",
  "| Source Field | Direction | Destination Field | Default Value |   ",
  "| :- | :-: | :- | :- |",
  "{{#fieldMappings}}",
  "| {{sourceField}} | {{syncDirection}} | {{destinationField}} | {{defaultValue}} |",
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

export function generateMapMarkdown(map: DualWriteMap): string {
  const parsed = JSON.parse(map.Mapping || "{}");
  const legs = Array.isArray(parsed.legs) ? parsed.legs : [];
  const valueMaps = legs.flatMap((leg: any) =>
    (leg.fieldMappings || []).flatMap((fieldMapping: any) =>
      (fieldMapping.valueTransforms || [])
        .filter((transform: any) => transform.valueMap && transform.transformType === "ValueMap")
        .map((transform: any) => ({
          name: `${fieldMapping.sourceField} = ${fieldMapping.destinationField}`,
          valueMap: Object.keys(transform.valueMap)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => ({ key, value: transform.valueMap[key] })),
        })),
    ),
  );

  const view = {
    ...parsed,
    name: parsed.name || map.Name,
    legs: legs.map((leg: any) => ({
      ...leg,
      sourceFilter: leg.sourceFilter || "N/A",
      fieldMappings: (leg.fieldMappings || []).map((fieldMapping: any) => ({
        ...fieldMapping,
        syncDirection:
          fieldMapping.syncDirection === "1"
            ? "->"
            : fieldMapping.syncDirection === "2"
              ? "<-"
              : "<->",
        defaultValue: (fieldMapping.valueTransforms || [])
          .map((transform: any) => transform.defaultValue)
          .filter((value: unknown) => value !== undefined && value !== null && value !== "")
          .join(", "),
      })),
    })),
    valueMaps,
  };

  return mustache.render(markdownTemplate, view);
}
