package com.orbyt.render;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RenderController {
  @GetMapping("/")
  public Map<String, String> index() {
    return Map.of("status", "ok", "service", "render-service");
  }
}
