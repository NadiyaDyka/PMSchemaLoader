/** 
 *importent information how Postman SandBox can work with asinc/await
 * https://community.postman.com/executing-sync-requests-programmatically-from-a-pre-request-or-test-scripts/14678
 *  If we use a dummy Interval object, we can use async/await to have a cleaner method of chaining asynchronous calls.
 */
const _dummy = setInterval(() => { }, 300000); //This line is required for asynchronous functions to work
Ajv = require('ajv'); 
/**
 * External Function download schema used Request Parameters
 * This function must be defined on top level of the window where it will be called. 
 * Otherwise it won't work
 * @param {string} url Url of schema
 * @throws Exception if any error
 * @returns {object} Schema Request Parameters
 * 
 */
function sendRequest(req) {
    return new Promise((resolve, reject) => {
        pm.sendRequest(req, (err, res) => {
            if (err) {
                throw new Error(`Can't download item ${err}`);               
            }
            return resolve(res);
        })        
    });
}
/**
 * wrapper function needed to handle the Promise
 */
async function wrapper() {
    sl.setDebugMode(true);
     try { // downloading descr
        sl.processDescriptorLoad(await sendRequest(sl.getDescriptorRequestParameters(headerRPD)));                          
         console.log( sl.descr);        
    } catch (ex) {
        console.log(`Can't got descriptor: name: ${ex.name}; message: ${ex.message}`); 
         clearInterval(_dummy)    
    }; 
    if (sl.getDebugMode) {
        console.log("This new descriptor");
        console.log(sl.getDescriptor());
    };
    try {
        for (var schema of sl.getSchemasToLoadFor("get_lang_schema")) {
            console.log(`The generator has identified the schema name ${schema}`);
            //downloading schemas
            sl.processLoad(schema, await sendRequest(sl.getSchemaRequestParameters(schema, headerRP)));
        }
        ajv = sl.addSchemaToAjv("get_lang_schema");
        clearInterval(_dummy)
    } catch (ex) {
        console.log(`Fail: name: ${ex.name}; message: ${ex.message}`);
        clearInterval(_dummy)
    }
}
/** parameters for the request header
 * descr download function and schema download function - can take request headers as a parameter
 */
const headerRPD = {
    "Accept": "application/vnd.github.VERSION.raw",
    "Authorization": "token ... "
};
//The setDescriptor(descr) function makes it possible to pass a descriptor through a variable without downloading
/*
const descr = {
    "host": "https://api.github.com/repos/.../.../contents",
    "schemas": {

        "get_lang_schema": {
            "title": "Schema for GET language response",
            "path": "/schemas/get_lang_schema.json",
            "include": { main: "common_lib", reserve: "common_lib", glsData: "data_lib" }
        },
        "common_lib": {
            "path": "/schemas/common_lib.json",
            "include": { metaId: "meta_lib", dataID: "data_lib" }
        },
        "data_lib": {
            "path": "/schemas/data_lib.json"
        },
        "meta_lib": {
            "path": "/schemas/meta_lib.json"
        }
    }
};
*/
wrapper();
