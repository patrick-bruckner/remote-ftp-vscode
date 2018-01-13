'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as FS from 'fs';
import * as vscode from 'vscode';
import * as Path from 'path';
import { Disposable } from 'event-kit';
import Client from './client';
import { hasProject, setIconHandler } from './helpers';
import * as config from './config-schema.json';
import RemoteStorage from './remote-storage';
import { disconnect } from 'cluster';
import File from './file';
import Directory from './directory';
import { ParameterInformation } from 'vscode';

class ftpExplorerProvider implements vscode.TreeDataProvider<File|Directory> {
  private client: Client;
  private _onDidChangeTreeData = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(client: Client) {
    client = client;
  }

  public getTreeItem(element: File|Directory): vscode.TreeItem {
    let ti = new vscode.TreeItem(element.getName());

    if (element instanceof Directory) {
      ti.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      ti.command = {
        title: 'Open Dir',
        arguments: [element],
        command: 'dirClicked'
      };
    } else {
      ti.collapsibleState = vscode.TreeItemCollapsibleState.None;
      ti.command = {
        title: 'Open File',
        arguments: [element],
        command: 'openFile'
      }
    }

    return ti;
  }

  public getChildren(element?: File|Directory): (File|Directory)[] {
    let ret = [];
    let root;

    if (element) {
      root = element;
    } else {
      root = client.getRoot();
    }

    if (element instanceof File) return ret;

    root.folders.forEach(element => {
      ret.push(element);
    });
    root.files.forEach(element => {
      ret.push(element);
    });

    return ret;
  }

  public emitEvent() {
    this._onDidChangeTreeData.fire();
  }
}

