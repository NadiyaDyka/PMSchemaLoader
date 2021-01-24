module.exports = class PMSchemaLoadManager {
    descr = {};
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
         * header for request. Need to be an object
         */
        "header": {}      
    };
    /**
     * base url
     */
    host = "";
    /**
     * vriable for change testing mode
     */
    _debugMode = false;

    /**
     * storege for schema sources
     */
    sources = {};
    //descr = require('./dataset.js');
    constructor(initParamPMSchemaLoadManager) {
    
       if (typeof initParamPMSchemaLoadManager ==="string"){

           this.descriptorRequestParameters.url = initParamPMSchemaLoadManager;                  

       }else if(typeof initParamPMSchemaLoadManager ==='object'){
            try {          
                this.descriptorRequestParameters["url"] = initParamPMSchemaLoadManager["url"];
                this.descriptorRequestParameters["method"] = initParamPMSchemaLoadManager["method"];
                this.descriptorRequestParameters["header"] = {};
                this.descriptorRequestParameters["header"]["Accept"] = initParamPMSchemaLoadManager["header"]["Accept"];                
                this.descriptorRequestParameters["header"]["Authorization"] = initParamPMSchemaLoadManager["header"]["Authorization"]; 
                       
                console.log(this.descriptorRequestParameters); 
                        
            }catch (ex) {
                console.log(`Invalid initParamPMSchemaLoadManager: name: ${ex.name}; message: ${ex.message}`);
            }
            
       }else {

            throw new Error(`Invalid initParamPMSchemaLoadManager. It can be an object or a string`);
       };                   
    }     

    get debugModeValue() {
        return this._debugMode;
      }
    
    set debugModeValue(param) {
        this._debugMode = param;      
    }

    set descriptorValue(descriptor) {
        this.descr = descriptor;      
    }

    getDescriptorRequestParameters(){
        
        if (!this.descriptorRequestParameters["method"]){          
            this.descriptorRequestParameters["method"] = 'GET'; 
        };
        if(!this.descriptorRequestParameters["header"]){ 
         
            this.descriptorRequestParameters["header"]["Accept"] = "application/vnd.github.VERSION.raw";
            this.descriptorRequestParameters["header"]["Authorization"] = "token 4ac77666d4a0013f7cb791d0319d412a59653db6";
        };
         
        //console.log(this.descriptorRequestParameters);     
        return this.descriptorRequestParameters;     
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
            requestParameters.method = "GET";
            /**
             *  the code below (header) need to change to use Postman's constants 
             *  or change to transfer header as parameter of class?
             */                       
            requestParameters.header = {};
            requestParameters.header.Accept = 'application/vnd.github.VERSION.raw';      
            requestParameters.header.Authorization = 'token 4ac77666d4a0013f7cb791d0319d412a59653db6'; 
            if (this._debugMode) {
                console.log(requestParameters);
            }
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
        if (this._debugMode) {
            console.log(`Let me see current item of the source and then object sources`);
            console.log(this.sources[SchemaName]); 
            console.log(this.sources); 
        };
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
        if (this._debugMode) {
            console.log("The `sources` can see below:");       
            console.log(this.sources);
        }
        // Because Promises in Postman are still buggy (see https://community.postman.com/t/using-native-javascript-promises-in-postman/636/11)
        // We have no other way as use own waiting function.
        // this.waitForLoad(SchemaName, subschemas);
        if (this._debugMode) {
            console.log(`getSchema: befor new Ajv`);
        };
        let ajv = new Ajv({ logger: console, allErrors: true, verbose: true });
        if (this._debugMode) {
          console.log(`getSchema: after new Ajv`);
        };
        for (let key in subschemas) {
            let subSchemaName = subschemas[key];
            if (this._debugMode) {
                console.log(`Add subschema to ajv: ${subSchemaName}`);
                console.log(JSON.parse(this.sources[subSchemaName]));
            };
            ajv.addSchema(JSON.parse(this.sources[subSchemaName]), key);
            if (this._debugMode) {
                console.log(`key ${key}`);
                console.log(JSON.parse(this.sources[SchemaName]));
            };
        }
        try {
            
            const schemaValidator = ajv.compile(JSON.parse(this.sources[SchemaName]));
            if (this._debugMode) {
                console.log("I compile schema!");
            };
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
        if (this._debugMode) {
            console.log("subschemas ниже");  
            console.log(subschemas);
        };
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
        if (this._debugMode) {
            console.log(`We are into processLoad and then see SchemaJSON`);
           // console.log(JSON.stringify(Schema.json()));
            console.log(this.sources[Schema]);
        }; 
        let SchemaJSON=JSON.stringify(Schema.json());
        if (this._debugMode) {
            console.log(Key);
        };    
        if (!this.sources[SchemaJSON]) { 
            if (this._debugMode) {
                console.log(`Fall down into If - mean item is absent in sources`);          
            };    
            //here i need to check that sendRequest return resolve result (not error)
            // if sendRequest return result than res=this.sources[SchemaName]

            /* if (pm.expect(Schema).to.have.property('code', 200) &&
                pm.expect(Schema).to.have.property('status', 'OK')) {
                this.sources[Key] = SchemaJSON;
                if (this._debugMode) {
                 console.log(this.sources[Schema]);
                }
            }            */ 
        }
        if (this._debugMode) {
            console.log(`Befor the exit of processLoad`);
        }
        
        return true;
    }

    processDescriptorLoad(Descr) {
        if (this._debugMode) {
            console.log(`We are into processDecriptorLoad and then see DescrJSON`);
           // console.log(JSON.stringify(Schema.json()));
            console.log(this.Descr);
        }; 
        let DescrJSON=JSON.stringify(Descr.json());
        if (this._debugMode) {
            console.log(Key);
        };            
        return true;
    }
}
