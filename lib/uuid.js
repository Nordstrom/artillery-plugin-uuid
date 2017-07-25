'use strict';

//noinspection JSAnnotator
const jpp =  require('json-path-processor')
var uuidv4 = require('uuid/v4'),
    constants = {
        PLUGIN_PREFIX: 'artillery-plugin-',
        PLUGIN_NAME: 'uuid',
        PLUGIN_PARAM_VARS: 'vars',
        PARAM_REQUIRED: '" parameter is required',
        PARAM_MUST_BE_STRING: '" param must have a string value',
        THE: 'The "',
        CONFIG_REQUIRED: '" plugin requires configuration under [script].config.plugins.'
    },
    messages = {
        pluginConfigRequired: constants.THE + constants.PLUGIN_NAME + constants.CONFIG_REQUIRED + constants.PLUGIN_NAME,
        pluginParamServiceNameRequired: constants.THE + constants.PLUGIN_PARAM_JSON_PATH + constants.PARAM_REQUIRED,
        pluginParamServiceNameMustBeString: constants.THE + constants.PLUGIN_PARAM_JSON_PATH + constants.PARAM_MUST_BE_STRING,
        sdkConfigInvalidError: constants.PLUGIN_PREFIX + constants.PLUGIN_NAME + constants.ERROR,
    },

    impl = {
        validateScriptConfig: function (scriptConfig) {
            // Validate that plugin config exists
            if (!(scriptConfig && scriptConfig.plugins && constants.PLUGIN_NAME in scriptConfig.plugins)) {
                throw new Error(messages.pluginConfigRequired);
            }
            // Validate NAMESPACE
            let i
            for(i=0; i < scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS].length; i++) {
                if (!('string' === typeof scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS][i] ||
                    scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS][i] instanceof String)) {
                    throw new Error(messages.pluginParamServiceNameMustBeString);
                }
            }
        },
        addUUID: function (jsonPath, requestParams, context, ee, next) {
            //set uuid default location as id of a post using jsonpath
            //add to requestParams body as id attribute if jsonPath is '', the default
            let req = jpp(context.vars),
                i
            for(i=0; i<jsonPath.length; i++) {
                const uuid = uuidv4()
                req.set(jsonPath[i], uuid, true)
            }
            return next();
        },
    },
    api = {
        init: function (scriptConfig, eventEmitter) {
            var UUIDplugin = function (scriptConfig, eventEmitter) {
                scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS] = scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS] || ''
                impl.validateScriptConfig(scriptConfig)
                var jsonPath = scriptConfig.plugins[constants.PLUGIN_NAME][constants.PLUGIN_PARAM_VARS]
                if (!scriptConfig.processor) {
                    scriptConfig.processor = {};
                }
                scriptConfig.processor.addUUID = function (requestParams, context, ee, next) {
                    impl.addUUID(jsonPath, requestParams, context, ee, next);
                };
            };
            return new UUIDplugin(scriptConfig, eventEmitter);
        }
    };

module.exports = api.init;