var client: Client;
// var treeView;
// var statusBarTile;
// var statusBarView;
var subscriptions;
var dataProvider: ftpExplorerProvider;
var storage: RemoteStorage;


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand("setContext", "show-ftp-browser", false);
    // begin ported code
    storage = new RemoteStorage(context);

    if (subscriptions) {
        deactivate();
      }

    client = new Client();
    //   this.treeView = new TreeView(this.storage);

    subscriptions = context.subscriptions;

    dataProvider = new ftpExplorerProvider(client);

    subscriptions.push(
      vscode.window.registerTreeDataProvider('ftpbrowser', dataProvider),

      vscode.commands.registerCommand('extension.connect', () => {
        client.readConfig(() => {
          client.connect(false);
        });
      }),

      vscode.commands.registerCommand('dirClicked', (element: Directory) => {
        element.open(false);
      }),

      vscode.commands.registerCommand('openFile', (element: File) => {
        element.open();
      }),

      vscode.workspace.onDidSaveTextDocument((document) => {
            fileSaved(document);
        }),

      vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        if (!hasProject() || !client.isConnected()) return;

        client.disconnect();
        client.connect(true);
      }),

    //   atom.workspace.paneContainers.left.onDidChangeActivePaneItem((activeItem) => {
    //     if (this.treeView !== activeItem) return;

    //     this.storage.data.options.treeViewSide = 'left';
    //   }),

    //   atom.workspace.paneContainers.right.onDidChangeActivePaneItem((activeItem) => {
    //     if (this.treeView !== activeItem) return;

    //     this.storage.data.options.treeViewSide = 'right';
    //   }),

    //   atom.workspace.paneContainers.bottom.onDidChangeActivePaneItem((activeItem) => {
    //     if (this.treeView !== activeItem) return;

    //     this.storage.data.options.treeViewSide = 'bottom';
    //   }),

    //   atom.workspace.paneContainers.left.onDidChangeVisible((visible) => {
    //     if (this.storage.data.options.treeViewSide !== 'left') return;

    //     this.storage.data.options.treeViewShow = visible;
    //   }),

    //   atom.workspace.paneContainers.right.onDidChangeVisible((visible) => {
    //     if (this.storage.data.options.treeViewSide !== 'right') return;

    //     this.storage.data.options.treeViewShow = visible;
    //   }),

    //   atom.workspace.paneContainers.bottom.onDidChangeVisible((visible) => {
    //     if (this.storage.data.options.treeViewSide !== 'bottom') return;

    //     this.storage.data.options.treeViewShow = visible;
    //   }),

    );

    client.onDidConnected(() => {
      // this.treeView.root.name.attr('data-name', Path.basename(client.root.remote));
      // this.treeView.root.name.attr('data-path', client.root.remote);

      // .ftpignore initialize
      client.updateIgnore();
    });

    // NOTE: if there is a project folder & show view on startup
    //  is true, show the Remote FTP sidebar
    if (hasProject()) {
      // NOTE: setTimeout is for when multiple hosts option is true
      setTimeout(() => {
        // const conf = new File(client.getConfigPath());

        // conf.exists().then((exists) => {
        //   if (exists && atom.config.get('remote-ftp.tree.showViewOnStartup')) {
        //     this.treeView.attach();
        //   }
        // }).catch((error) => {
        //   const err = (error.reason) ? error.reason : error.message;

        //   atom.notifications.addWarning(err);
        // });
      }, 0);
    }

    // NOTE: Adds commands to context menus and atom.commands
    // initCommands();

    client.root.onChangeItems(() => {
      dataProvider.emitEvent();
    });
    vscode.commands.executeCommand("setContext", "show-ftp-browser", true);
  }

  export function deactivate() {
    subscriptions.dispose();
    // destroyStatusBar();

    if (client) client.disconnect();
    // if (this.treeView) this.treeView.detach();

    // this.treeView = null;

    // delete client;
    vscode.commands.executeCommand("setContext", "show-ftp-browser", false);
  }

  export function fileSaved(text: vscode.TextDocument) {
    console.log("saving file");
    if (!hasProject()) return;

    // if (!this.storage.data.options.autosave) return;
    // if (atom.config.get('remote-ftp.connector.autoUploadOnSave') === 'never') return;

    // if (!client.isConnected() && atom.config.get('remote-ftp.connector.autoUploadOnSave') !== 'always') return;

    const relative = Path.relative(client.getProjectPath(), text.uri.fsPath);
    const local =  text.uri.fsPath;

    vscode.workspace.findFiles(relative).then((files) => {
      if (files.length == 0) return;

      // Read config if undefined
      if (!client.ftpConfigPath) {
        client.readConfig(null);
      }

      if (client.ftpConfigPath !== client.getConfigPath()) return;

      // .ftpignore filter
      if (client.checkIgnore(local)) return;

      if (local === client.getConfigPath()) return;
      // TODO: Add fix for files which are uploaded from a glob selector
      // don't upload files watched, they will be uploaded by the watcher
      // doesn't work fully with new version of watcher
      if (client.watch.files.indexOf(local) >= 0) return;

      // get file name for notification message
      // const uploadedItem = atom.workspace.getActiveTextEditor().getFileName();
      const uploadedItem = vscode.window.activeTextEditor.document.fileName;

      client.upload(local, (err) => {
      //   if (atom.config.get('remote-ftp.notifications.enableTransfer')) {
        if (err) {
        //   atom.notifications.addError(`Remote FTP: ${uploadedItem} could not upload.`);
        console.log(`Remote FTP: ${uploadedItem} could not upload.`);
        } else {
        //   atom.notifications.addSuccess(`Remote FTP: ${uploadedItem} uploaded.`);
        console.log(`Remote FTP: ${uploadedItem} uploaded.`);
        }
      });
    });
  }

  export function serialize() {
    return storage.data;
  }

  export function consumeElementIcons(fn) {
    setIconHandler(fn);
    return new Disposable(() => {
      setIconHandler(null);
    });
  }

  // export function setStatusbar(statusBar) {
    // destroyStatusBar(statusBar);

    // this.subscriptions.add(
    //   atom.config.onDidChange('remote-ftp.statusbar.enable', () => {
    //     this.setStatusbar(statusBar);
    //   }),
    // );

    // if (!atom.config.get('remote-ftp.statusbar.enable')) return;

    // this.statusBarView = new StatusBarView();

    // const options = {
    //   item: this.statusBarView,
    //   priority: atom.config.get('remote-ftp.statusbar.priority'),
    // };

    // if (atom.config.get('remote-ftp.statusbar.position') === 'left') {
    //   this.statusBarTile = statusBar.addLeftTile(options);
    // } else {
    //   this.statusBarTile = statusBar.addRightTile(options);
    // }

    // this.subscriptions.add(
    //   atom.config.onDidChange('remote-ftp.statusbar.position', () => {
    //     this.setStatusbar(statusBar);
    //   }),

    //   atom.config.onDidChange('remote-ftp.statusbar.priority', () => {
    //     this.setStatusbar(statusBar);
    //   }),
    // );
  // }

  // export function destroyStatusBar() {
  //   if (this.statusBarTile) {
  //     this.statusBarTile.destroy();
  //     this.statusBarTile = null;
  //   }

  //   if (this.statusBarView) {
  //     this.statusBarView.dispose();
  //     this.statusBarView = null;
  //   }
  // }

  // export function consumeStatusBar(statusBar) {
  //   this.setStatusbar(statusBar);
  // }
