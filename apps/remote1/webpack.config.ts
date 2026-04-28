import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default async (webpackConfig: unknown) => {
  const apply = await withModuleFederation(config, { dts: false });
  const cfg = (apply as (c: unknown) => { output?: Record<string, unknown> })(webpackConfig);
  // Force the dual-mode publicPath helper. The MF plugin enables
  // experiments.outputModule which makes webpack emit an `import.meta.url`-only
  // helper. Angular's dev HTML generator tags styles.js as a classic <script>,
  // causing a SyntaxError when it hits import.meta. Setting scriptType: false
  // makes webpack emit the document.currentScript fallback variant.
  cfg.output = { ...cfg.output, scriptType: false };
  return cfg;
};
