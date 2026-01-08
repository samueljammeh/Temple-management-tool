import "reflect-metadata";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { exampleTemplate } from "@orbyt/template-schema";

describe("Templates API", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates and retrieves a template for a tenant", async () => {
    const tenantId = "tenant-a";
    const createResponse = await request(app.getHttpServer())
      .post("/templates")
      .set("x-tenant-id", tenantId)
      .set("x-role", "TemplateDesigner")
      .set("x-user-id", "designer")
      .send({ template: exampleTemplate });

    expect(createResponse.status).toBe(201);
    const templateId = createResponse.body.templateId;

    const getResponse = await request(app.getHttpServer())
      .get(`/templates/${templateId}`)
      .set("x-tenant-id", tenantId)
      .set("x-role", "Viewer");

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.tenantId).toBe(tenantId);
  });

  it("prevents cross-tenant access", async () => {
    const tenantId = "tenant-b";
    const createResponse = await request(app.getHttpServer())
      .post("/templates")
      .set("x-tenant-id", tenantId)
      .set("x-role", "TemplateDesigner")
      .set("x-user-id", "designer")
      .send({ template: { ...exampleTemplate, templateId: "tenant-b-template" } });

    expect(createResponse.status).toBe(201);

    const forbiddenResponse = await request(app.getHttpServer())
      .get("/templates/tenant-b-template")
      .set("x-tenant-id", "tenant-c")
      .set("x-role", "Viewer");

    expect(forbiddenResponse.status).toBe(500);
  });
});
