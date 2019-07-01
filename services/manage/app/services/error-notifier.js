import Service, { inject } from '@ember/service';
import { isPresent } from '@ember/utils';

export default Service.extend({
  notifications: inject(),
  session: inject(),
  router: inject(),

  isReady() {
    const element = document.querySelector('.notifications');
    if (element) return true;
    return false;
  },

  handle(e) {
    // @todo Handle authentication errors.
    if (/no token was found for the provided token identifier/i.test(e.message)) {
      if (this.session.isAuthenticated) {
        this.session.store.clear().then(() => this.router.transitionTo('login'));
        return e;
      }
    }

    // eslint-disable-next-line no-console
    console.error(e);
    if (isPresent(e.errors) && isPresent(e.errors[0])) {
      const error = e.errors[0];
      if (error.result) return this.handleNetworkError(error);
      if (error.message) return new Error(error.message);
    }
    if (e.networkError) return this.handleNetworkError(e.networkError);
    if (e.graphQLErrors || e.message) return e;
    return new Error('An unknown, fatal error occurred.');
  },

  handleNetworkError(networkError) {
    const { response, result } = networkError;
    const message = result.errors && Array.isArray(result.errors) ? result.errors[0].message : 'Unknown fatal.';
    return new Error(`Network Error: ${response.statusText} (${response.status}): ${message}`);
  },

  show(e) {
    const error = this.handle(e);
    if (!e.loggingOut) this.get('notifications').error(error.message);
  },
});
