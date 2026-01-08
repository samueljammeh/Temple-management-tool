package com.orbyt.render;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Comparator;
import java.util.Iterator;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.w3c.dom.Document;

public class FoCompiler {
  private final XmlTools xmlTools = new XmlTools();

  public String compile(JsonNode templateNode, String xml) throws Exception {
    Document doc = xmlTools.parse(xml);
    JsonNode pagesNode = templateNode.get("pages");
    String pageSequences = StreamSupport.stream(pagesNode.spliterator(), false)
      .sorted(Comparator.comparingInt(node -> node.get("pageNumber").asInt()))
      .map(page -> renderPage(page, doc))
      .collect(Collectors.joining());

    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
      "<fo:root xmlns:fo=\"http://www.w3.org/1999/XSL/Format\">\n" +
      "  <fo:layout-master-set>\n" +
      "    <fo:simple-page-master master-name=\"A4\" page-width=\"210mm\" page-height=\"297mm\" margin=\"10mm\">\n" +
      "      <fo:region-body />\n" +
      "    </fo:simple-page-master>\n" +
      "  </fo:layout-master-set>\n" +
      "  " + pageSequences + "\n" +
      "</fo:root>";
  }

  private String renderPage(JsonNode page, Document doc) {
    String header = renderRegion(page.get("header").get("components"), doc);
    String body = renderRegion(page.get("body").get("components"), doc);
    String footer = renderRegion(page.get("footer").get("components"), doc);
    return "<fo:page-sequence master-reference=\"A4\"><fo:flow flow-name=\"xsl-region-body\">" +
      header + body + footer + "</fo:flow></fo:page-sequence>";
  }

  private String renderRegion(JsonNode components, Document doc) {
    StringBuilder builder = new StringBuilder();
    for (JsonNode component : components) {
      builder.append(renderComponent(component, doc));
    }
    return builder.toString();
  }

  private String renderComponent(JsonNode component, Document doc) {
    String type = component.get("type").asText();
    JsonNode position = component.get("position");
    double x = position.get("x").asDouble();
    double y = position.get("y").asDouble();
    double width = position.get("width").asDouble();
    double height = position.get("height").asDouble();

    String content;
    switch (type) {
      case "text":
        content = renderText(component, doc);
        break;
      case "image":
        content = renderImage(component);
        break;
      case "divider":
        content = renderDivider(component);
        break;
      case "table":
        content = renderTable(component, doc);
        break;
      case "totals":
        content = renderTotals(component, doc);
        break;
      case "payment":
        content = renderPayment(component, doc);
        break;
      case "callout":
        content = renderCallout(component);
        break;
      default:
        content = "";
    }

    return String.format(
      "<fo:block-container absolute-position=\"absolute\" left=\"%spt\" top=\"%spt\" width=\"%spt\" height=\"%spt\">%s</fo:block-container>",
      x,
      y,
      width,
      height,
      content
    );
  }

  private String renderText(JsonNode component, Document doc) {
    String content = "";
    if (component.has("content")) {
      content = component.get("content").asText();
    } else if (component.has("binding")) {
      String path = component.get("binding").get("path").asText();
      String fallback = component.get("binding").get("fallback").asText();
      try {
        String value = xmlTools.getValue(doc, path);
        content = value != null && !value.isEmpty() ? value : fallback;
      } catch (Exception e) {
        content = fallback;
      }
    }

    JsonNode style = component.get("style");
    return String.format(
      "<fo:block font-family=\"%s\" font-size=\"%spt\" font-weight=\"%s\" color=\"%s\" text-align=\"%s\">%s</fo:block>",
      style.get("fontFamily").asText(),
      style.get("fontSize").asInt(),
      style.get("fontWeight").asText(),
      style.get("color").asText(),
      style.get("align").asText(),
      escapeXml(content)
    );
  }

  private String renderImage(JsonNode component) {
    String assetId = component.get("assetId").asText();
    double width = component.get("position").get("width").asDouble();
    double height = component.get("position").get("height").asDouble();
    return String.format(
      "<fo:external-graphic src=\"url('asset:%s')\" content-width=\"%spt\" content-height=\"%spt\"/>",
      assetId,
      width,
      height
    );
  }

  private String renderDivider(JsonNode component) {
    double strokeWidth = component.get("strokeWidth").asDouble();
    String color = component.get("color").asText();
    return String.format("<fo:block border-bottom=\"%spt solid %s\"/>", strokeWidth, color);
  }

  private String renderTable(JsonNode component, Document doc) {
    String headerRow = StreamSupport.stream(component.get("columns").spliterator(), false)
      .map(column -> String.format("<fo:table-cell padding=\"2pt\"><fo:block font-weight=\"bold\">%s</fo:block></fo:table-cell>",
        escapeXml(column.get("header").asText())))
      .collect(Collectors.joining());

    String rowBinding = component.get("rowBinding").get("path").asText();
    String fallback = component.get("rowBinding").get("fallback").asText();
    String rowValue;
    try {
      rowValue = xmlTools.getValue(doc, rowBinding);
    } catch (Exception e) {
      rowValue = fallback;
    }

    String bodyRow = StreamSupport.stream(component.get("columns").spliterator(), false)
      .map(column -> {
        String path = column.get("binding").get("path").asText();
        String cellFallback = column.get("binding").get("fallback").asText();
        String value;
        try {
          value = xmlTools.getValue(doc, path);
        } catch (Exception e) {
          value = cellFallback;
        }
        return String.format("<fo:table-cell padding=\"2pt\"><fo:block>%s</fo:block></fo:table-cell>", escapeXml(value));
      })
      .collect(Collectors.joining());

    String rows = rowValue == null || rowValue.isEmpty()
      ? ""
      : "<fo:table-row>" + bodyRow + "</fo:table-row>";

    return "<fo:table table-layout=\"fixed\" width=\"100%\"><fo:table-body><fo:table-row>" +
      headerRow + "</fo:table-row>" + rows + "</fo:table-body></fo:table>";
  }

  private String renderTotals(JsonNode component, Document doc) {
    String label = component.get("label").asText();
    String path = component.get("amountBinding").get("path").asText();
    String fallback = component.get("amountBinding").get("fallback").asText();
    String amount;
    try {
      amount = xmlTools.getValue(doc, path);
    } catch (Exception e) {
      amount = fallback;
    }
    if (amount == null || amount.isEmpty()) {
      amount = fallback;
    }
    return String.format("<fo:block font-weight=\"bold\">%s: %s</fo:block>", escapeXml(label), escapeXml(amount));
  }

  private String renderPayment(JsonNode component, Document doc) {
    String instruction = component.get("instruction").asText();
    String path = component.get("accountBinding").get("path").asText();
    String fallback = component.get("accountBinding").get("fallback").asText();
    String account;
    try {
      account = xmlTools.getValue(doc, path);
    } catch (Exception e) {
      account = fallback;
    }
    if (account == null || account.isEmpty()) {
      account = fallback;
    }
    return String.format("<fo:block>%s %s</fo:block>", escapeXml(instruction), escapeXml(account));
  }

  private String renderCallout(JsonNode component) {
    String title = component.get("title").asText();
    String body = component.get("body").asText();
    return String.format("<fo:block border=\"1pt solid #000000\" padding=\"4pt\"><fo:block font-weight=\"bold\">%s</fo:block><fo:block>%s</fo:block></fo:block>",
      escapeXml(title),
      escapeXml(body));
  }

  private String escapeXml(String value) {
    return value
      .replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace("\"", "&quot;")
      .replace("'", "&apos;");
  }
}
