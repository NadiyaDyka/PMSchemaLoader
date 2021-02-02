# PMSchemaLoader
Postman JSON Schema Loader

The class downloads JSON schemas from GitHub (or another source) to Postman and transfers them to the AJV library. It verifies that the server response matches the JSON schema. Schemes may change often that's why convenient to store them on GitHub.
The relationship of schemas is described by a descriptor descr (see example below). When downloading a schema, only the subschemas it needs are downloaded.

To use PMSchemaLoader you need
1. Create a directory on GitHub in which to put schemas and descriptor.  In the descriptor descr, also specify the path to the schema directory. The descriptor can be located on the place different from schemas.
2. On the Pre-Script tab of the collection in Postman, put the declaration of the class, its initialization and request details for downloading the descriptor (string or object).

When initializing a class variable, we do not use any of the keywords for declaring variables (let, var, const). In this case, the variable will be visible in any Collection window. The class will be of type SinglTone. This will make it possible to save data in it and use it from any script in the Collection.

3. On the Pre-Script tab of a specific script, place the functions working with the class (see Example.js)
 The working scheme is determined experimentally. It turned out that Postman has limitations when working with asynchronous functions. Without a special trick, asynchronous function in Postman doesn't work (see developer comment https://community.postman.com/t/executing-sync-requests-programmatically-from-a-pre-request-or-test-scripts/14678). A dummy interval must be set in the window and an asynchronous function must be described in the high level of the window ( asinc function cannot be defined inside another function) from which it is called (source - experiments).

It is easy to keep the schemes up to date by downloading only the scheme and its components that are required for a particular test.

descr is an associative array describing the relationships of schemas and subschemas.
It should have the following properties:
     {
     "host": "https:// host address",
     "schemas": {
     
       "schema1": {
           "title": "Description of schema1",
           "path": "/path to/schema1.json",             
           "include": { "schema1_id1": "subschema1", "schema1_id2": "subschema2", "schema1_id3": "subschema3"}  //see description of "include" below
      },     
       "subschema1": {
           "path": "/path to/subschema1.json"           
       },
      .......
      }
        
 "include" is associative array where pair consist from unique identifier
           of the subschema and of the name of the subschema in the descriptor. 
           This unique identifier need for transfer as a second parameter for command ajv.addSchema. 
           If this parameter not passing, schema should have unique identifier build into it.

