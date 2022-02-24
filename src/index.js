import JSONLexer from "./lexer.js";
import JSONParser from "./parser.js";
import TestVisitor from "./TestVisitor.js";

const input = '[{"a":{"e":  [44,11,44]}},{"b":true},{"c":null}, {}]';
const lexer = new JSONLexer(input);
const parser = new JSONParser(lexer);
const tree = parser.value();
const testVisitor = new TestVisitor();
const res = tree.accept(testVisitor);
console.log('res:', JSON.stringify(res));