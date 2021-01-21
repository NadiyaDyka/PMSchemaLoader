module.exports = {
    "host": "https://api.github.com/repos/NadiyaDyka/AffRegAPIDoc/contents",
    "schemas": {

        "get_lang_schema": {
            "title": "Schema for GET language response",
            "path": "/schemas/get_lang_schema.json",           
            "include": { "get_lang_schema_id1": "common_lib", "get_lang_schema_id2": "meta_lib", "get_lang_schema_id3": "data_lib" }
        },

        "common_lib": {
            "path": "/schemas/common_lib.json"           
        },

        "data_lib": {
            "path": "/schemas/data_lib.json"
        },

        "meta_lib": {
            "path": "/schemas/meta_lib.json"
        },

        "get_form_schema": {
            "title": "Schema for GET password, Get affiliate responses",
            "path": "/schemas/get_form_schema.json",           
            "include": { "get_form_schema_id1": "common_lib", "get_form_schema_id2": "meta_lib", "get_form_schema_id3": "data_lib" }
        },

        "post_aff_err_schema": {
            "title": "Schema for POST Affiliate error response",
            "path": "/schemas/post_aff_err_schema.json",           
            "include": { "post_aff_err_schema_id1": "common_lib", "post_aff_err_schema_id2": "meta_lib", "post_aff_err_schema_id3": "data_lib" }
        },

        "post_aff_ok_schema": {
            "title": "Schema for POST affiliate OK responses",
            "path": "/schemas/post_aff_ok_schema.json",           
            "include": { "post_aff_ok_schema_id1": "common_lib", "post_aff_ok_schema_id2": "meta_lib", "post_aff_ok_schema_id3": "data_lib" }
        },

        "post_password_schema": {
            "title": "Schema for POST password response",
            "path": "/schemas/post_password_schema.json",           
            "include": { "post_password_schema_id1": "common_lib", "post_password_schema_id2": "data_lib" }
        }
    }
}
