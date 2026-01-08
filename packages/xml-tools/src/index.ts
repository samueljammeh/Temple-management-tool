import { XMLParser } from 'fast-xml-parser';

export type XmlNode = Record<string, unknown>;

export const parseXml = (xml: string): XmlNode => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  return parser.parse(xml) as XmlNode;
};

export const getValue = (node: XmlNode, path: string): string | number | null => {
  const segments = path.split('/').filter(Boolean);
  let current: unknown = node;

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) {
      return null;
    }

    const record = current as Record<string, unknown>;
    current = record[segment];
  }

  if (typeof current === 'string' || typeof current === 'number') {
    return current;
  }

  return null;
};
