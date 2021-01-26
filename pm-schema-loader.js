//module.exports = 

/**
 * class that manages the loading of the descriptor, json-schemas, subschemas 
 * and transferring the schemas to the AJV-library
 */
class PMSchemaLoadManager {
    /**
     *An object describing the relationships of schemas and subschemas.
     *It should have the following structure:
     *{
     *"host": "https:// host address",
     *"schemas": {
     *
     *  "schema1": {
     *      "title": "Description of schema1",
     *      "path": "/path to/schema1.json",           
     *      "include": { "schema1_id1": "subschema1", "schema1_id2": "subschema", "schema1_id3": "subschema3"}
     *  },
     *
     *  "subschema1": {
     *      "path": "/path to/subschema1.json"           
     *  },
     * .......
     * }  
     * "include" object consists of pairs: (unique identifier of the subschema, the name of the subschema in the descriptor)
     */
    descr;
    /**
     * An object containing the default request parameters for downloading the descriptor
     */
    descriptorRequestParameters = {
        /**
         *  URL for descriptor
         */
        "url": "",
        /**
         *  Method of getting. Default: GET
         */ 
        "method": "GET",
        /**
         * Header for request. Need to be an object
         */
        "header": {}      
    };
    /**
     * base url for download schemas
     */
    host;
    /**
     * vriable for change testing mode
     * toggles the mode of displaying/not displaying debug messages
     */
    _debugMode = false;

    /**
     * storege for schema sources
     */
    sources = {};
    /**
     * The constructor processes an object - a complete set of parameters for a request
     * or a string - a path for downloading a descriptor (for the simplest case, when link enought for download)
     * @param {object|string} initParamPMSchemaLoadManager 
     */
    constructor(initParamPMSchemaLoadManager) {
       
       if (typeof initParamPMSchemaLoadManager ==="string"){

           this.descriptorRequestParameters.url = initParamPMSchemaLoadManager;
            if (this._debugMode) {                  
                console.log(`url: ${this.descriptorRequestParameters.url}`);
            };
       }else if(typeof initParamPMSchemaLoadManager ==='object'){
            try {          
                this.descriptorRequestParameters["url"] = initParamPMSchemaLoadManager["url"];
                this.descriptorRequestParameters["method"] = initParamPMSchemaLoadManager["method"];
                /**
                * as a header, we assume to receive an object containing all the necessary parameters
                */
                this.descriptorRequestParameters["header"] = initParamPMSchemaLoadManager["header"];
                if (this._debugMode) {
                    console.log(`url: ${this.descriptorRequestParameters["url"]}`);                  
                    console.log(this.descriptorRequestParameters); 
                };                         
                 
             }catch (ex) {
                console.log(`Invalid initParamPMSchemaLoadManager: name: ${ex.name}; message: ${ex.message}`);
            }
            
       }else {

            throw new Error(`Invalid initParamPMSchemaLoadManager. It need to be an object or a string`);
       };                   
    }     
    /**
     * functions are described below - getters and setters for variables
     * _debugMode, descr and host
     */
    getDebugMode() {
        return this._debugMode;
      }
    
    setDebugMode(param) {
        this._debugMode = param; 
        return true;     
    }

    getDescriptor() {
        return this.descr;     
    }

    setDescriptor(newDescriptor) {
        this.descr = newDescriptor; 
        this.host = this.descr["host"];      
        return true;     
    }
    
    getHost() {
        return this.host;
    }

    setHost(newHost) {
        this.host = newHost;   
        return true;        
    }
    /**
     *This function composes request parameters for downloading the descriptor 
    * @param {object} headerForDescriptorRequestParameters 
    */
    getDescriptorRequestParameters(headerForDescriptorRequestParameters){
       
        if (this.descriptorRequestParameters["method"] === ""){          
            this.descriptorRequestParameters["method"] = 'GET'; 
        };
        if ( headerForDescriptorRequestParameters ) {          
            this.descriptorRequestParameters["header"] = headerForDescriptorRequestParameters;
        };            
        if (this._debugMode) {
            console.log(`descriptorRequestParameters`);
            console.log(this.descriptorRequestParameters);
        };      
        return this.descriptorRequestParameters;     
    }

