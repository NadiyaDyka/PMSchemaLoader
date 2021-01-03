const Ajv = require('ajv');
/**
 * Main idea: download from GitHub JSON-schemas and subschemas
 * (if we haven't got them in sources yet) and when we get all needs schemas,
 * transfer them (add) into library ajv for compilation. 
 * To realize this idea we create js-class that managed schemas downloading.
 */
const descr = {
    "host": "https://github.com/NadiyaDyka/AffRegAPIDoc",
    "schemas": {

        "get_lang_schema": {
            "title": "Schema for GET language response",
            "path": "/schemas/get_lang_schema.json",
            //            "include": ["common_lib", "data_lib"]
            /*  collection of subschemas in format id: subschema_name */
            "include": { main: "common_lib", reserve: "common_lib", glsData: "data_lib" }
        },

        "common_lib": {
            "path": "/schemas/common_lib.json",
            "include": { metaId: "meta_lib", dataID: "data_lib" },
        },

        "data_lib": {
            "path": "/schemas/data_lib.json"

        },

        "meta_lib": {
            "path": "/schemas/meta_lib.json"
        }
    }
}

class PMSchemaLoader {
    descr = {};
    host = "";
    /**
     * storege for schema sources
     */
    sources = {};
    LockFlag = {};
    constructor(descr, host) {
        this.descr = descr;
        this.host = host;
    }

    getSchema(schema_name) {
        let subschemas = this.load(schema_name);
        console.log(subschemas);
        this.LockFlag = {};
        console.log(`getSchema: befor new Ajv`);
        let ajv = new Ajv({ logger: console, allErrors: true, verbose: true });
        console.log(`getSchema: after new Ajv`);
        for (let key in subschemas) {
            let subschema_name = subschemas[key];
            console.log(`Add subschema: ${subschema_name}`);
            console.log(this.sources[subschema_name]);
            ajv.addSchema(this.sources[subschema_name], key);
        }
        try {
            let validate = ajv.compile(schema_name);
            console.log("I'm compile something!");
        } catch (e) {
            console.log(e.message);
        }
        return validate;
    }


    /**
     * manages the loading of the main schema and subschemas, 
     * generates a list of subschemas
     * @param {string} schema_name 
     * @throws Exception if any error
     * @returns {object}
     * 
     */
    load(schema_name) {
        if (!this.descr['schemas'][schema_name]) {
            throw new Error(`Can't find the schema ${schema_name} in descriptor.`)
        }
        let succses = this.loadItem(schema_name);

        var subschemas = {};
        if (this.descr['schemas'][schema_name]['include']) {

            if (typeof(this.descr['schemas'][schema_name]['include']) == "object") {

                for (let id in this.descr['schemas'][schema_name]['include']) {

                    /* Attention! This function returns only subschemas, it mean that "main" schema (schema_name) not
                    be include to list, so we need add it "manually"*/

                    subschemas[id] = this.descr['schemas'][schema_name]['include'][id];

                    Object.assign(subschemas, this.load(subschemas[id]));
                }
            }
        }
        return subschemas;
    }


    /**
     * Analitic function for download schema.
     * It analyzes availability for download and checks the sources for an element with the same name.
     * If there is no element with current name, add the loaded schema to the sources
     * @param {string} schema_name Name of schema
     * @throws Exception if any error
     * @returns {boolean} Success flag
     */
    async loadItem(schema_name) {

        if (!this.sources[schema_name]) {
            console.log(`loadItem: Before _loadItem ${schema_name}`)
            if (!this.LockFlag[schema_name]) {
                this.LockFlag[schema_name] = 1;
                //here i need to check that this._loadItem return resolve result (not error)
                // if this._loadItem return result than res=this.sources[schema_name]
                this.sources[schema_name] = await this._loadItem(this.getSchemaRequestParameters(schema_name));
                console.log(`loadItem: After _loadItem ${schema_name}`);
            } else {
                console.log(`loadItem: schema already locked ${schema_name}`);
            }

        } else {
            console.log(`loadItem: schema already loaded ${schema_name}`);
        }
        return true;
    }

    /**
     * Internal Function download schema used Request Parameters
     * (It doesn't analyzes anything)
     * @param {string} url Url of schema
     * @throws Exception if any error
     * @returns {object} Schema Request Parameters
     */
    _loadItem(requestParameters) {
            /*function sendRequest(req) {*/
            return new Promise((resolve, reject) => {
                // console.log("_loadItem");
                pm.sendRequest(requestParameters, (err, res) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(res);
                })
            });
        }
        //*/
        // return "Placeholder for " + requestParameters;


    /**
     * Function forms a string with the url and
     * than create object with request parameters 
     * @param {string} schema_name Name of Schema
     * @throws Exception if any error
     * @returns {object} request parameters for get Schema
     */
    getSchemaRequestParameters(schema_name) {
        if (!this.descr['schemas'][schema_name]['path']) {
            throw new Error(`Can't find property 'path' in descriptor for ${schema_name}`)
        };
        let requestParameters = {};
        let url = this.host + this.descr['schemas'][schema_name]['path'];
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
        // return url;
        //console.log(requestParameters);
        return requestParameters;

    }
}

const sl = new PMSchemaLoader(descr, "https://github.com/NadiyaDyka/AffRegAPIDoc");

try {
    let x = sl.getSchema("get_lang_schema");
    //console.log("See X on next row");
    console.log(x);
} catch (ex) {
    console.log(`Fail: name: ${ex.name}; message: ${ex.message}`);
}