class Token {
  constructor(type, text, start, end) {
    this.type = type
    this.text = text
    this.start = start
    this.end = end
  }
}

class Lexer {
  constructor(input) {
    this.input = input
    this.i = 0;
    this.c = this.input[0];
    this.isEOF = false;
  }

  consume() {
    this.i++;
    if (this.i < this.input.length) {
      this.c = this.input[this.i];
    } else {
      this.c = 'EOF'
      this.isEOF = true;
    }
  }

  match(x) {
    if (this.c === x) {
      this.consume();
    } else {
      throw new Error(`Expected ${x} but got ${this.c}`)
    }
  }
}

const isString = (c) => {
  return c === '"'
}

const isNumber = (c) => {
  return c !== null && (c === '-' || c >= '0' && c <= '9')
}

const isWhitespace = (c) => {
  return c === ' ' || c === '\n' || c === '\t' || c === '\r'
}

export default class JSONLexer extends Lexer {
  constructor(input) {
    super(input);
  }

  tokenNames = ['{', ':', ',', '}', '[', ']', 'true', 'false', 'null', 'STRING', 'NUMBER'];

  getTokenName(tokenType) {
    return this.tokenNames[tokenType - 1];
  }

  nextToken() {
    while (!this.isEOF) {
      switch (this.c) {
        case ' ': case '\t': case '\r': case '\n': this.WS(); continue;
        case '{': this.consume(); return new Token(1, '{', this.i, this.i);
        case ':': this.consume(); return new Token(2, ':', this.i, this.i);
        case ',': this.consume(); return new Token(3, ',', this.i, this.i);
        case '}': this.consume(); return new Token(4, '}', this.i, this.i);
        case '[': this.consume(); return new Token(5, '[', this.i, this.i);
        case ']': this.consume(); return new Token(6, ']', this.i, this.i);
        default:
          if (this.isKeyword('true')) return this.keywordToken('true');
          else if (this.isKeyword('false')) return this.keywordToken('false');
          else if (this.isKeyword('null')) return this.keywordToken('null');
          else if (isString(this.c)) return this.STRING();
          else if (isNumber(this.c)) return this.NUMBER();
          else throw new Error(`Unexpected character ${this.c} in JSON at position ${this.i}`);

      }
    }
    return new Token(-1, 'EOF', null, null);
  }

  isKeyword(text) {
    return this.input.slice(this.i, this.i + text.length) === text
  }

  keywordToken(text) {
    const TOKEN_MAP = { 'true': 7, 'false': 8, 'null': 9 };
    for (let i = 0; i < text.length; i++) {
      this.consume();
    }
    return new Token(TOKEN_MAP[text], text, this.i - text.length + 1, this.i);
  }

  STRING() {
    this.consume(); // 忽略左引号 '"'
    let result = '';
    while (this.c !== '"') {
      result += this.c;
      this.consume();
    }
    this.consume(); // 忽略右引号 '"'
    return new Token(10, result, this.i - 2, this.i + result.length - 1);
  }

  NUMBER() {
    let result = '';
    while (isNumber(this.c)) {
      result += this.c;
      this.consume();
    }
    return new Token(11, result, this.i, this.i + result.length - 1);
  }

  WS() {
    while (isWhitespace(this.c)) {
      this.consume();
    }
  }
}