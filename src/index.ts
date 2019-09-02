

import { LabShell, JupyterFrontEnd, JupyterLab } from '@jupyterlab/application';
import { PageConfig } from '@jupyterlab/coreutils';
// eslint-disable-next-line
declare var __webpack_public_path__: string; 
__webpack_public_path__;
__webpack_public_path__ = PageConfig.getOption('fullStaticUrl') + '/';

// This must be after the public path is set.
// This cannot be extracted because the public path is dynamic.
//require('./build/imports.css');



window.addEventListener('load', async function() {
  let frontend= require('@jupyterlab/application').JupyterFrontEnd;

  var mods = [
    //require('@jupyterlab/application-extension'),
    // require('@jupyterlab/apputils-extension'),
    require('./codemirror-extension'),
    // require('@jupyterlab/completer-extension'),
    require('./docmanager-extension'),
    // require('@jupyterlab/fileeditor-extension'),
    // require('@jupyterlab/filebrowser-extension'),
    // require('@jupyterlab/help-extension'),
    // require('@jupyterlab/imageviewer-extension'),
    // require('@jupyterlab/inspector-extension'),
    // require('@jupyterlab/mainmenu-extension'),
    //require('@jupyterlab/markdownviewer-extension'),
    // require('@jupyterlab/mathjax2-extension'),
    require('./rendermime-extension'),
    require('./notebook-extension')
    // require('@jupyterlab/running-extension'),
    //require('@jupyterlab/settingeditor-extension'),
    // require('@jupyterlab/shortcuts-extension'),
    // require('@jupyterlab/theme-dark-extension'),
    // require('@jupyterlab/theme-light-extension'),
    // require('@jupyterlab/tooltip-extension')
  ];
  let app = new frontend({ shell: new LabShell() });
  registerPluginModules(mods, app);
  /* eslint-disable no-console */
  console.log('starting...');
  await app.start();
  console.log('started!');
  await app.restored;
});

function registerPluginModules(mods: JupyterLab.IPluginModule[], app: JupyterFrontEnd): void {
  mods.forEach(mod => {
    let data = mod.default;
    // Handle commonjs exports.
    if (!mod.hasOwnProperty('__esModule')) {
      data = mod as any;
    }
    if (!Array.isArray(data)) {
      data = [data];
    }
    data.forEach(item => {
      try {
        app.registerPlugin(item);
      } catch (error) {
        console.log("uh oh!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(error);
      }
    });
  });
}