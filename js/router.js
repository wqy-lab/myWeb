// Router - Simple hash-based routing

export const Router = {
  routes: {},
  currentRoute: null,

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  },

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = path;
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [path, ...params] = hash.split('/');

    if (this.routes[path]) {
      this.currentRoute = path;
      this.routes[path](params.join('/'));
    } else {
      // Default to home
      this.navigate('home');
    }
  },

  getParams() {
    const hash = window.location.hash.slice(1) || 'home';
    return hash.split('/').slice(1);
  }
};
