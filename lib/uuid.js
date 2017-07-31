'use strict'

const jpp = require('json-path-processor')
const uuidv4 = require('uuid/v4')

const constants = {
  PLUGIN_PREFIX: 'artillery-plugin-',
  PLUGIN_NAME: 'uuid',
  PLUGIN_PARAM_VARS: 'vars',
  PARAM_REQUIRED: '" parameter is required',
  PARAM_MUST_BE_STRING: '" param must have a string value',
  THE: 'The "',
  CONFIG_REQUIRED: '" plugin requires configuration under [script].config.plugins.',
}
const messages = {
  pluginConfigRequired: constants.THE + constants.PLUGIN_NAME + constants.CONFIG_REQUIRED + constants.PLUGIN_NAME,
  pluginParamServiceNameRequired: constants.THE + constants.PLUGIN_PARAM_JSON_PATH + constants.PARAM_REQUIRED,
  pluginParamServiceNameMustBeString: constants.THE + constants.PLUGIN_PARAM_JSON_PATH + constants.PARAM_MUST_BE_STRING,
  sdkConfigInvalidError: constants.PLUGIN_PREFIX + constants.PLUGIN_NAME + constants.ERROR,
}

const impl = {
  validateScriptConfig(scriptConfig) {
    // Validate that plugin config exists
    if (!(scriptConfig && scriptConfig.plugins && constants.PLUGIN_NAME in scriptConfig.plugins)) {
      throw new Error(messages.pluginConfigRequired)
    }
    // Validate NAMESPACE
    let i
    for (i = 0; i < scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS].length; i++) {
      if (!(typeof scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS][i] === 'string' ||
                    scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS][i] instanceof String)) {
        throw new Error(messages.pluginParamServiceNameMustBeString)
      }
    }
  },
  addUUID(jsonPath, requestParams, context, ee, callback) {
    // set uuid default location as id of a post using jsonpath
    // add to requestParams body as id attribute if jsonPath is '', the default
    const req = jpp(context.vars)
    let i
    for (i = 0; i < jsonPath.length; i++) {
      const uuid = uuidv4()
      req.set(jsonPath[i], uuid, true)
    }
    callback()
  },
}
const api = {
  init(scriptConfig, eventEmitter) {
    // eslint-disable-next-line no-shadow,no-unused-vars
    const UUIDplugin = function (scriptConfig, eventEmitter) {
      // eslint-disable-next-line no-param-reassign
      scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS] = scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS] || ''
      impl.validateScriptConfig(scriptConfig)
      const jsonPath = scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS]
      if (!scriptConfig.processor) {
        // eslint-disable-next-line no-param-reassign
        scriptConfig.processor = {}
      } // eslint-disable-next-line no-param-reassign
      scriptConfig.processor.addUUID = (requestParams, context, ee, callback) => {
        impl.addUUID(jsonPath, requestParams, context, ee, callback)
      }
    }
    return new UUIDplugin(scriptConfig, eventEmitter)
  },
}

module.exports = api.init
