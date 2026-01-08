import { Body, Controller, Get, Header, Param, Post, Put, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { TemplatesService } from "./templates.service";
import { Template } from "@orbyt/template-schema";
import { requireRole } from "./roles";

const tenantFrom = (req: Request): string => {
  const tenantId = req.header("x-tenant-id");
  if (!tenantId) {
    throw new Error("Missing x-tenant-id header");
  }
  return tenantId;
};

const actorFrom = (req: Request): string => {
  return req.header("x-user-id") ?? "unknown";
};

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  listTemplates(@Req() req: Request) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "TemplateDesigner", "Publisher", "Viewer"]);
    return this.templatesService.listTemplates(tenantId);
  }

  @Get(":id")
  getTemplate(@Req() req: Request, @Param("id") id: string) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "TemplateDesigner", "Publisher", "Viewer"]);
    const record = this.templatesService.getTemplate(tenantId, id);
    if (!record) {
      throw new Error("Template not found");
    }
    return record;
  }

  @Post()
  createTemplate(@Req() req: Request, @Body("template") template: Template) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "TemplateDesigner"]);
    return this.templatesService.createTemplate(tenantId, template, actorFrom(req));
  }

  @Put(":id")
  updateTemplate(@Req() req: Request, @Param("id") id: string, @Body("template") template: Template) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "TemplateDesigner"]);
    return this.templatesService.updateTemplate(tenantId, id, template, actorFrom(req));
  }

  @Post(":id/publish")
  publishTemplate(@Req() req: Request, @Param("id") id: string) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "Publisher"]);
    return this.templatesService.publishTemplate(tenantId, id, actorFrom(req));
  }

  @Post(":id/rollback")
  rollbackTemplate(@Req() req: Request, @Param("id") id: string, @Body("version") version: number) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin"]);
    return this.templatesService.rollbackTemplate(tenantId, id, version, actorFrom(req));
  }

  @Get(":id/versions")
  listVersions(@Req() req: Request, @Param("id") id: string) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "TemplateDesigner", "Publisher", "Viewer"]);
    const record = this.templatesService.getTemplate(tenantId, id);
    if (!record) {
      throw new Error("Template not found");
    }
    return record.versions;
  }

  @Get(":id/audit")
  listAudit(@Req() req: Request, @Param("id") id: string) {
    const tenantId = tenantFrom(req);
    requireRole(req.header("x-role"), ["TenantAdmin", "TemplateDesigner", "Publisher"]);
    const record = this.templatesService.getTemplate(tenantId, id);
    if (!record) {
      throw new Error("Template not found");
    }
    return record.audit;
  }
}
