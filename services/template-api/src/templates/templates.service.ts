import { Injectable } from "@nestjs/common";
import { Template, TemplateSchema } from "@orbyt/template-schema";
import { v4 as uuidv4 } from "uuid";

export type TemplateStatus = "draft" | "published";

export type TemplateVersion = {
  version: number;
  status: TemplateStatus;
  snapshot: Template;
  createdAt: string;
  createdBy: string;
};

export type AuditEntry = {
  action: "create" | "update" | "publish" | "rollback";
  actor: string;
  timestamp: string;
  details: string;
};

export type TemplateRecord = {
  templateId: string;
  tenantId: string;
  versions: TemplateVersion[];
  audit: AuditEntry[];
};

@Injectable()
export class TemplatesService {
  private store = new Map<string, Map<string, TemplateRecord>>();

  listTemplates(tenantId: string): TemplateRecord[] {
    return Array.from(this.store.get(tenantId)?.values() ?? []);
  }

  getTemplate(tenantId: string, templateId: string): TemplateRecord | undefined {
    return this.store.get(tenantId)?.get(templateId);
  }

  createTemplate(tenantId: string, template: Template, actor: string): TemplateRecord {
    const parsed = TemplateSchema.parse(template);
    if (parsed.tenantId !== tenantId) {
      throw new Error("tenantId mismatch");
    }

    const templateId = parsed.templateId || uuidv4();
    const record: TemplateRecord = {
      templateId,
      tenantId,
      versions: [
        {
          version: parsed.version,
          status: parsed.status,
          snapshot: { ...parsed, templateId },
          createdAt: new Date(0).toISOString(),
          createdBy: actor
        }
      ],
      audit: [
        {
          action: "create",
          actor,
          timestamp: new Date(0).toISOString(),
          details: "Template created"
        }
      ]
    };

    const tenantStore = this.store.get(tenantId) ?? new Map<string, TemplateRecord>();
    tenantStore.set(templateId, record);
    this.store.set(tenantId, tenantStore);

    return record;
  }

  updateTemplate(tenantId: string, templateId: string, template: Template, actor: string): TemplateRecord {
    const record = this.getTemplate(tenantId, templateId);
    if (!record) {
      throw new Error("Template not found");
    }

    const parsed = TemplateSchema.parse(template);
    const version = parsed.version + 1;

    const nextVersion: TemplateVersion = {
      version,
      status: parsed.status,
      snapshot: { ...parsed, templateId, version },
      createdAt: new Date(0).toISOString(),
      createdBy: actor
    };

    record.versions.push(nextVersion);
    record.audit.push({
      action: "update",
      actor,
      timestamp: new Date(0).toISOString(),
      details: "Template updated"
    });

    return record;
  }

  publishTemplate(tenantId: string, templateId: string, actor: string): TemplateRecord {
    const record = this.getTemplate(tenantId, templateId);
    if (!record) {
      throw new Error("Template not found");
    }

    const latest = record.versions[record.versions.length - 1];
    const publishedVersion: TemplateVersion = {
      ...latest,
      status: "published",
      snapshot: { ...latest.snapshot, status: "published" },
      createdAt: new Date(0).toISOString(),
      createdBy: actor
    };

    record.versions.push(publishedVersion);
    record.audit.push({
      action: "publish",
      actor,
      timestamp: new Date(0).toISOString(),
      details: "Template published"
    });

    return record;
  }

  rollbackTemplate(tenantId: string, templateId: string, version: number, actor: string): TemplateRecord {
    const record = this.getTemplate(tenantId, templateId);
    if (!record) {
      throw new Error("Template not found");
    }

    const target = record.versions.find((item) => item.version === version);
    if (!target) {
      throw new Error("Version not found");
    }

    const rollbackVersion: TemplateVersion = {
      ...target,
      createdAt: new Date(0).toISOString(),
      createdBy: actor
    };

    record.versions.push(rollbackVersion);
    record.audit.push({
      action: "rollback",
      actor,
      timestamp: new Date(0).toISOString(),
      details: `Rollback to version ${version}`
    });

    return record;
  }
}
