import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'host3',
  remotes: ['remote1', 'remote2', 'remote3', 'remote4', 'remote5', 'remote6'],
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
