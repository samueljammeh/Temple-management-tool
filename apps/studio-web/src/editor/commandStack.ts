export type Command<T> = {
  execute: (state: T) => T;
  undo: (state: T) => T;
  description: string;
};

export class CommandStack<T> {
  private done: Command<T>[] = [];
  private undone: Command<T>[] = [];

  execute(command: Command<T>, state: T): T {
    const next = command.execute(state);
    this.done.push(command);
    this.undone = [];
    return next;
  }

  undo(state: T): T {
    const command = this.done.pop();
    if (!command) {
      return state;
    }
    const next = command.undo(state);
    this.undone.push(command);
    return next;
  }

  redo(state: T): T {
    const command = this.undone.pop();
    if (!command) {
      return state;
    }
    const next = command.execute(state);
    this.done.push(command);
    return next;
  }

  canUndo(): boolean {
    return this.done.length > 0;
  }

  canRedo(): boolean {
    return this.undone.length > 0;
  }
}
