const _dummy = setInterval(() => {}, 300000);
//const Ajv = require('ajv');
/** 
 *importent information how Postman SandBox can work with asinc/await
 * https://community.postman.com/executing-sync-requests-programmatically-from-a-pre-request-or-test-scripts/14678
 * Main idea: download from GitHub JSON-schemas and subschemas
 * (if we haven't got them in sources yet) and when we get all needs schemas,
 * transfer them (add) into library ajv for compilation, then all information will storege in class 
 * To realize this idea we created js-class that managed schemas downloading.
 */
/**
 * External Function download schema used Request Parameters
 * (It doesn't analyzes anything)
 * @param {string} url Url of schema
 * @throws Exception if any error
 * @returns {object} Schema Request Parameters
 */
function sendRequest(req) {
    return new Promise((resolve, reject) => {
        /* pm.sendRequest(req, (err, res) => {            
            if (err) {
                return reject(err);
            }                   
            return resolve(res);

        }) */
        setTimeout(() => resolve("done"), 1000);
    });
}
var descr = require('./dataset.js');
var PMSchemaLoadManager = require('./pm-schema-loader.js');
const sl = new PMSchemaLoadManager(descr, "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents");

async function wrapper() {
    try {
        for (var schema of sl.getSchemasToLoadFor("get_lang_schema")) {  

            console.log(`генератор выдал название схемы ${schema}`);          
            sl.processLoad(schema, await sendRequest(sl.getSchemaRequestParameters(schema)));
        }
      //  ajv = sl.addSchemaToAjv("get_lang_schema");        
        clearInterval(_dummy)
    } catch (ex) {
        console.log(`Fail: name: ${ex.name}; message: ${ex.message}`);
        clearInterval(_dummy)
    }
}
sl.debugModeValue = true;
wrapper();