import JSONLexer from "./lib/lexer.js";
import JSONParser from "./lib/parser.js";
import MyVisitor from "./my-visitor.js";

const input = '[{"a":{"e":  [44,11,44]}},{"b":true},{"c":null}, {}]';
const lexer = new JSONLexer(input);
const parser = new JSONParser(lexer);
const tree = parser.value();
const visitor = new MyVisitor();
const res = tree.accept(visitor);
console.log('res:', JSON.stringify(res));