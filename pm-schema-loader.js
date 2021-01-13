const _dummy = setInterval(() => {}, 300000);
const Ajv = require('ajv');
/** 
 *importent information how Postman SandBox can work with asinc/await
 * https://community.postman.com/executing-sync-requests-programmatically-from-a-pre-request-or-test-scripts/14678
 * Main idea: download from GitHub JSON-schemas and subschemas
 * (if we haven't got them in sources yet) and when we get all needs schemas,
 * transfer them (add) into library ajv for compilation, then all information will storege in class 
 * To realize this idea we created js-class that managed schemas downloading.
 */
const descr = {
    "host": "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents",
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
}

class PMSchemaLoadManager {
    descr = {};
    host = "";
    /**
     * storege for schema sources
     */
    sources = {};

    constructor(descr, host) {
        this.descr = descr;
        this.host = host;
    }

    /**
     * Function forms a string with the url and
     * than create object with request parameters 
     * @param {string} SchemaName Name of Schema
     * @throws Exception if any error
     * @returns {object} request parameters for get Schema
     */
    getSchemaRequestParameters(SchemaName) {
            if (!this.descr['schemas'][SchemaName]['path']) {
                throw new Error(`Can't find property 'path' in descriptor for ${SchemaName}`)
            };
            let requestParameters = {};
            let url = this.host + this.descr['schemas'][SchemaName]['path'];
            requestParameters.url = url;
            /**
             *  the code below (metod and header) need to change to use Postman's constants 
             *  or change to transfer header as parameter of class?
             */
            requestParameters.method = "GET";
            requestParameters.header = {
                'Accept': 'application/vnd.github.VERSION.raw',
                'Authorization': 'token 4ac77666d4a0013f7cb791d0319d412a59653db6'
            };            
            return requestParameters;
        }
        /**
         * manages the generating list of schemas to load from host      
         * @param {string} SchemaName
         * @throws Exception if any error
         * @returns {object}
        /*
        это функция-генератор. Она не собирает список, а как только нашла нужный элемент
        передает его дальше в работу. 
        Клиенту с этой функцией нужно работать так:
        async function(){
          try {
            foreach( var scheme in GSM.getSchemasToLoadFor(SchemaName) ) { // *1
              GSM.processLoad( await sendRequest( GSM.getSchemaRequestParameters(scheme) ) );
            }
            ajv = GSM.getAJV( SchemaName );
          }
          catch(...)
        }();
        */

    * getSchemasToLoadFor(SchemaName, excludeList = {}) {
        if (!this.descr['schemas'][SchemaName]) {
            throw new Error(`Can't find the schema ${SchemaName} in descriptor.`)
        }
          //  console.log(`покажи текущий элемент соурс и потом весь ниже`);
         //   console.log(this.sources[SchemaName]); 
         //   console.log(this.sources); 
        if (!this.sources[SchemaName] &&
            !excludeList[SchemaName]) {              
            yield SchemaName;
            excludeList[SchemaName] = true;            
           
        }

        if (this.descr['schemas'][SchemaName]['include']) {

            if (typeof(this.descr['schemas'][SchemaName]['include']) == "object") {

                for (let id in this.descr['schemas'][SchemaName]['include']) {

                    let subschema = this.descr['schemas'][SchemaName]['include'][id];
                    yield* this.getSchemasToLoadFor(subschema, excludeList);
                }
            }
        }
    }

