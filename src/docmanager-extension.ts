// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { some, map, each } from '@phosphor/algorithm';

import { Widget } from '@phosphor/widgets';

import {
  ILabShell,
  ILabStatus,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  showDialog,
  showErrorMessage,
  Dialog,
  ICommandPalette
} from '@jupyterlab/apputils';

import { Token } from '@phosphor/coreutils';

import { IChangedArgs, Time } from '@jupyterlab/coreutils';

import { DocumentRegistry, IDocumentWidget } from '@jupyterlab/docregistry';

import {
  renameDialog,
  DocumentManager
} from '@jupyterlab/docmanager';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ISignal } from '@phosphor/signaling';

import { IDisposable } from '@phosphor/disposable';

import { Contents, Kernel, ServiceManager } from '@jupyterlab/services';

/**
 * The command IDs used by the document manager plugin.
 */
namespace CommandIDs {
  export const clone = 'docmanager:clone';

  export const deleteFile = 'docmanager:delete-file';

  export const newUntitled = 'docmanager:new-untitled';

  export const open = 'docmanager:open';

  export const openBrowserTab = 'docmanager:open-browser-tab';

  export const reload = 'docmanager:reload';

  export const rename = 'docmanager:rename';

  export const restoreCheckpoint = 'docmanager:restore-checkpoint';

  export const save = 'docmanager:save';

  export const saveAll = 'docmanager:save-all';

  export const saveAs = 'docmanager:save-as';

  export const toggleAutosave = 'docmanager:toggle-autosave';

  export const showInFileBrowser = 'docmanager:show-in-file-browser';
}


export const IDocumentManager = new Token<IDocumentManager>(
  '@jupyterlab/docmanager:IDocumentManager'
);
/* tslint:enable */

/**
 * The interface for a document manager.
 */
export interface IDocumentManager extends IDisposable {
  /**
   * The registry used by the manager.
   */
  readonly registry: DocumentRegistry;

  /**
   * The service manager used by the manager.
   */
  readonly services: ServiceManager.IManager;

  /**
   * A signal emitted when one of the documents is activated.
   */
  readonly activateRequested: ISignal<this, string>;

  /**
   * Whether to autosave documents.
   */
  autosave: boolean;

  /**
   * Determines the time interval for autosave in seconds.
   */
  autosaveInterval: number;

  /**
   * Clone a widget.
   *
   * @param widget - The source widget.
   *
   * @returns A new widget or `undefined`.
   *
   * #### Notes
   *  Uses the same widget factory and context as the source, or returns
   *  `undefined` if the source widget is not managed by this manager.
   */
  cloneWidget(widget: Widget): IDocumentWidget | undefined;

  /**
   * Close all of the open documents.
   *
   * @returns A promise resolving when the widgets are closed.
   */
  closeAll(): Promise<void>;

  /**
   * Close the widgets associated with a given path.
   *
   * @param path - The target path.
   *
   * @returns A promise resolving when the widgets are closed.
   */
  closeFile(path: string): Promise<void>;

  /**
   * Get the document context for a widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The context associated with the widget, or `undefined` if no such
   * context exists.
   */
  contextForWidget(widget: Widget): DocumentRegistry.Context | undefined;

  /**
   * Copy a file.
   *
   * @param fromFile - The full path of the original file.
   *
   * @param toDir - The full path to the target directory.
   *
   * @returns A promise which resolves to the contents of the file.
   */
  copy(fromFile: string, toDir: string): Promise<Contents.IModel>;

  /**
   * Create a new file and return the widget used to view it.
   *
   * @param path - The file path to create.
   *
   * @param widgetName - The name of the widget factory to use. 'default' will use the default widget.
   *
   * @param kernel - An optional kernel name/id to override the default.
   *
   * @returns The created widget, or `undefined`.
   *
   * #### Notes
   * This function will return `undefined` if a valid widget factory
   * cannot be found.
   */
  createNew(
    path: string,
    widgetName?: string,
    kernel?: Partial<Kernel.IModel>
  ): Widget;

  /**
   * Delete a file.
   *
   * @param path - The full path to the file to be deleted.
   *
   * @returns A promise which resolves when the file is deleted.
   *
   * #### Notes
   * If there is a running session associated with the file and no other
   * sessions are using the kernel, the session will be shut down.
   */
  deleteFile(path: string): Promise<void>;

