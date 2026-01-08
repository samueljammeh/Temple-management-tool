import { useMemo, useRef, useState } from "react";
import { DndContext, DragEndEvent, useDraggable } from "@dnd-kit/core";
import { Command, CommandStack } from "../src/editor/commandStack";
import { EditorState, updateComponentPosition } from "../src/editor/state";
import { Component, Template } from "@orbyt/template-schema";

const initialTemplate: Template = {
  schemaVersion: "1.0",
  tenantId: "tenant-demo",
  templateId: "template-demo",
  name: "Orbyt Statement",
  description: "",
  status: "draft",
  version: 1,
  createdBy: "designer@orbyt",
  updatedBy: "designer@orbyt",
  pages: [
    {
      id: "page-1",
      pageNumber: 1,
      size: "A4",
      header: { components: [] },
      body: {
        components: [
          {
            id: "text-1",
            type: "text",
            position: { x: 40, y: 40, width: 200, height: 20 },
            content: "Statement Title",
            style: {
              fontFamily: "Helvetica",
              fontSize: 14,
              fontWeight: "bold",
              color: "#111111",
              align: "left"
            }
          }
        ]
      },
      footer: { components: [] }
    }
  ]
};

const DraggableComponent = ({ component }: { component: Component }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: component.id
  });

  const style = {
    position: "absolute" as const,
    left: component.position.x,
    top: component.position.y,
    width: component.position.width,
    height: component.position.height,
    border: "1px dashed #4c6ef5",
    padding: "4px",
    background: "rgba(76, 110, 245, 0.05)",
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {component.type === "text" ? component.content : component.type}
    </div>
  );
};

export const TemplateEditor = () => {
  const [state, setState] = useState<EditorState>({
    template: initialTemplate,
    selectedComponentIds: []
  });
  const [xmlInput, setXmlInput] = useState("<Case></Case>");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const stack = useRef(new CommandStack<EditorState>()).current;

  const bodyComponents = state.template.pages[0].body.components;

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta, active } = event;
    const componentId = String(active.id);

    const command: Command<EditorState> = {
      description: "Move component",
      execute: (prev) => ({
        ...prev,
        template: updateComponentPosition(prev.template, componentId, delta.x, delta.y)
      }),
      undo: (prev) => ({
        ...prev,
        template: updateComponentPosition(prev.template, componentId, -delta.x, -delta.y)
      })
    };

    setState((prev) => stack.execute(command, prev));
  };

  const addText = () => {
    const command: Command<EditorState> = {
      description: "Add text",
      execute: (prev) => {
        const nextComponent: Component = {
          id: `text-${Date.now()}`,
          type: "text",
          position: { x: 50, y: 120, width: 200, height: 20 },
          content: "New text",
          style: {
            fontFamily: "Helvetica",
            fontSize: 12,
            fontWeight: "normal",
            color: "#111111",
            align: "left"
          }
        };

        const pages = prev.template.pages.map((page, index) =>
          index === 0
            ? { ...page, body: { components: [...page.body.components, nextComponent] } }
            : page
        );

        return { ...prev, template: { ...prev.template, pages } };
      },
      undo: (prev) => {
        const pages = prev.template.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                body: { components: page.body.components.slice(0, -1) }
              }
            : page
        );
        return { ...prev, template: { ...prev.template, pages } };
      }
    };

    setState((prev) => stack.execute(command, prev));
  };

  const canUndo = useMemo(() => stack.canUndo(), [state, stack]);
  const canRedo = useMemo(() => stack.canRedo(), [state, stack]);

  const previewPdf = async () => {
    const renderUrl = process.env.NEXT_PUBLIC_RENDER_URL ?? "http://localhost:3002";
    const response = await fetch(`${renderUrl}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": state.template.tenantId
      },
      body: JSON.stringify({
        tenantId: state.template.tenantId,
        template: state.template,
        xml: xmlInput
      })
    });

    const blob = await response.blob();
    setPreviewUrl(URL.createObjectURL(blob));
  };

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div style={{ width: 220 }}>
        <h2>Orbyt Template Studio</h2>
        <button onClick={addText}>Add Text</button>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={() => setState((prev) => stack.undo(prev))} disabled={!canUndo}>
            Undo
          </button>
          <button onClick={() => setState((prev) => stack.redo(prev))} disabled={!canRedo}>
            Redo
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12 }}>XML Preview Input</label>
          <textarea
            style={{ width: "100%", height: 120, marginTop: 4 }}
            value={xmlInput}
            onChange={(event) => setXmlInput(event.target.value)}
          />
          <button style={{ marginTop: 8 }} onClick={previewPdf}>
            Preview PDF
          </button>
          {previewUrl && (
            <a style={{ display: "block", marginTop: 8 }} href={previewUrl} target="_blank">
              Open Preview
            </a>
          )}
        </div>
        <p style={{ fontSize: 12, marginTop: 12 }}>
          Drag elements on the page. All actions are recorded as commands.
        </p>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div
          style={{
            position: "relative",
            width: 595,
            height: 842,
            border: "1px solid #ced4da",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          {bodyComponents.map((component) => (
            <DraggableComponent key={component.id} component={component} />
          ))}
        </div>
      </DndContext>
    </div>
  );
};
