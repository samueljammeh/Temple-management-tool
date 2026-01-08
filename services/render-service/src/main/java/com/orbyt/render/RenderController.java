package com.orbyt.render;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/render")
public class RenderController {
  private final ObjectMapper mapper = new ObjectMapper();
  private final FoCompiler compiler = new FoCompiler();
  private final FopRenderer renderer;

  public RenderController() throws Exception {
    this.renderer = new FopRenderer();
  }

  @PostMapping
  public ResponseEntity<byte[]> render(@RequestBody RenderRequest request) throws Exception {
    JsonNode templateNode = mapper.valueToTree(request.getTemplate());
    String fo = compiler.compile(templateNode, request.getXml());
    byte[] pdf = renderer.renderPdf(fo);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.set("X-Deterministic", "true");
    return ResponseEntity.ok().headers(headers).body(pdf);
  }
}
