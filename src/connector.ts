import { EventEmitter } from 'events';

const error = function ERROR(callback) {
  if (typeof callback === 'function') {
    callback.apply(this, ['Abstract connector']);
  }
};

export default class Connector extends EventEmitter {
  protected client;
  protected info;

  constructor(client) {
    super();
    const self = this;
    self.client = client;
    self.info = {};
  }

  static isConnected() {
    return false;
  }

  connect(info, completed) {
    error(completed);
    return this;
  }

  disconnect(completed) {
    error(completed);
    return this;
  }

  abort(completed): any {
    error(completed);
    return this;
  }

  list(path, recursive, completed): any {
    error(completed);
    return this;
  }

  get(path, recursive, completed): any {
    error(completed);
    return this;
  }

  put(path, completed): any {
    error(completed);
    return this;
  }

  mkdir(path, completed): any {
    error(completed);
    return this;
  }

  mkfile(path, completed): any {
    error(completed);
    return this;
  }

  rename(source, dest, completed): any {
    error(completed);
    return this;
  }

  delete(path, completed): any {
    error(completed);
    return this;
  }
}
