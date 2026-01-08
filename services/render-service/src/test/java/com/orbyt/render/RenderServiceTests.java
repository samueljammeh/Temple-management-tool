package com.orbyt.render;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import java.security.MessageDigest;
import java.util.Base64;
import static org.junit.jupiter.api.Assertions.*;

public class RenderServiceTests {
  private final ObjectMapper mapper = new ObjectMapper();

  @Test
  void rendersDeterministicPdf() throws Exception {
    String templateJson = "{\"schemaVersion\":\"1.0\",\"tenantId\":\"tenant-demo\",\"templateId\":\"template-demo\",\"name\":\"Demo\",\"description\":\"\",\"status\":\"draft\",\"version\":1,\"createdBy\":\"tester\",\"updatedBy\":\"tester\",\"pages\":[{\"id\":\"page-1\",\"pageNumber\":1,\"size\":\"A4\",\"header\":{\"components\":[]},\"body\":{\"components\":[{\"id\":\"text-1\",\"type\":\"text\",\"position\":{\"x\":10,\"y\":10,\"width\":100,\"height\":20},\"content\":\"Orbyt\",\"style\":{\"fontFamily\":\"Helvetica\",\"fontSize\":10,\"fontWeight\":\"normal\",\"color\":\"#000000\",\"align\":\"left\"}}]},\"footer\":{\"components\":[]}}]}";
    String xml = "<Case><Account><Name>Orbyt</Name></Account></Case>";

    JsonNode templateNode = mapper.readTree(templateJson);
    FoCompiler compiler = new FoCompiler();
    String fo = compiler.compile(templateNode, xml);
    FopRenderer renderer = new FopRenderer();
    byte[] pdfA = renderer.renderPdf(fo);
    byte[] pdfB = renderer.renderPdf(fo);

    assertTrue(pdfA.length > 0);
    assertEquals("%PDF", new String(pdfA, 0, 4));

    String hashA = hash(pdfA);
    String hashB = hash(pdfB);
    assertEquals(hashA, hashB);
  }

  private String hash(byte[] data) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    return Base64.getEncoder().encodeToString(digest.digest(data));
  }
}