  /**
   * See if a widget already exists for the given path and widget name.
   *
   * @param path - The file path to use.
   *
   * @param widgetName - The name of the widget factory to use. 'default' will use the default widget.
   *
   * @returns The found widget, or `undefined`.
   *
   * #### Notes
   * This can be used to find an existing widget instead of opening
   * a new widget.
   */
  findWidget(
    path: string,
    widgetName?: string | null
  ): IDocumentWidget | undefined;

  /**
   * Create a new untitled file.
   *
   * @param options - The file content creation options.
   */
  newUntitled(options: Contents.ICreateOptions): Promise<Contents.IModel>;

  /**
   * Open a file and return the widget used to view it.
   *
   * @param path - The file path to open.
   *
   * @param widgetName - The name of the widget factory to use. 'default' will use the default widget.
   *
   * @param kernel - An optional kernel name/id to override the default.
   *
   * @returns The created widget, or `undefined`.
   *
   * #### Notes
   * This function will return `undefined` if a valid widget factory
   * cannot be found.
   */
  open(
    path: string,
    widgetName?: string,
    kernel?: Partial<Kernel.IModel>,
    options?: DocumentRegistry.IOpenOptions
  ): IDocumentWidget | undefined;

  /**
   * Open a file and return the widget used to view it.
   * Reveals an already existing editor.
   *
   * @param path - The file path to open.
   *
   * @param widgetName - The name of the widget factory to use. 'default' will use the default widget.
   *
   * @param kernel - An optional kernel name/id to override the default.
   *
   * @returns The created widget, or `undefined`.
   *
   * #### Notes
   * This function will return `undefined` if a valid widget factory
   * cannot be found.
   */
  openOrReveal(
    path: string,
    widgetName?: string,
    kernel?: Partial<Kernel.IModel>,
    options?: DocumentRegistry.IOpenOptions
  ): IDocumentWidget | undefined;

  /**
   * Overwrite a file.
   *
   * @param oldPath - The full path to the original file.
   *
   * @param newPath - The full path to the new file.
   *
   * @returns A promise containing the new file contents model.
   */
  overwrite(oldPath: string, newPath: string): Promise<Contents.IModel>;

  /**
   * Rename a file or directory.
   *
   * @param oldPath - The full path to the original file.
   *
   * @param newPath - The full path to the new file.
   *
   * @returns A promise containing the new file contents model.  The promise
   * will reject if the newPath already exists.  Use [[overwrite]] to overwrite
   * a file.
   */
  rename(oldPath: string, newPath: string): Promise<Contents.IModel>;
}


const pluginId = '@jupyterlab/docmanager-extension:plugin';

/**
 * The default document manager provider.
 */
const docManagerPlugin: JupyterFrontEndPlugin<IDocumentManager> = {
  id: pluginId,
  provides: IDocumentManager,
  optional: [ILabStatus, ICommandPalette, ILabShell, IMainMenu],
  activate: (
    app: JupyterFrontEnd,
    status: ILabStatus | null,
    palette: ICommandPalette | null,
    labShell: ILabShell | null,
    mainMenu: IMainMenu | null
  ): IDocumentManager => {
    const { shell } = app;
    const manager = app.serviceManager;
    const contexts = new WeakSet<DocumentRegistry.Context>();
    const opener: DocumentManager.IWidgetOpener = {
      open: (widget, options) => {
        if (!widget.id) {
          widget.id = `document-manager-${++Private.id}`;
        }
        widget.title.dataset = {
          type: 'document-title',
          ...widget.title.dataset
        };
        if (!widget.isAttached) {
          shell.add(widget, 'main', options || {});
        }
        shell.activateById(widget.id);

        // Handle dirty state for open documents.
        let context = docManager.contextForWidget(widget);
        if (!contexts.has(context)) {
          handleContext(status, context);
          contexts.add(context);
        }
      }
    };
    const registry = app.docRegistry;
    const when = app.restored.then(() => void 0);
    const docManager = new DocumentManager({
      registry,
      manager,
      opener,
      when,
      setBusy: status && (() => status.setBusy())
    });

    // Register the file operations commands.
    addCommands(
      app,
      docManager,
      opener,
      labShell,
      palette,
      mainMenu
    );
    return docManager;
  }
};


/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  docManagerPlugin
];
export default plugins;

