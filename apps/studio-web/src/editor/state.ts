import { Template } from "@orbyt/template-schema";

export type EditorState = {
  template: Template;
  selectedComponentIds: string[];
};

export const updateComponentPosition = (
  template: Template,
  componentId: string,
  deltaX: number,
  deltaY: number
): Template => {
  const pages = template.pages.map((page) => {
    const updateRegion = (components: typeof page.body.components) =>
      components.map((component) => {
        if (component.id !== componentId) {
          return component;
        }
        return {
          ...component,
          position: {
            ...component.position,
            x: component.position.x + deltaX,
            y: component.position.y + deltaY
          }
        };
      });

    return {
      ...page,
      header: { components: updateRegion(page.header.components) },
      body: { components: updateRegion(page.body.components) },
      footer: { components: updateRegion(page.footer.components) }
    };
  });

  return { ...template, pages };
};
