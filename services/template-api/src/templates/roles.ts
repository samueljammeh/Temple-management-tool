export type Role = "TenantAdmin" | "TemplateDesigner" | "Publisher" | "Viewer";

export const requireRole = (role: string | undefined, allowed: Role[]): Role => {
  if (!role) {
    throw new Error("Missing role header");
  }
  if (!allowed.includes(role as Role)) {
    throw new Error(`Role ${role} is not authorized`);
  }
  return role as Role;
};
