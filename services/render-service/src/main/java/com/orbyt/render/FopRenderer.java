package com.orbyt.render;

import java.io.ByteArrayOutputStream;
import java.io.StringReader;
import java.util.Date;
import javax.xml.transform.Source;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.stream.StreamSource;
import org.apache.fop.apps.FOUserAgent;
import org.apache.fop.apps.Fop;
import org.apache.fop.apps.FopFactory;
import org.apache.fop.apps.MimeConstants;

public class FopRenderer {
  private final FopFactory fopFactory;

  public FopRenderer() throws Exception {
    this.fopFactory = FopFactory.newInstance(new java.io.File(".").toURI());
  }

  public byte[] renderPdf(String fo) throws Exception {
    FOUserAgent userAgent = fopFactory.newFOUserAgent();
    userAgent.setTitle("Orbyt Template Studio");
    userAgent.setAuthor("Orbyt");
    userAgent.setCreator("Orbyt Render Service");
    userAgent.setProducer("Orbyt Render Service");
    userAgent.setCreationDate(new Date(0));

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    Fop fop = fopFactory.newFop(MimeConstants.MIME_PDF, userAgent, outputStream);

    Source src = new StreamSource(new StringReader(fo));
    javax.xml.transform.Result res = new SAXResult(fop.getDefaultHandler());
    TransformerFactory.newInstance().newTransformer().transform(src, res);

    return outputStream.toByteArray();
  }
}
