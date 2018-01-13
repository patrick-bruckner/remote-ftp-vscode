import * as vscode from 'vscode';

export const isEEXIST = (path, forceBtn, cancelBtn?, dismissable = true) => {
  vscode.window.showWarningMessage('Remote FTP: Already exists file in localhost ' +
                                   `Delete or rename file before downloading folder ${path}`,
                                   'Delete file', 'Cancel').then((selection) => {
    if (selection) {
      if (selection == 'Delete file') {
        forceBtn();
      } else if(selection == 'Cancel') {
        if (typeof cancelBtn === 'function') {
          cancelBtn();
        }
      }
    }
  });
};

export const isEISDIR = (path, forceBtn, cancelBtn?, dismissable = true) => {
  vscode.window.showWarningMessage('Remote FTP: Already exists folder in localhost ' +
                                   `Delete or rename folder before downloading file ${path}`,
                                   'Delete folder', 'Cancel').then((selection) => {
    if (selection) {
      if (selection == 'Delete folder') {
        forceBtn();
      } else if (selection == 'Cancel') {
        if (typeof cancelBtn === 'function') {
          cancelBtn();
        }
      }
    }
  });
};

export const isAlreadyExits = (path, type = 'folder', dismissable = false) => {
  // atom.notifications.addWarning(`Remote FTP: The ${type} already exists.`, {
  //   detail: `${path} has already on the server!`,
  //   dismissable,
  // });
  console.log(`Remote FTP: The ${type} already exists.`);
};

export const isPermissionDenied = (path, dismissable = false) => {
  // atom.notifications.addWarning('Remote FTP: Permission denied', {
  //   detail: `${path} : Permission denied`,
  //   dismissable,
  // });
  console.log('Remote FTP: Permission denied');
};

export const isNoChangeGroup = (response, dismissable = false) => {
  // atom.notifications.addWarning('Remote FTP: Group privileges was not changed.', {
  //   detail: response.message,
  //   dismissable,
  // });
  console.log('Remote FTP: Group privileges was not changed.');
};

export const isNoChangeOwner = (response, dismissable = false) => {
  // atom.notifications.addWarning('Remote FTP: Owner privileges was not changed.', {
  //   detail: response.message,
  //   dismissable,
  // });
  console.log('Remote FTP: Owner privileges was not changed.');
};

export const isNoChangeOwnerAndGroup = (response, dismissable = false) => {
  // atom.notifications.addWarning('Remote FTP: Owner and Group privileges was not changed.', {
  //   detail: response.message,
  //   dismissable,
  // });
  console.log('Remote FTP: Owner and Group privileges was not changed.');
};

export const isNotImplemented = (detail, dismissable = false) => {
  // atom.notifications.addInfo('Remote FTP: Not implemented.', {
  //   detail,
  //   dismissable,
  // });
  console.log('Remote FTP: Not implemented.');
};

export const isGenericUploadError = (detail, dismissable = false) => {
  // atom.notifications.addError('Remote FTP: Upload Error.', {
  //   detail,
  //   dismissable,
  // });
  console.log('Remote FTP: Upload Error.');
};
