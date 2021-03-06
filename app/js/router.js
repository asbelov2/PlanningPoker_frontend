class Router {
  routes = [];

  root = '/';

  current = '';

  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
    this.root = '/';
  }

  add = (path, callbackFunction) => {
    this.routes.push({
      path,
      callbackFunction
    });
    return this;
  };

  remove = (path) => {
    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].path === path) {
        this.routes.slice(i, 1);
        return this;
      }
    }
    return this;
  };

  flush = () => {
    this.routes = [];
    return this;
  };

  clearSlashes = path =>
    path
      .toString()
      .replace(/\/$/, '')
      .replace(/^\//, '');

  getFragment = () => {
    let fragment = '';
    const match = window.location.href.match(/#(.*)$/);
    fragment = match ? match[1] : '';
    return this.clearSlashes(fragment);
  };

  navigate = (path = '') => {
    window.location.href = `${window.location.href.replace(/#(.*)$/, '')}#${path}`;
  };

  listen = () => {
    this.current = this.getFragment();
    window.onpopstate = () => {
      if (!(window.location.href.match(/#/)))
        this.navigate('roomcreate');
      this.current = this.getFragment();
      this.routes.some(route => {
        const match = this.current.match(route.path);
        if (match) { 
          match.shift();
          route.callbackFunction.apply({}, match);
          return match;
        }
        return false;
      });
    };
    this.routes.some(route => {
      const match = this.current.match(route.path);
      if (match) { 
        match.shift();
        route.callbackFunction.apply({}, match);
        return match;
      }
      return false;
    });
  };

  static get instance() {
    if (!this._instance)
      this._instance = new Router(singletonMarker);
    return this._instance;
  }
}

const singletonMarker = {};
export default Router;