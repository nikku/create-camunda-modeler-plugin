import ExampleExtensionService from './ExampleExtensionService';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 * --------
 *
 * WARNING: This is an example only.
 *
 * Make sure you choose a unique name under which your extension service
 * is exposed (i.e. change pluginService_${UUID} to something sensible).
 *
 * --------
 *
 */
export default {
  __init__: [ 'pluginService_${UUID}' ],
  pluginService_${UUID}: [ 'type', ExampleExtensionService ]
};
