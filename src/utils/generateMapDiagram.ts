import { DualWriteMap } from "../hooks/useDataverseApi";

function escapeMermaidLabel(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "#quot;")
    .replace(/\r?\n/g, "<br/>");
}

export function generateMapDiagram(map: DualWriteMap): string {
  const view = JSON.parse(map.Mapping || "{}");
  const sourceSchema = view?.legs?.[0]?.sourceSchema || "Source";
  const destinationSchema = view?.legs?.[0]?.destinationSchema || "Destination";
  const sourceFilter = view?.legs?.[0]?.sourceFilter || "N/A";
  const fieldMappings = view?.legs?.[0]?.fieldMappings || [];

  let code = "graph LR\n";
  code += `    subgraph ${sourceSchema}\n`;
  fieldMappings.forEach((mapping: any, index: number) => {
    const label = mapping.sourceField
      ? mapping.sourceField
      : `Default Value:${mapping.valueTransforms?.[0]?.defaultValue || ""}`;
    code += `        src${index}["${escapeMermaidLabel(label)}"]\n`;
  });
  code += `        sourceFilter@{ shape: comment, label: "Source Filter: ${escapeMermaidLabel(sourceFilter)}" }\n`;
  code += "    end\n";
  code += `    subgraph ${destinationSchema}\n`;
  fieldMappings.forEach((mapping: any, index: number) => {
    const label = mapping.destinationField
      ? mapping.destinationField
      : `Default Value:${mapping.valueTransforms?.[0]?.defaultValue || ""}`;
    code += `        dst${index}["${escapeMermaidLabel(label)}"]\n`;
  });
  code += "    end\n\n";

  fieldMappings.forEach((mapping: any, index: number) => {
    const valueMap = mapping.valueTransforms?.find(
      (transform: any) => transform.transformType === "ValueMap",
    )?.valueMap;
    if (valueMap) {
      const entries = Object.entries(valueMap)
        .map(([source, destination]) => `${escapeMermaidLabel(source)} → ${escapeMermaidLabel(destination)}`)
        .join("<br/>");
      code += `    vm${index}["${entries}"]\n`;
    }

    const forward = mapping.syncDirection === "1";
    const reverse = mapping.syncDirection === "2";
    if (valueMap) {
      if (forward) {
        code += `    src${index} --> vm${index}\n    vm${index} --> dst${index}\n`;
      } else if (reverse) {
        code += `    dst${index} --> vm${index}\n    vm${index} --> src${index}\n`;
      } else {
        code += `    src${index} <--> vm${index}\n    vm${index} <--> dst${index}\n`;
      }
    } else if (forward) {
      code += `    src${index} --> dst${index}\n`;
    } else if (reverse) {
      code += `    dst${index} --> src${index}\n`;
    } else {
      code += `    src${index} <--> dst${index}\n`;
    }
  });

  return code;
}
