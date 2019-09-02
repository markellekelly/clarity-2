import { Token } from '@phosphor/coreutils';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

/* tslint:disable */
/**
 * Code editor services token.
 */
export const IEditorServices = new Token<IEditorServices>(
  '@jupyterlab/codeeditor:IEditorServices'
);
/* tslint:enable */

/**
 * Code editor services.
 */
export interface IEditorServices {
  /**
   * The code editor factory.
   */
  readonly factoryService: IEditorFactoryService;

  /**
   * The editor mime type service.
   */
  readonly mimeTypeService: IEditorMimeTypeService;
}
