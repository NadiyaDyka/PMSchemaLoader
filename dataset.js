module.exports = {
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