    /**
     * Function composes a string with the url and
     * than create object with request parameters 
     * @param {string} SchemaName Name of Schema
     * @param {object} headerForSchemaRequestParameters (optional) header for SchemaRequestParameters 
     * If the parameter is passed, the request will be sent with this header
     * @throws Exception if any error
     * @returns {object} request parameters for get Schema
     */

    getSchemaRequestParameters(SchemaName, headerForSchemaRequestParameters) {
            if (!this.descr["schemas"][SchemaName]["path"]) {
                throw new Error(`Can't find property 'path' in descriptor for ${SchemaName}`);
            };
            let requestParameters = {};
            let url = this.host + this.descr["schemas"][SchemaName]["path"];
            requestParameters.url = url;
            requestParameters.method = "GET";
           
            if ( headerForSchemaRequestParameters ) {                      
                requestParameters.header = headerForSchemaRequestParameters;
            };
            if (this._debugMode) {
                console.log(requestParameters);
            }
            return requestParameters;        
    }

    /**
     * manages the generating list of schemas to load from host      
     * @param {string} SchemaName
     * @param {object} excludeList (optional). If passed object has some items
     * function do not return yield when get any of this items
     * @throws Exception if any error
     * @returns {object}
     *
     *This is a generator function. It does not form the array in advance, but
     *transfers control to the outside as soon as it receives the first element.
     *A client with this function can work like this:
     *async function(){
     *  try {
     *    foreach( var scheme in PMSchemaLoadManager.getSchemasToLoadFor(SchemaName) ) { // *1
     *     PMSchemaLoadManager.processLoad( await sendRequest( PMSchemaLoadManager.getSchemaRequestParameters(scheme) ) );
     *    }
     *   ajv = PMSchemaLoadManager.getAJV( SchemaName );
     *  }
     * catch(...){
     * 
     * }();
     */

