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
//const sl = new PMSchemaLoadManager(descr, "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents");
let initParamPMSchemaLoadManager = {
    "url":"https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents/schemas/descriptor.json", 
    "method":"GET", 
    "header":{
        "Accept":"application/vnd.github.VERSION.raw",
        "Authorization":"token 4ac77666d4a0013f7cb791d0319d412a59653db6"
    }
};
//const sl = new PMSchemaLoadManager(descr);


async function wrapperFirst() {
     try {

        sl.descriptorValue = sl.processDescriptorLoad(await sendRequest(sl.getDescriptorRequestParameters()));               
        console.log( sl.descriptorValue);
    } catch (ex) {
        console.log(`Can't got descriptor: name: ${ex.name}; message: ${ex.message}`);       
       
    };
}    
async function wrapperSecond() {
    try {
        for (var schema of sl.getSchemasToLoadFor("get_lang_schema")) {  

            console.log(`The generator has identified the schema name ${schema}`);          
            sl.processLoad(schema, await sendRequest(sl.getSchemaRequestParameters(schema)));
        }
      //  ajv = sl.addSchemaToAjv("get_lang_schema");        
        clearInterval(_dummy)
    } catch (ex) {
        console.log(`Fail: name: ${ex.name}; message: ${ex.message}`);
        clearInterval(_dummy)
    }
}
const sl = new PMSchemaLoadManager(initParamPMSchemaLoadManager);
sl.debugModeValue = true;

wrapperFirst();
//wrapperSecond();