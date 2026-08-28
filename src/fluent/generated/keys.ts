import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'fb6fbdd325354e639bdb7a459566683f'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '4d8d548633234786aea7de490e165052'
                    }
                    'person-ajax': {
                        table: 'sys_script_include'
                        id: '99a7f398e61743189915b1afdd62d0b7'
                    }
                    'person-inbound-acl': {
                        table: 'sys_security_acl'
                        id: 'aaf8b3bf5aad4d759530caadb70fd73b'
                    }
                    'person-inbound-api': {
                        table: 'sys_ws_definition'
                        id: '3fa53f50d7674b55a214f2dd5d651ae1'
                    }
                    'person-inbound-upsert-route': {
                        table: 'sys_ws_operation'
                        id: 'ef9fd09a23a6499e97a5fb8e68114711'
                    }
                    'person-onload-refresh': {
                        table: 'sys_script_client'
                        id: '15f197d4c5ca4688bb2288a0056f7071'
                    }
                    'pg-person-create-header-apikey': {
                        table: 'sys_rest_message_fn_headers'
                        id: '992e95a5fee544a6bf1388f7fac8ac24'
                    }
                    'pg-person-create-var-apikey': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'db6490fbc2ce42599b87b0ac14022450'
                    }
                    'pg-person-create-var-email': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'c1eec885f3bc4721bf35301c9b858824'
                        deleted: true
                    }
                    'pg-person-create-var-external-id': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '3bc25e1919c045b5ac00d88770a058dc'
                    }
                    'pg-person-create-var-first-name': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '1e042aeb167846cda9ed188ad083855a'
                    }
                    'pg-person-create-var-last-name': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'bb1973644e8f4afbba7d702c58963061'
                    }
                    'pg-person-create-var-phone': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'abefb9cbb3284be595ff210ea39b342b'
                        deleted: true
                    }
                    'pg-person-get-header-apikey': {
                        table: 'sys_rest_message_fn_headers'
                        id: '1a638ff4648b4508a3f9b0bdda8da18c'
                    }
                    'pg-person-get-var-apikey': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '650ada471af140a8bf98380d1a82dc9b'
                    }
                    'pg-person-get-var-external-id': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'ae69ac8b966849c2ba85891e8f25141c'
                    }
                    'pg-person-header-accept': {
                        table: 'sys_rest_message_headers'
                        id: '1f53e2ab459345e4abc2a3b597c32e2a'
                    }
                    'pg-person-header-content-type': {
                        table: 'sys_rest_message_headers'
                        id: '1a2f4895763347e3b7237e6fbf1ac530'
                    }
                    'pg-person-list-header-apikey': {
                        table: 'sys_rest_message_fn_headers'
                        id: '30c3c0ad1813429e8fbeadefe27ff031'
                    }
                    'pg-person-list-param-limit': {
                        table: 'sys_rest_message_fn_param_defs'
                        id: '446e2e774cbf433b85011081dcdec2b1'
                    }
                    'pg-person-list-param-offset': {
                        table: 'sys_rest_message_fn_param_defs'
                        id: '52c53ab4cf794cbda0ac3039e650c25d'
                    }
                    'pg-person-list-var-apikey': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '58a82698768a4bedac27fdccce24491f'
                    }
                    'pg-person-list-var-limit': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'a5405158172f4966a86ef0aa19f0cc20'
                    }
                    'pg-person-list-var-offset': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '5d2e39beb86840969e3d0625090bbac1'
                    }
                    'pg-person-update-header-apikey': {
                        table: 'sys_rest_message_fn_headers'
                        id: '0d583e9f02d14352a464db41d1f0afcd'
                    }
                    'pg-person-update-var-apikey': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '58431472539646a2b325f6a4f08ba31d'
                    }
                    'pg-person-update-var-email': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'c45ed79bc82b4363bb84882c07f4de8a'
                        deleted: true
                    }
                    'pg-person-update-var-external-id': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '8c9c626b033047ac8fbe79d3dc2ef0bc'
                    }
                    'pg-person-update-var-first-name': {
                        table: 'sys_rest_message_fn_parameters'
                        id: '88585fb200d44c1ba464276355fa9f63'
                    }
                    'pg-person-update-var-last-name': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'dff6ab846936477cb92ad924d1c07e31'
                    }
                    'pg-person-update-var-phone': {
                        table: 'sys_rest_message_fn_parameters'
                        id: 'ff1f95aeac074bf3800cc4016c885488'
                        deleted: true
                    }
                    'pgsync-api-base-url': {
                        table: 'sys_properties'
                        id: '928400d0b01945e59729ed89d37edd08'
                    }
                    'pgsync-api-key': {
                        table: 'sys_properties'
                        id: '1d1ef94103e847ff89e66c054ffa3d9c'
                    }
                    'pgsync-api-mid-server': {
                        table: 'sys_properties'
                        id: 'e03fba48589442d199fed2bff894e2b5'
                    }
                    'postgres-person-api': {
                        table: 'sys_rest_message'
                        id: '0c097489fb4943d4b110940b12ae272a'
                    }
                    'postgres-person-client': {
                        table: 'sys_script_include'
                        id: '0506e27cd33145c7ae25a69f85522c2b'
                    }
                    'push-person-to-postgres': {
                        table: 'sys_script'
                        id: '8eee3135fe054c3fa129a1afa8f8daac'
                    }
                    'src_server_business-rules_push-person-to-postgres_js': {
                        table: 'sys_module'
                        id: '58cc7f4d5954435dbc811449fa6b2f89'
                    }
                    'src_server_business-rules_push-person-to-postgres_ts': {
                        table: 'sys_module'
                        id: '35edf28a7b10402e953036c9c31a6a0c'
                    }
                    'src_server_client-scripts_person-onload_client_js': {
                        table: 'sys_module'
                        id: '49718e13320144399c43cb4886436eeb'
                    }
                    'src_server_rest-apis_person-inbound-handler_ts': {
                        table: 'sys_module'
                        id: 'bf3eab71ffec4ed1b5052d2b1264dd91'
                    }
                    'src_server_script-includes_person-ajax_js': {
                        table: 'sys_module'
                        id: '4d33c66540f14b6e87ef3a1e5b052a59'
                    }
                    'src_server_script-includes_postgres-person-client_js': {
                        table: 'sys_module'
                        id: '82568ed7b936423ea966db46d0e3d51b'
                    }
                }
                composite: [
                    {
                        table: 'sys_rest_message_fn'
                        id: '0122bb8f73bc49ab9b66482ba3f39357'
                        key: {
                            rest_message: '0c097489fb4943d4b110940b12ae272a'
                            function_name: 'updatePerson'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '03531308f24843709be6c2213063f731'
                        deleted: true
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'email'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_rest_message_fn'
                        id: '03a05be7ddcb46d0a874337be46b966a'
                        key: {
                            rest_message: '0c097489fb4943d4b110940b12ae272a'
                            function_name: 'listPersons'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '0e2a23ed87324023806bfdce13e718a1'
                        key: {
                            name: 'x_2210864_person_person'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3f2c336c51534398b9479d822fc41693'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'last_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '415e96575f434a26a2be18ff028e84b9'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'last_synced'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5da24b8252584fe4b0e641f79a32fdbd'
                        key: {
                            logical_table_name: 'x_2210864_person_person'
                            col_name_string: 'external_id'
                        }
                    },
                    {
                        table: 'sys_rest_message_fn'
                        id: '5df0c55dc0a94e36a56b9496971f28dc'
                        key: {
                            rest_message: '0c097489fb4943d4b110940b12ae272a'
                            function_name: 'getPerson'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6cf28ae3c39d4edba48dd0cd7079f8e5'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'external_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '71b5e7cca31649f6a3cfe00e338c1b7c'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7bca97ccb56c493f9673f9d4d111f50c'
                        deleted: true
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'email'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '86ee83df246746ee98e2c2d81491f898'
                        key: {
                            sys_security_acl: 'aaf8b3bf5aad4d759530caadb70fd73b'
                            sys_user_role: {
                                id: 'b7e9e4ac4f3b4aaaa42eaa36cc830f05'
                                key: {
                                    name: 'x_2210864_person.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_rest_message_fn'
                        id: '8ff8323880bd491eaf247b073714ccfa'
                        key: {
                            rest_message: '0c097489fb4943d4b110940b12ae272a'
                            function_name: 'createPerson'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '98991051a47a40d5a79b26ae2076e45b'
                        deleted: true
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'phone'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a02b1c3a9b9544b3a8d54a9012167c54'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'first_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a26cbe2e62564267844a0b3a81b131e7'
                        deleted: true
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'phone'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a8d3a280503342b6bad4c16be7bc7c8e'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'first_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'acfaa6bf1e104a7aa8c25a8c9e57befe'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'last_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b296afce74d54f1eb5a7fae824f57c21'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'last_synced'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'b7e9e4ac4f3b4aaaa42eaa36cc830f05'
                        key: {
                            name: 'x_2210864_person.integration'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'df34b9983446430ca914cc95e1234906'
                        key: {
                            name: 'x_2210864_person_person'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e66a7c3283274489991878018fb53f0d'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'external_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ec68188428b14c51a7762ca94cdeeaa8'
                        key: {
                            name: 'x_2210864_person_person'
                            element: 'NULL'
                        }
                    },
                ]
            }
        }
    }
}