/* Widget to display the revert to checkpoint confirmation. */
class RevertConfirmWidget extends Widget {
  /**
   * Construct a new revert confirmation widget.
   */
  constructor(
    checkpoint: Contents.ICheckpointModel,
    fileType: string = 'notebook'
  ) {
    super({ node: Private.createRevertConfirmNode(checkpoint, fileType) });
  }
}

// Returns the file type for a widget.
function fileType(widget: Widget, docManager: IDocumentManager): string {
  if (!widget) {
    return 'File';
  }
  const context = docManager.contextForWidget(widget);
  if (!context) {
    return '';
  }
  const fts = docManager.registry.getFileTypesForPath(context.path);
  return fts.length && fts[0].displayName ? fts[0].displayName : 'File';
}

/**
 * Add the file operations commands to the application's command registry.
 */
function addCommands(
  app: JupyterFrontEnd,
  docManager: IDocumentManager,
  opener: DocumentManager.IWidgetOpener,
  labShell: ILabShell | null,
  palette: ICommandPalette | null,
  mainMenu: IMainMenu | null
): void {
  const { commands, shell } = app;
  const category = 'File Operations';
  const isEnabled = () => {
    const { currentWidget } = shell;
    return !!(currentWidget && docManager.contextForWidget(currentWidget));
  };

  const isWritable = () => {
    const { currentWidget } = shell;
    if (!currentWidget) {
      return false;
    }
    const context = docManager.contextForWidget(currentWidget);
    return !!(
      context &&
      context.contentsModel &&
      context.contentsModel.writable
    );
  };

  // If inside a rich application like JupyterLab, add additional functionality.
  if (labShell) {
    addLabCommands(app, docManager, labShell, opener);
  }

  commands.addCommand(CommandIDs.deleteFile, {
    label: () => `Delete ${fileType(shell.currentWidget, docManager)}`,
    execute: args => {
      const path =
        typeof args['path'] === 'undefined' ? '' : (args['path'] as string);

      if (!path) {
        const command = CommandIDs.deleteFile;
        throw new Error(`A non-empty path is required for ${command}.`);
      }
      return docManager.deleteFile(path);
    }
  });

  commands.addCommand(CommandIDs.newUntitled, {
    execute: args => {
      const errorTitle = (args['error'] as string) || 'Error';
      const path =
        typeof args['path'] === 'undefined' ? '' : (args['path'] as string);
      let options: Partial<Contents.ICreateOptions> = {
        type: args['type'] as Contents.ContentType,
        path
      };

      if (args['type'] === 'file') {
        options.ext = (args['ext'] as string) || '.txt';
      }

      return docManager.services.contents
        .newUntitled(options)
        .catch(error => showErrorMessage(errorTitle, error));
    },
    label: args => (args['label'] as string) || `New ${args['type'] as string}`
  });

  commands.addCommand(CommandIDs.open, {
    execute: args => {
      const path =
        typeof args['path'] === 'undefined' ? '' : (args['path'] as string);
      const factory = (args['factory'] as string) || void 0;
      const kernel = (args['kernel'] as Kernel.IModel) || void 0;
      const options =
        (args['options'] as DocumentRegistry.IOpenOptions) || void 0;
      return docManager.services.contents
        .get(path, { content: false })
        .then(() => docManager.openOrReveal(path, factory, kernel, options));
    },
    icon: args => (args['icon'] as string) || '',
    label: args => (args['label'] || args['factory']) as string,
    mnemonic: args => (args['mnemonic'] as number) || -1
  });

  commands.addCommand(CommandIDs.openBrowserTab, {
    execute: args => {
      const path =
        typeof args['path'] === 'undefined' ? '' : (args['path'] as string);

      if (!path) {
        return;
      }

      return docManager.services.contents.getDownloadUrl(path).then(url => {
        const opened = window.open();
        opened.opener = null;
        opened.location.href = url;
      });
    },
    icon: args => (args['icon'] as string) || '',
    label: () => 'Open in New Browser Tab'
  });

  commands.addCommand(CommandIDs.reload, {
    label: () =>
      `Reload ${fileType(shell.currentWidget, docManager)} from Disk`,
    caption: 'Reload contents from disk',
    isEnabled,
    execute: () => {
      if (!isEnabled()) {
        return;
      }
      const context = docManager.contextForWidget(shell.currentWidget);
      const type = fileType(shell.currentWidget, docManager);
      return showDialog({
        title: `Reload ${type} from Disk`,
        body: `Are you sure you want to reload
          the ${type} from the disk?`,
        buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Reload' })]
      }).then(result => {
        if (result.button.accept && !context.isDisposed) {
          return context.revert();
        }
      });
    }
  });

  commands.addCommand(CommandIDs.restoreCheckpoint, {
    label: () =>
      `Revert ${fileType(shell.currentWidget, docManager)} to Checkpoint`,
    caption: 'Revert contents to previous checkpoint',
    isEnabled,
    execute: () => {
      if (!isEnabled()) {
        return;
      }
      const context = docManager.contextForWidget(shell.currentWidget);
      return context.listCheckpoints().then(checkpoints => {
        if (checkpoints.length < 1) {
          return;
        }
        const lastCheckpoint = checkpoints[checkpoints.length - 1];
        if (!lastCheckpoint) {
          return;
        }
        const type = fileType(shell.currentWidget, docManager);
        return showDialog({
          title: `Revert ${type} to checkpoint`,
          body: new RevertConfirmWidget(lastCheckpoint, type),
          buttons: [
            Dialog.cancelButton(),
            Dialog.warnButton({ label: 'Revert' })
          ]
        }).then(result => {
          if (context.isDisposed) {
            return;
          }
          if (result.button.accept) {
            if (context.model.readOnly) {
              return context.revert();
            }
            return context.restoreCheckpoint().then(() => context.revert());
          }
        });
      });
    }
  });

  commands.addCommand(CommandIDs.save, {
    label: () => `Save ${fileType(shell.currentWidget, docManager)}`,
    caption: 'Save and create checkpoint',
    isEnabled: isWritable,
    execute: () => {
      if (isEnabled()) {
        let context = docManager.contextForWidget(shell.currentWidget);
        if (context.model.readOnly) {
          return showDialog({
            title: 'Cannot Save',
            body: 'Document is read-only',
            buttons: [Dialog.okButton()]
          });
        }
        return context
          .save()
          .then(() => context.createCheckpoint())
          .catch(err => {
            // If the save was canceled by user-action, do nothing.
            if (err.message === 'Cancel') {
              return;
            }
            throw err;
          });
      }
    }
  });

  commands.addCommand(CommandIDs.saveAll, {
    label: () => 'Save All',
    caption: 'Save all open documents',
    isEnabled: () => {
      return some(
        map(shell.widgets('main'), w => docManager.contextForWidget(w)),
        c => c && c.contentsModel && c.contentsModel.writable
      );
    },
    execute: () => {
      const promises: Promise<void>[] = [];
      const paths = new Set<string>(); // Cache so we don't double save files.
      each(shell.widgets('main'), widget => {
        const context = docManager.contextForWidget(widget);
        if (context && !context.model.readOnly && !paths.has(context.path)) {
          paths.add(context.path);
          promises.push(context.save());
        }
      });
      return Promise.all(promises);
    }
  });

  commands.addCommand(CommandIDs.saveAs, {
    label: () => `Save ${fileType(shell.currentWidget, docManager)} As…`,
    caption: 'Save with new path',
    isEnabled,
    execute: () => {
      if (isEnabled()) {
        let context = docManager.contextForWidget(shell.currentWidget);
        return context.saveAs();
      }
    }
  });

  // .jp-mod-current added so that the console-creation command is only shown
  // on the current document.
  // Otherwise it will delegate to the wrong widget.
  app.contextMenu.addItem({
    command: 'filemenu:create-console',
    selector: '[data-type="document-title"].jp-mod-current',
    rank: 6
  });

  if (palette) {
    [
      CommandIDs.reload,
      CommandIDs.restoreCheckpoint,
      CommandIDs.save,
      CommandIDs.saveAs,
      CommandIDs.toggleAutosave
    ].forEach(command => {
      palette.addItem({ command, category });
    });
  }

  if (mainMenu) {
    mainMenu.settingsMenu.addGroup([{ command: CommandIDs.toggleAutosave }], 5);
  }
}

