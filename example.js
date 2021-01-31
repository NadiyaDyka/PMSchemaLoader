const _dummy = setInterval(() => { }, 300000);
Ajv = require('ajv');
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
        pm.sendRequest(req, (err, res) => {
            if (err) {
                throw new Error(`Can't download item ${err}`);
                //return reject(err);
            }
            return resolve(res);
        })
        //setTimeout(() => resolve("done"), 1000);
    });
}

async function wrapper() {
    sl.setDebugMode(true);
    /* try {
        sl.processDescriptorLoad(await sendRequest(sl.getDescriptorRequestParameters(headerRP)));             
             
         console.log( sl.descr);
        
    } catch (ex) {
        console.log(`Can't got descriptor: name: ${ex.name}; message: ${ex.message}`); 
         clearInterval(_dummy)    
    }; */
    //sl.setDebugMode(false);
    sl.setDescriptor(descr1);
    if (sl.getDebugMode) {
        console.log("This new descriptor");
        console.log(sl.getDescriptor());
    };
    try {
        for (var schema of sl.getSchemasToLoadFor("get_lang_schema")) {
            console.log(`The generator has identified the schema name ${schema}`);
            sl.processLoad(schema, await sendRequest(sl.getSchemaRequestParameters(schema, headerRP)));

        }
        ajv = sl.addSchemaToAjv("get_lang_schema");
        clearInterval(_dummy)
    } catch (ex) {
        console.log(`Fail: name: ${ex.name}; message: ${ex.message}`);
        clearInterval(_dummy)
    }
}


/**let initParamPMSchemaLoadManager = {
    "url":"https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents/schemas/descriptor.json", 
    "method":"GET", 
    "header":{
        "Accept":"application/vnd.github.VERSION.raw",
        "Authorization":"token 4ac77666d4a0013f7cb791d0319d412a59653db6"
    }
};

const sl = new PMSchemaLoadManager(initParamPMSchemaLoadManager);
*/
const headerRP = {
    "Accept": "application/vnd.github.VERSION.raw",
    "Authorization": "token 4ac77666d4a0013f7cb791d0319d412a59653db6"
};
const descr1 = {
    "host": "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents",
    "schemas": {

        "get_lang_schema1": {
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
//*/


wrapper();