    /**
     * creates an instance of the library and passes it a list of subschemas with id 
     * @param {string} SchemaName
     * @throws Exception if any error
     * @returns {object} validate
     * 
     */
    addSchemaToAjv(SchemaName, sources) {
        let subschemas = this.collectListOfSubschemas(SchemaName);
       // console.log("ниже будет соурс");       
      //  console.log(this.sources);
        // Because Promises in Postman are still buggy (see https://community.postman.com/t/using-native-javascript-promises-in-postman/636/11)
        // We have no other way as use own waiting function.
        // this.waitForLoad(SchemaName, subschemas);

       // console.log(`getSchema: befor new Ajv`);
        let ajv = new Ajv({ logger: console, allErrors: true, verbose: true });
      //  console.log(`getSchema: after new Ajv`);
        for (let key in subschemas) {
            let subSchemaName = subschemas[key];
            console.log(`Add subschema: ${subSchemaName}`);
            console.log(JSON.parse(this.sources[subSchemaName]));
            ajv.addSchema(JSON.parse(this.sources[subSchemaName]), key);
            console.log(`key ${key}`);
            console.log(JSON.parse(this.sources[SchemaName]));
        }
        try {
            
            const schemaValidator = ajv.compile(JSON.parse(this.sources[SchemaName]));
            console.log("I compile schema!");
            return schemaValidator;
        } catch (e) {
            console.log(e.message);
        }
       
    }


    /**
     * manages the loading of the main schema and subschemas, 
     * generates a list of subschemas
     * @param {string} SchemaName
     * @throws Exception if any error
     * @returns {object}
     * 
     */
    collectListOfSubschemas(SchemaName) {
        if (!this.descr['schemas'][SchemaName]) {
            throw new Error(`Can't find the schema ${SchemaName} in descriptor.`)
        }
        var subschemas = {};
        if (this.descr['schemas'][SchemaName]['include']) {

            if (typeof(this.descr['schemas'][SchemaName]['include']) == "object") {

                for (let id in this.descr['schemas'][SchemaName]['include']) {

                    /* Attention! This function returns only subschemas, it mean that "main" schema (SchemaName) not
                    be include to list, so we need add it "manually"*/

                    subschemas[id] = this.descr['schemas'][SchemaName]['include'][id];

                    Object.assign(subschemas, this.collectListOfSubschemas(subschemas[id]));
                }
            }
        }
        console.log("subschemas ниже");  
        console.log(subschemas);
        return subschemas;
    }


    /**
     * Analitic function for download schema.
     * It analyzes availability for download and checks the sources for an element with the same name.
     * If there is no element with current name, add the loaded schema to the sources
     * @param {string} SchemaNameName of schema
     * @throws Exception if any error
     * @returns {boolean} Success flag
     */
    processLoad(Key, Schema) {
       // console.log(`Зашли в processLoad и смотрим SchemaJSON`);
       // console.log(JSON.stringify(pm.response.json()));
        //console.log(this.sources[Schema]);
        let SchemaJSON=JSON.stringify(Schema.json());
        //console.log(Key);
        if (!this.sources[SchemaJSON]) { 
            //console.log(`Зашли в иф -значит элемент отсутствует в соурсе`);          
            //here i need to check that sendRequest return resolve result (not error)
            // if sendRequest return result than res=this.sources[SchemaName]

            //const result = await sendRequest(this.getSchemaRequestParameters(SchemaName));

            if (pm.expect(Schema).to.have.property('code', 200) &&
                pm.expect(Schema).to.have.property('status', 'OK')) {
                this.sources[Key] = SchemaJSON;
               // console.log(this.sources[Schema]);
            }            
        }
        //console.log(`На выходе processLoad`);
        
        return true;
    }
}

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
                return reject(err);
            }                   
            return resolve(res);

        })
    });
}

const sl = new PMSchemaLoadManager(descr, "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents");

async function wrapper() {
    try {
        for (var schema of sl.getSchemasToLoadFor("get_lang_schema")) {  
          //  console.log(`генератор выдал название схемы ${schema}`);          
            sl.processLoad(schema, await sendRequest(sl.getSchemaRequestParameters(schema)));
        }
        ajv = sl.addSchemaToAjv("get_lang_schema");        
        clearInterval(_dummy)
    } catch (ex) {
        console.log(`Fail: name: ${ex.name}; message: ${ex.message}`);
        clearInterval(_dummy)
    }
}
wrapper();