function addLabCommands(
  app: JupyterFrontEnd,
  docManager: IDocumentManager,
  labShell: ILabShell,
  opener: DocumentManager.IWidgetOpener
): void {
  const { commands } = app;

  // Returns the doc widget associated with the most recent contextmenu event.
  const contextMenuWidget = (): Widget => {
    const pathRe = /[Pp]ath:\s?(.*)\n?/;
    const test = (node: HTMLElement) =>
      node['title'] && !!node['title'].match(pathRe);
    const node = app.contextMenuHitTest(test);

    if (!node) {
      // Fall back to active doc widget if path cannot be obtained from event.
      return labShell.currentWidget;
    }
    const pathMatch = node['title'].match(pathRe);
    return docManager.findWidget(pathMatch[1], null);
  };

  // Returns `true` if the current widget has a document context.
  const isEnabled = () => {
    const { currentWidget } = labShell;
    return !!(currentWidget && docManager.contextForWidget(currentWidget));
  };

  commands.addCommand(CommandIDs.clone, {
    label: () => `New View for ${fileType(contextMenuWidget(), docManager)}`,
    isEnabled,
    execute: args => {
      const widget = contextMenuWidget();
      const options = (args['options'] as DocumentRegistry.IOpenOptions) || {
        mode: 'split-right'
      };
      if (!widget) {
        return;
      }
      // Clone the widget.
      let child = docManager.cloneWidget(widget);
      if (child) {
        opener.open(child, options);
      }
    }
  });

  commands.addCommand(CommandIDs.rename, {
    label: () => `Rename ${fileType(contextMenuWidget(), docManager)}…`,
    isEnabled,
    execute: () => {
      if (isEnabled()) {
        let context = docManager.contextForWidget(contextMenuWidget());
        return renameDialog(docManager, context!.path);
      }
    }
  });

  commands.addCommand(CommandIDs.showInFileBrowser, {
    label: () => `Show in File Browser`,
    isEnabled,
    execute: async () => {
      let context = docManager.contextForWidget(contextMenuWidget());
      if (!context) {
        return;
      }

      // 'activate' is needed if this command is selected in the "open tabs" sidebar
      await commands.execute('filebrowser:activate', { path: context.path });
      await commands.execute('filebrowser:go-to-path', { path: context.path });
    }
  });

  app.contextMenu.addItem({
    command: CommandIDs.rename,
    selector: '[data-type="document-title"]',
    rank: 1
  });
  app.contextMenu.addItem({
    command: CommandIDs.clone,
    selector: '[data-type="document-title"]',
    rank: 2
  });
  app.contextMenu.addItem({
    command: CommandIDs.showInFileBrowser,
    selector: '[data-type="document-title"]',
    rank: 3
  });
}

