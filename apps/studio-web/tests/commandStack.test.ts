import { describe, expect, it } from "vitest";
import { CommandStack } from "../src/editor/commandStack";

describe("CommandStack", () => {
  it("executes and undoes commands", () => {
    const stack = new CommandStack<number>();
    const command = {
      description: "increment",
      execute: (value: number) => value + 1,
      undo: (value: number) => value - 1
    };

    const result = stack.execute(command, 0);
    expect(result).toBe(1);

    const undone = stack.undo(result);
    expect(undone).toBe(0);
  });
});
