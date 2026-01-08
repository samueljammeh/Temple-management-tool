import { Template, Component } from "@orbyt/template-schema";
import { getValue, parseXml } from "@orbyt/xml-tools";

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const renderText = (component: Extract<Component, { type: "text" }>, xml: any): string => {
  const content = component.content
    ? component.content
    : component.binding
      ? getValue(xml, component.binding.path) || component.binding.fallback
      : "";

  return `<fo:block font-family="${component.style.fontFamily}" font-size="${component.style.fontSize}pt" font-weight="${component.style.fontWeight}" color="${component.style.color}" text-align="${component.style.align}">${escapeXml(content)}</fo:block>`;
};

const renderImage = (component: Extract<Component, { type: "image" }>): string => {
  return `<fo:external-graphic src="url('asset:${component.assetId}')" content-width="${component.position.width}pt" content-height="${component.position.height}pt"/>`;
};

const renderDivider = (component: Extract<Component, { type: "divider" }>): string => {
  return `<fo:block border-bottom="${component.strokeWidth}pt solid ${component.color}"/>`;
};

const renderTable = (component: Extract<Component, { type: "table" }>, xml: any): string => {
  const rows = getValue(xml, component.rowBinding.path);
  const rowValues = Array.isArray(rows) ? rows : [rows];
  const headerRow = component.columns
    .map((column) => `<fo:table-cell padding="2pt"><fo:block font-weight="bold">${escapeXml(column.header)}</fo:block></fo:table-cell>`)
    .join("");

  const bodyRows = rowValues
    .map(() => {
      const cells = component.columns
        .map((column) => {
          const value = getValue(xml, column.binding.path) || column.binding.fallback;
          return `<fo:table-cell padding="2pt"><fo:block>${escapeXml(value)}</fo:block></fo:table-cell>`;
        })
        .join("");

      return `<fo:table-row>${cells}</fo:table-row>`;
    })
    .join("");

  return `<fo:table table-layout="fixed" width="100%"><fo:table-body><fo:table-row>${headerRow}</fo:table-row>${bodyRows}</fo:table-body></fo:table>`;
};

const renderTotals = (component: Extract<Component, { type: "totals" }>, xml: any): string => {
  const amount = getValue(xml, component.amountBinding.path) || component.amountBinding.fallback;
  return `<fo:block font-weight="bold">${escapeXml(component.label)}: ${escapeXml(amount)}</fo:block>`;
};

const renderPayment = (component: Extract<Component, { type: "payment" }>, xml: any): string => {
  const account = getValue(xml, component.accountBinding.path) || component.accountBinding.fallback;
  return `<fo:block>${escapeXml(component.instruction)} ${escapeXml(account)}</fo:block>`;
};

const renderCallout = (component: Extract<Component, { type: "callout" }>): string => {
  return `<fo:block border="1pt solid #000000" padding="4pt"><fo:block font-weight="bold">${escapeXml(component.title)}</fo:block><fo:block>${escapeXml(component.body)}</fo:block></fo:block>`;
};

const renderComponent = (component: Component, xml: any): string => {
  const { x, y, width, height } = component.position;
  const content = (() => {
    switch (component.type) {
      case "text":
        return renderText(component, xml);
      case "image":
        return renderImage(component);
      case "divider":
        return renderDivider(component);
      case "table":
        return renderTable(component, xml);
      case "totals":
        return renderTotals(component, xml);
      case "payment":
        return renderPayment(component, xml);
      case "callout":
        return renderCallout(component);
      default:
        return "";
    }
  })();

  return `<fo:block-container absolute-position="absolute" left="${x}pt" top="${y}pt" width="${width}pt" height="${height}pt">${content}</fo:block-container>`;
};

const renderRegion = (components: Component[], xml: any): string => {
  return components.map((component) => renderComponent(component, xml)).join("");
};

export const compileTemplateToFo = (template: Template, xmlPayload: string): string => {
  const xml = parseXml(xmlPayload);
  const pageSequences = template.pages
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((page) => {
      const header = renderRegion(page.header.components, xml);
      const body = renderRegion(page.body.components, xml);
      const footer = renderRegion(page.footer.components, xml);
      return `<fo:page-sequence master-reference="A4"><fo:flow flow-name="xsl-region-body">${header}${body}${footer}</fo:flow></fo:page-sequence>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="210mm" page-height="297mm" margin="10mm">
      <fo:region-body />
    </fo:simple-page-master>
  </fo:layout-master-set>
  ${pageSequences}
</fo:root>`;
};
