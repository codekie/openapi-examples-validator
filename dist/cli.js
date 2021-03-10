#!/usr/bin/env node
(()=>{var e={331:(e,t,a)=>{const r=a(815),n={byte:{min:new r("-128"),max:new r("127")},int32:{min:new r("-2147483648"),max:new r("2147483647")},int64:{min:new r("-9223372036854775808"),max:new r("9223372036854775807")},float:{min:new r(2).pow(128).negated(),max:new r(2).pow(128)},double:{min:new r(2).pow(1024).negated(),max:new r(2).pow(1024)}};e.exports=n},574:(e,t,a)=>{const r=a(331);e.exports={int32:function(e){return Number.isInteger(+e)&&r.int32.max.greaterThanOrEqualTo(e)&&r.int32.min.lessThanOrEqualTo(e)},int64:function(e){return Number.isInteger(+e)&&r.int64.max.greaterThanOrEqualTo(e)&&r.int64.min.lessThanOrEqualTo(e)},float:function(e){return r.float.max.greaterThanOrEqualTo(e)&&r.float.min.lessThanOrEqualTo(e)},double:function(e){return r.double.max.greaterThanOrEqualTo(e)&&r.double.min.lessThanOrEqualTo(e)},byte:function(e){const t=e.length;if(!t||t%4!=0||/[^A-Z0-9+\/=]/i.test(e))return!1;const a=e.indexOf("=");return-1===a||a===t-1||a===t-2&&"="===e[t-1]}}},114:(e,t,a)=>{const r=a(914),{ENOENT:n}=a(66).code,s={jsENOENT:n.code,jsonPathNotFound:"JsonPathNotFound",errorAndErrorsMutuallyExclusive:"ErrorErrorsMutuallyExclusive",parseError:"ParseError",validation:"Validation"};class i{static create(e){const{code:t,message:a,path:n,cause:o}=e,p=t||e.type||s.validation,l={message:a};return s.validation===p||s.errorAndErrorsMutuallyExclusive===p?r(l,e):(n&&r(l,{params:{path:n}}),o&&r(l,o)),new i(p,l)}constructor(e,t={}){Object.assign(this,{type:e,...t})}}e.exports={ApplicationError:i,ErrorType:s}},520:(e,t,a)=>{const r=a(156).version,n=a(647),{validateFile:s,validateExample:i,validateExamplesByMap:o}=a(442),p="true"===process.env.OPENAPI_EXAMPLES_VALIDATOR_TESTS;n.version(r).arguments("<filepath>").description("Validate embedded examples in OpenAPI-specs (JSON and YAML supported).\n  To validate external examples, use the `-s` and `-e` option.\n  To pass a mapping-file, to validate multiple external examples, use the `-m` option.").option("-s, --schema-jsonpath <schema-jsonpath>","Path to OpenAPI-schema, to validate the example file against").option("-e, --example-filepath <example-filepath>","file path to example file, to be validated").option("-m, --mapping-filepath <mapping-filepath>","file path to map, containing schema-paths as key and the file-path(s) to examples as value. If wildcards are used, the parameter has to be put in quotes.").option("-c, --cwd-to-mapping-file","changes to the directory of the mapping-file, before resolving the example's paths. Use this option, if your mapping-files use relative paths for the examples").option("-n, --no-additional-properties","don't allow properties that are not described in the schema").action((async function(e,t){const{schemaJsonpath:a,exampleFilepath:r,mappingFilepath:n,cwdToMappingFile:l}=t,c=!t.additionalProperties;let u;n?(console.log("Validating with mapping file"),u=await o(e,n,{cwdToMappingFile:l,noAdditionalProperties:c})):a&&r?(console.log("Validating single external example"),u=await i(e,a,r,{noAdditionalProperties:c})):(console.log("Validating examples"),u=await s(e,{noAdditionalProperties:c})),function(e){const t=p;if(function(e){const{schemasWithExamples:t,examplesWithoutSchema:a,examplesTotal:r,matchingFilePathsMapping:n}=e,s=[`Schemas with examples found: ${t}`,`Examples without schema found: ${a}`,`Total examples found: ${r}`];null!=n&&s.push(`Matching mapping files found: ${n}`),process.stdout.write(`${s.join("\n")}\n`)}(e.statistics),e.valid)return process.stdout.write("\nNo errors found.\n\n"),void(!t&&process.exit(0));process.stdout.write("\nErrors found.\n\n"),process.stderr.write(JSON.stringify(e.errors,null,"    ")),!t&&process.exit(1)}(u)})),n.on("--help",(()=>{console.log("\n\n  Example for external example-file:\n"),console.log("    $ openapi-examples-validator -s $.paths./.get.responses.200.schema -e example.json openapi-spec.json\n\n")})),e.exports=n.parseAsync(process.argv)},99:e=>{e.exports={parent:"parent",parentProperty:"parentProperty",path:"path",pointer:"pointer",value:"value"}},951:(e,t,a)=>{const r=a(565),n=a(291),s=/^3\./;e.exports={getImplementation:function(e){return"string"==typeof e.swagger?r:e.openapi&&e.openapi.match(s)?n:null}}},251:(e,t,a)=>{const{JSONPath:r}=a(58),n=a(99),s=["$..application/json.schema",'$..schema..[?(@.properties && (@property === "schema" || @property === "items" || @.type === "object"))]'],i=["oneOf","allOf","anyOf","not"];function o(e){return t=>{const a=JSON.stringify(t);i.some((e=>a.includes(`"${e}"`)))?console.warn(`"additionalProperties" flag not set for ${e} because it contains JSON-schema combiner keywords.`):t.additionalProperties=!1}}function p(e,t,a=n.path,s){return r({json:e,path:t,flatten:!0,resultType:a,callback:s})}e.exports={setNoAdditionalProperties:function(e,t=[],a=o){const r=new Set;s.forEach((t=>{p(e,t).forEach((e=>{i.some((t=>e.includes(`['${t}']`)))?console.warn(`"additionalProperties" flag not set for ${e} because it contains JSON-schema combiner keywords.`):r.add(e)}))})),function(e,t,a){a.forEach((a=>{p(e,a).forEach((e=>{for(const a of t)a.startsWith(e)&&t.delete(a)}))}))}(e,r,t);for(const t of r)p(e,t,n.value,a(t))}}},565:(e,t,a)=>{const{JSONPath:r}=a(58),{setNoAdditionalProperties:n}=a(251),s=a(242);function i(){return["$..examples.application/json"]}e.exports={buildValidationMap:function(e){return e.reduce(((e,t)=>{const a=function(e){const t=r.toPathArray(e).slice(),a=t.lastIndexOf("examples");return t.splice(a,t.length-a,"schema"),r.toPathString(t)}(t);return e[a]=(e[a]||new Set).add(t),e}),{})},escapeExampleName:function(e){return e},getJsonPathsToExamples:i,prepare:function(e,{noAdditionalProperties:t}={}){const a=s(e);return t&&n(a,["$..examples.application/json"]),a},unescapeExampleNames:function(e){return e}}},291:(e,t,a)=>{const{JSONPath:r}=a(58),n=a(242),{ApplicationError:s,ErrorType:i}=a(114),{setNoAdditionalProperties:o}=a(251),p="single";function l(){return["$..responses..content.application/json.example","$..responses..content.application/json.examples.*.value","$..parameters..example","$..parameters..examples.*.value","$..requestBody.content.application/json.example","$..requestBody.content.application/json.examples.*.value"]}e.exports={buildValidationMap:function(e){const t=new Map;return e.reduce(((e,a)=>{const{pathSchemaAsArray:n,exampleType:o}=function(e){const t=r.toPathArray(e).slice(),a=t.lastIndexOf("example"),n=a>-1?p:"multi",s=n===p?a:t.lastIndexOf("examples");return t.splice(s,t.length-s,"schema"),{exampleType:n,pathSchemaAsArray:t}}(a),l=r.toPathString(n),c=t.get(l);return c&&c!==o&&function(e){const t=e.slice(0,e.length-1);throw s.create({type:i.errorAndErrorsMutuallyExclusive,message:'Properties "error" and "errors" are mutually exclusive',params:{pathContext:r.toPointer(t)}})}(n),t.set(l,o),e[l]=(e[l]||new Set).add(a),e}),{})},escapeExampleName:function(e){return e.replace(/\['examples'\]\['(.*)\]\['value'\]$/,"['examples']['`$1]['value']")},getJsonPathsToExamples:l,prepare:function(e,{noAdditionalProperties:t}={}){const a=n(e);return t&&o(a,["$..responses..content.application/json.example","$..responses..content.application/json.examples.*.value","$..parameters..example","$..parameters..examples.*.value","$..requestBody.content.application/json.example","$..requestBody.content.application/json.examples.*.value"]),a},unescapeExampleNames:function(e){return e&&e.replace(/\/examples\/`(.*)\/value$/,"/examples/$1/value")}}},442:(e,t,a)=>{const r=a(914),n=a(337),s=a(910),i=a(747),o=a(622),p=a(878),l=a(969),{JSONPath:c}=a(58),u=a(542),{createError:m}=a(66).custom,d=a(99),{getValidatorFactory:f,compileValidate:h}=a(924),x=a(951),{ApplicationError:g,ErrorType:y}=a(114),{createValidationResponse:v,dereferenceJsonSchema:b}=a(754),E=Symbol("internal"),w="schemasWithExamples",P=["yaml","yml"],$=m(y.jsonPathNotFound);async function j(e,{noAdditionalProperties:t}={}){const a=x.getImplementation(e);e=await u.dereference(e),e=a.prepare(e,{noAdditionalProperties:t});let r=a.getJsonPathsToExamples().reduce(((t,a)=>t.concat(function(e,t){return c({json:e,path:t,resultType:d.path})}(e,a))),[]).map(a.escapeExampleName);return function({impl:e},t,a){const r=S(),n={valid:!0,statistics:r,errors:[]},s=q(a);let i;try{i=e.buildValidationMap(t)}catch(e){if(!(e instanceof g))throw e;return n.valid=!1,n.errors.push(e),n}return Object.keys(i).forEach((e=>{!function({openapiSpec:e,createValidator:t,pathSchema:a,validationMap:r,statistics:n,validationResult:s}){const i=s.errors;r[a].forEach((r=>{const o=I(r,e),p=M(a,e,!0),l=N({createValidator:t,schema:p,example:o,statistics:n}).map((e=>(e.examplePath=c.toPointer(c.toPathArray(r)),e)));l.length&&(s.valid=!1,i.splice(i.length-1,0,...l))}))}({openapiSpec:a,createValidator:s,pathSchema:e,validationMap:i,statistics:r,validationResult:n})})),n.errors.forEach((t=>{t.examplePath=e.unescapeExampleNames(t.examplePath)})),n}({impl:a},r,e)}async function O(e){let t;if(function(e){const t=e.split(".").pop();return P.includes(t)}(e))try{t=l.parse(i.readFileSync(e,"utf-8"))}catch(e){const{name:t,message:a}=e;throw new g(y.parseError,{message:`${t}: ${a}`})}else t=JSON.parse(i.readFileSync(e,"utf-8"));return await b(e,t)}function A(e){const t=S(),a=e(t);return v({errors:a,statistics:t})}function T(e,t,a,{cwdToMappingFile:r=!1,dirPathMapExternalExamples:p}){return s(Object.entries(t),(([t,l])=>{let c=null;try{c=M(t,e)}catch(e){return g.create(e)}return s(n([l]),(t=>{let n=null;try{const e=r?o.join(p,t):t;n=JSON.parse(i.readFileSync(e,"utf-8"))}catch(e){return[g.create(e)]}return N({createValidator:q(e),schema:c,example:n,statistics:a,filePathExample:t})}))}))}function S(){const e={[E]:{[w]:new Set},examplesTotal:0,examplesWithoutSchema:0};return Object.defineProperty(e,w,{enumerable:!0,get:()=>e[E].schemasWithExamples.size}),e}function I(e,t){return c({json:t,path:e,flatten:!0,wrap:!1,resultType:d.value})}function N({createValidator:e,schema:t,example:a,statistics:r,filePathExample:n}){const s=[];if(r.examplesTotal++,!t)return r.examplesWithoutSchema++,s;r[E].schemasWithExamples.add(t);const i=h(e(),t);return i(a)?s:s.concat(...i.errors.map(g.create)).map((e=>n?(e.exampleFilePath=n,e):e))}function q(e){return f(e,{schemaId:"auto",allErrors:!0,nullable:!0})}function M(e,t,a=!1){const r=I(e,t);if(!a&&!r)throw new $(`Path to schema can't be found: '${e}'`,{params:{path:e}});return r}e.exports={default:j,validateFile:async function(e,{noAdditionalProperties:t}={}){let a=null;try{a=await O(e)}catch(e){return v({errors:[g.create(e)]})}return j(a,{noAdditionalProperties:t})},validateExample:async function(e,t,a,{noAdditionalProperties:r}={}){let n=null,s=null,o=null;try{n=JSON.parse(i.readFileSync(a,"utf-8")),o=await O(e),o=x.getImplementation(o).prepare(o,{noAdditionalProperties:r}),s=M(t,o)}catch(e){return v({errors:[g.create(e)]})}return A((e=>N({createValidator:q(o),schema:s,example:n,statistics:e,filePathExample:a})))},validateExamplesByMap:async function(e,t,{cwdToMappingFile:a,noAdditionalProperties:n}={}){let s=0;const l=p.sync(t,{nonull:!0});let c=[];for(let t of l){let r=null,p=null;try{r=JSON.parse(i.readFileSync(t,"utf-8")),p=await O(e),p=x.getImplementation(p).prepare(p,{noAdditionalProperties:n})}catch(e){c.push(v({errors:[g.create(e)]}));continue}s++,c.push(A((e=>T(p,r,e,{cwdToMappingFile:a,dirPathMapExternalExamples:o.dirname(t)}).map((e=>Object.assign(e,{mapFilePath:t}))))))}return r(c.reduce(((e,t)=>{return e?(r=t,v({errors:(a=e).errors.concat(r.errors),statistics:Object.entries(a.statistics).reduce(((e,[t,n])=>w===t?([a,r].forEach((t=>{const a=t.statistics[E].schemasWithExamples.values();for(let t of a)e[E].schemasWithExamples.add(t)})),e):(e[t]=n+r.statistics[t],e)),S())})):t;var a,r}),null),{statistics:{matchingFilePathsMapping:s}})}}},754:(e,t,a)=>{const r=a(622),n=a(542);e.exports={createValidationResponse:function({errors:e,statistics:t={}}){return{valid:!e.length,statistics:t,errors:e}},dereferenceJsonSchema:async function(e,t){const a=process.cwd();process.chdir(r.dirname(e));const s=await n.dereference(t);return process.chdir(a),s}}},924:(e,t,a)=>{const{JSONPath:r}=a(58),n=a(403),s=a(663),i=a(574),o=a(217),p="$..$ref",l="https://www.npmjs.com/package/openapi-examples-validator/defs.json";e.exports={getValidatorFactory:function(e,t){const a=function(e){const t={$id:l};return r({path:p,json:e,callback(a){if(!a.startsWith("#"))return;const r=a.substring(1),s=n.get(e,r);n.set(t,r,s)}}),t}(e);return()=>{const e=new s(t);return function(e){e.removeSchema(""),e.addMetaSchema(o,o.id),e._opts.defaultMeta=o.id}(e),function(e){e.addFormat("int32",{type:"number",validate:i.int32}),e.addFormat("int64",{type:"string",validate:i.int64}),e.addFormat("float",{type:"number",validate:i.float}),e.addFormat("double",{type:"number",validate:i.double}),e.addFormat("byte",{type:"string",validate:i.byte})}(e),e.addSchema(a),e}},compileValidate:function(e,t){const a=function(e,t){const a=Object.assign({},e);return a.$id="https://www.npmjs.com/package/openapi-examples-validator/schema.json",a}(t);let n;r({path:p,json:a,callback(e,t,a){e.startsWith("#")&&(a.parent[a.parentProperty]=`${l}${e}`)}});try{n=e.compile(a)}catch(e){n=()=>{},n.errors=[e]}return n}}},217:e=>{e.exports={id:"http://json-schema.org/draft-04/schema#",$schema:"http://json-schema.org/draft-04/schema#",description:"Core schema meta-schema",definitions:{schemaArray:{type:"array",minItems:1,items:{$ref:"#"}},positiveInteger:{type:"integer",minimum:0},positiveIntegerDefault0:{allOf:[{$ref:"#/definitions/positiveInteger"},{default:0}]},simpleTypes:{enum:["array","boolean","integer","null","number","object","string"]},stringArray:{type:"array",items:{type:"string"},minItems:1,uniqueItems:!0}},type:"object",properties:{id:{type:"string"},$schema:{type:"string"},title:{type:"string"},description:{type:"string"},default:{},multipleOf:{type:"number",minimum:0,exclusiveMinimum:!0},maximum:{type:"number"},exclusiveMaximum:{type:"boolean",default:!1},minimum:{type:"number"},exclusiveMinimum:{type:"boolean",default:!1},maxLength:{$ref:"#/definitions/positiveInteger"},minLength:{$ref:"#/definitions/positiveIntegerDefault0"},pattern:{type:"string",format:"regex"},additionalItems:{anyOf:[{type:"boolean"},{$ref:"#"}],default:{}},items:{anyOf:[{$ref:"#"},{$ref:"#/definitions/schemaArray"}],default:{}},maxItems:{$ref:"#/definitions/positiveInteger"},minItems:{$ref:"#/definitions/positiveIntegerDefault0"},uniqueItems:{type:"boolean",default:!1},maxProperties:{$ref:"#/definitions/positiveInteger"},minProperties:{$ref:"#/definitions/positiveIntegerDefault0"},required:{$ref:"#/definitions/stringArray"},additionalProperties:{anyOf:[{type:"boolean"},{$ref:"#"}],default:{}},definitions:{type:"object",additionalProperties:{$ref:"#"},default:{}},properties:{type:"object",additionalProperties:{$ref:"#"},default:{}},patternProperties:{type:"object",additionalProperties:{$ref:"#"},default:{}},dependencies:{type:"object",additionalProperties:{anyOf:[{$ref:"#"},{$ref:"#/definitions/stringArray"}]}},enum:{type:"array",minItems:1,uniqueItems:!0},type:{anyOf:[{$ref:"#/definitions/simpleTypes"},{type:"array",items:{$ref:"#/definitions/simpleTypes"},minItems:1,uniqueItems:!0}]},format:{type:"string"},allOf:{$ref:"#/definitions/schemaArray"},anyOf:{$ref:"#/definitions/schemaArray"},oneOf:{$ref:"#/definitions/schemaArray"},not:{$ref:"#"}},dependencies:{exclusiveMaximum:["maximum"],exclusiveMinimum:["minimum"]},default:{}}},156:e=>{e.exports={name:"openapi-examples-validator",version:"4.3.3",description:"Validates embedded examples in OpenAPI-JSONs",main:"dist/index.js",engines:{node:">=8"},bin:{"openapi-examples-validator":"dist/cli.js"},"standard-version":{scripts:{postchangelog:"npm run release:create-dockerfile && npm run release:stage-artifacts"}},scripts:{"start-dev":"babel-node src/cli",build:"npm run build:clean && npm run build:webpack","build:clean":"rimraf dist","build:webpack":"webpack --bail --progress --profile --mode production --config ./webpack/config.babel.js",coverage:'rimraf ./coverage && nyc --reporter=lcov --reporter=text -x "dist/**/*" -x "test/**/*.js" npm test',coveralls:"cat ./coverage/lcov.info | coveralls",test:"npm run build && npm run test:mocha","test-mutations":"stryker run","test:mocha":'mocha --require "./test/util/setup-tests" --recursive "./test/specs/**/*.js"',release:"npm run build && standard-version -a","release:create-dockerfile":"npm run build && node etc/src/build-dockerfile.js","release:stage-artifacts":"git add dist/*"},repository:{type:"git",url:"git+https://github.com/codekie/openapi-examples-validator.git"},keywords:["swagger","openapi","json","validate","examples"],author:"Josua Amann",license:"MIT",bugs:{url:"https://github.com/codekie/openapi-examples-validator/issues"},homepage:"https://github.com/codekie/openapi-examples-validator#readme",devDependencies:{"@babel/cli":"^7.13.10","@babel/core":"^7.13.10","@babel/node":"^7.13.10","@babel/preset-env":"^7.13.10","@babel/register":"^7.13.8","@stryker-mutator/core":"^4.5.0","@stryker-mutator/mocha-runner":"^4.5.0","babel-eslint":"^10.1.0","babel-loader":"^8.2.2",chai:"^4.3.3",coveralls:"^3.1.0",eslint:"^7.21.0","eslint-loader":"^4.0.2","json-loader":"^0.5.7",mocha:"^8.3.1","mocha-lcov-reporter":"^1.3.0",nyc:"^15.1.0",rimraf:"^3.0.2","standard-version":"^9.1.1","stryker-cli":"1.0.0",webpack:"^5.24.4","webpack-cli":"^4.5.0"},dependencies:{ajv:"^6.12.6","ajv-oai":"1.2.1",commander:"^6.2.1",errno:"^1.0.0",glob:"^7.1.6","json-pointer":"0.6.1","json-schema-ref-parser":"^9.0.7","jsonpath-plus":"^5.0.4","lodash.clonedeep":"^4.5.0","lodash.flatmap":"^4.5.0","lodash.flatten":"^4.4.0","lodash.merge":"^4.6.2",yaml:"^1.10.0"}}},663:e=>{"use strict";e.exports=require("ajv")},647:e=>{"use strict";e.exports=require("commander")},815:e=>{"use strict";e.exports=require("decimal.js")},66:e=>{"use strict";e.exports=require("errno")},747:e=>{"use strict";e.exports=require("fs")},878:e=>{"use strict";e.exports=require("glob")},403:e=>{"use strict";e.exports=require("json-pointer")},542:e=>{"use strict";e.exports=require("json-schema-ref-parser")},58:e=>{"use strict";e.exports=require("jsonpath-plus")},242:e=>{"use strict";e.exports=require("lodash.clonedeep")},910:e=>{"use strict";e.exports=require("lodash.flatmap")},337:e=>{"use strict";e.exports=require("lodash.flatten")},914:e=>{"use strict";e.exports=require("lodash.merge")},622:e=>{"use strict";e.exports=require("path")},969:e=>{"use strict";e.exports=require("yaml")}},t={},a=function a(r){if(t[r])return t[r].exports;var n=t[r]={exports:{}};return e[r](n,n.exports,a),n.exports}(520);module.exports=a})();
//# sourceMappingURL=cli.js.map