    * getSchemasToLoadFor(SchemaName, excludeList = {}) {
         if (this._debugMode) {
            console.log(`Let read descr`);
            console.log(this.descr["schemas"]);
         }; 
        if (!this.descr["schemas"][SchemaName]) {
            throw new Error(`Can't find the schema ${SchemaName} in descriptor.`)
        };
        if (this._debugMode) {
            console.log(`Let me see current item of the source and then object sources`);
            console.log(this.sources[SchemaName]); 
            console.log(this.sources); 
        };
        if (!this.sources[SchemaName] &&
            !excludeList[SchemaName]) {              
            yield SchemaName;
            excludeList[SchemaName] = true;           
        };

        if (this.descr["schemas"][SchemaName]["include"]) {

            if (typeof(this.descr["schemas"][SchemaName]["include"]) == "object") {

                for (let id in this.descr["schemas"][SchemaName]["include"]) {

                    let subschema = this.descr["schemas"][SchemaName]["include"][id];
                    yield* this.getSchemasToLoadFor(subschema, excludeList);
                }
            }
        };
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
        if (this._debugMode) {
            console.log("The `sources` can see below:");       
            console.log(this.sources);
            console.log(`getSchema: befor new Ajv`);
        }
        // Because Promises in Postman are still buggy (see https://community.postman.com/t/using-native-javascript-promises-in-postman/636/11)
        // We have no other way as use own waiting function.
        // this.waitForLoad(SchemaName, subschemas);
       
        let ajv = new Ajv({ logger: console, allErrors: true, verbose: true });
        if (this._debugMode) {
          console.log(`getSchema: after new Ajv`);
        };
        for (let key in subschemas) {
            let subSchemaName = subschemas[key];
            if (this._debugMode) {
                console.log(`Add subschema to ajv: ${subSchemaName}`);
                console.log(this.sources[subSchemaName]);
            };            
            ajv.addSchema(this.sources[subSchemaName], key);
            if (this._debugMode) {
                console.log(`key ${key}`);              
                console.log(this.sources[SchemaName]);
            };
        };
        try {       
            const schemaValidator = ajv.compile(this.sources[SchemaName]);
            if (this._debugMode) {
                console.log("I compile schema!");
            };
            return schemaValidator;
        } catch (e) {
            console.log(e.message);
        };
       
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

                   /** Attention! This function returns only subschemas, it mean that "main" schema (SchemaName) not
                    *   be include to list, so we need add it "manually"
                    */
                    subschemas[id] = this.descr['schemas'][SchemaName]['include'][id];

                    Object.assign(subschemas, this.collectListOfSubschemas(subschemas[id]));
                }
            }
        }
        if (this._debugMode) {
            console.log("See subschemas below");  
            console.log(subschemas);
        };
        return subschemas;
    }

    /**
     * Analitic function for download schema.
     * It analyzes result of download and checks the sources for an element with the same name.
     * If there is no element with current name, add the loaded schema to the sources
     * @param {string} SchemaNameName of schema
     * @throws Exception if any error
     * @returns {boolean} Success flag
     */
    processLoad(Key, Schema) {
        if (this._debugMode) {
            console.log(`We are into processLoad and then see SchemaJSON`);
            console.log(Schema.json());
            console.log(this.sources[Schema]);
        }; 
       
        let SchemaJSON=Schema.json();
        if (this._debugMode) {
            console.log(Key);
        };    
        if (!this.sources[SchemaJSON]) { 
            if (this._debugMode) {
                console.log(`Fall down into If - mean item is absent in sources`);          
            };    
            //here i need to check that sendRequest return resolve result (not error)
            // if sendRequest return result than res=this.sources[SchemaName]

             if (pm.expect(Schema).to.have.property('code', 200) &&
                pm.expect(Schema).to.have.property('status', 'OK')) {
                this.sources[Key] = SchemaJSON;
                if (this._debugMode) {
                 console.log(this.sources[Schema]);
                };
            };            
        }
        if (this._debugMode) {
            console.log(`Befor the exit of processLoad`);
        };        
        return true;
    }
/**
 * This function get the row of the descriptor, convert it to JSON  
 * and passes it to the setter to assign a value to the descriptor and host
 * @param {object} rowDescriptor 
 */
    processDescriptorLoad(rowDescriptor) {
        if (this._debugMode) {
            console.log(`We are into processDecriptorLoad and below can see descr`);
            console.log(rowDescriptor.json());           
        };
        if (pm.expect(rowDescriptor).to.have.property('code', 200) &&
        pm.expect(rowDescriptor).to.have.property('status', 'OK')) {        
            this.setDescriptor(rowDescriptor.json());       
            this.setHost(this.descr["host"]);
        };
        if (this._debugMode) {
            console.log(this.descr);
            console.log(this.host);           
        };                     
        return true;
    }
}
/**
 * Set the value of the variable to pass the parameter when initializing the class
 */ 
let initParamPMSchemaLoadManager = {
    "url":"https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents/schemas/descriptor.json", 
    "method":"GET", 
    "header":{
        "Accept":"application/vnd.github.VERSION.raw",
        "Authorization":"token 4ac77666d4a0013f7cb791d0319d412a59653db6"
    }
};
/**
 * Set the value of the variable to pass the parameter when initializing the class
 */ 
//let initParamPMSchemaLoadManager = "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents/schemas/descriptor.json" 
 /**
  * initialize the class as SingleTone
  * to save all downloaded schemes in it and not download them again
  *  */   
sl = new PMSchemaLoadManager(initParamPMSchemaLoadManager);