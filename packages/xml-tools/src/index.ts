import { XMLParser } from "fast-xml-parser";

export type XmlNode = Record<string, unknown> | string | number | boolean | null;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text"
});

export const parseXml = (xml: string): XmlNode => {
  return parser.parse(xml);
};

export const getValue = (xml: XmlNode, path: string): string => {
  if (!path.startsWith("/")) {
    throw new Error(`Path must be absolute: ${path}`);
  }

  const segments = path.split("/").filter(Boolean);
  let current: any = xml;

  for (const segment of segments) {
    if (current == null) {
      return "";
    }

    if (Array.isArray(current)) {
      current = current[0];
    }

    current = current[segment];
  }

  if (typeof current === "string" || typeof current === "number" || typeof current === "boolean") {
    return String(current);
  }

  if (current && typeof current === "object" && "#text" in current) {
    return String((current as any)["#text"] ?? "");
  }

  return "";
};

export const listPaths = (xml: XmlNode, prefix = ""): string[] => {
  if (xml == null) {
    return [];
  }

  if (typeof xml !== "object") {
    return [prefix];
  }

  const entries = Array.isArray(xml) ? xml[0] : xml;
  return Object.keys(entries).flatMap((key) => {
    if (key.startsWith("@_")) {
      return [];
    }
    const nextPrefix = `${prefix}/${key}`;
    return listPaths((entries as any)[key], nextPrefix);
  });
};