/**
 * Handle dirty state for a context.
 */
function handleContext(
  status: ILabStatus,
  context: DocumentRegistry.Context
): void {
  let disposable: IDisposable | null = null;
  let onStateChanged = (sender: any, args: IChangedArgs<any>) => {
    sender;
    if (args.name === 'dirty') {
      if (args.newValue === true) {
        if (!disposable) {
          disposable = status.setDirty();
        }
      } else if (disposable) {
        disposable.dispose();
        disposable = null;
      }
    }
  };
  void context.ready.then(() => {
    context.model.stateChanged.connect(onStateChanged);
    if (context.model.dirty) {
      disposable = status.setDirty();
    }
  });
  context.disposed.connect(() => {
    if (disposable) {
      disposable.dispose();
    }
  });
}

/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * A counter for unique IDs.
   */
  export let id = 0;

  export function createRevertConfirmNode(
    checkpoint: Contents.ICheckpointModel,
    fileType: string
  ): HTMLElement {
    let body = document.createElement('div');
    let confirmMessage = document.createElement('p');
    let confirmText = document.createTextNode(`Are you sure you want to revert
      the ${fileType} to the latest checkpoint? `);
    let cannotUndoText = document.createElement('strong');
    cannotUndoText.textContent = 'This cannot be undone.';

    confirmMessage.appendChild(confirmText);
    confirmMessage.appendChild(cannotUndoText);

    let lastCheckpointMessage = document.createElement('p');
    let lastCheckpointText = document.createTextNode(
      'The checkpoint was last updated at: '
    );
    let lastCheckpointDate = document.createElement('p');
    let date = new Date(checkpoint.last_modified);
    lastCheckpointDate.style.textAlign = 'center';
    lastCheckpointDate.textContent =
      Time.format(date, 'dddd, MMMM Do YYYY, h:mm:ss a') +
      ' (' +
      Time.formatHuman(date) +
      ')';

    lastCheckpointMessage.appendChild(lastCheckpointText);
    lastCheckpointMessage.appendChild(lastCheckpointDate);

    body.appendChild(confirmMessage);
    body.appendChild(lastCheckpointMessage);
    return body;
  }
}
