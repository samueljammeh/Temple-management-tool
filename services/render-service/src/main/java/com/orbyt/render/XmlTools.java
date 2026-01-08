package com.orbyt.render;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.Document;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

public class XmlTools {
  private final XPath xPath = XPathFactory.newInstance().newXPath();

  public Document parse(String xml) throws Exception {
    return DocumentBuilderFactory.newInstance().newDocumentBuilder()
      .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
  }

  public String getValue(Document doc, String path) throws XPathExpressionException {
    if (!path.startsWith("/")) {
      throw new IllegalArgumentException("Path must be absolute: " + path);
    }
    return (String) xPath.evaluate(path, doc, XPathConstants.STRING);
  }
}
