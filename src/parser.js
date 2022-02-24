import { TerminalNodeImpl, ObjContext, ArrContext, ValueContext } from './context.js'

class Parser {
  constructor(lexer) {
    this._ctx = null; // 当前解析的上下文
    this.lexer = lexer; // 词法解析器实例
    this.markers = []; // 栈，用于记录二义性解析选项的词法单元位置
    this.lookahead = []; // lookahead 词法单元缓冲区
    this.p = 0; // 当前 lookahead 词法单元的（在缓冲区中的）索引
  }

  // 返回 p + i - 1 位置的词法单元
  LT(i) {
    this.sync(i);
    return this.lookahead[this.p + i - 1];
  }

  // 获取 LT 词法单元的类型
  LA(i) {
    return this.LT(i).type;
  }

  // 获取 LT 词法单元的文本
  LN(i) {
    return this.lexer.getTokenName(this.LA(i));
  }

  // 确保 p 往后 i - 1 位置在缓冲区中，如果不在，则填充词法单元
  sync(i) {
    const length = this.p + i - 1;
    if (length > this.lookahead.length - 1) {
      const n = length - (this.lookahead.length - 1);
      this.fill(n);
    }
  }

  // 向缓冲区填充 n 个词法单元
  fill(n) {
    for (let i = 0; i < n; i++) {
      this.lookahead.push(this.lexer.nextToken());
    }
  }

  // 匹配当前词法单元的类型为 x，如果匹配成功，则消耗该词法单元，否则抛出异常
  match(x) {
    if (this.LA(1) === x) {
      this.consume();
    } else {
      throw new Error(`Unexpected token ${this.LN(1)} in JSON at position ${this.LT(1).start}`);
    }
  }

  // 消耗当前词法单元
  consume() {
    if (!this.isSpeculating()) {
      const ctx = new TerminalNodeImpl(this.LT(1));
      this._ctx.addChild(ctx);
      ctx.parentCtx = this._ctx;
    }
    this.p++;
    // 如果处于非推断状态，且到达 lookahead 缓冲区的末尾，则：
    if (this.p === this.lookahead.length && !this.isSpeculating()) {
      this.p = 0; //重新从 0 开始填入新的词法单元
      this.lookahead = []; // 清空缓冲区
    }
    this.sync(1); // 填充一个词法单元
  }

  // 判断是否正处于推断二义性解析选项的状态
  isSpeculating() {
    return this.markers.length > 0;
  }

  // 将二义性解析选项的位置记录到栈中
  mark() {
    this.markers.push(this.p);
    return this.p;
  }

  // 将 p 移动到指定位置
  seek(marker) {
    this.p = marker;
  }

  // marker 出栈，将 p 移动到上一个二义性解析选项的位置
  release() {
    const marker = this.markers[this.markers.length - 1];
    this.markers.pop();
    this.seek(marker)
  }

  // 如果处于非推断模式，进入一个新的 rule 上下文
  enterRule(localctx) {
    if (this.isSpeculating()) return;
    if (this._ctx !== null) {
      this._ctx.addChild(localctx);
      localctx.parentCtx = this._ctx;
    }
    this._ctx = localctx;
  }

  // 如果处于非推断模式，退出当前规则上下文
  exitRule() {
    if (this.isSpeculating()) return;
    this._ctx = this._ctx.parentCtx;
  }
}

export default class JSONParser extends Parser {
  constructor(lexer) {
    super(lexer)
  }

  speculate_helper(speculate) {
    // 二义性解析选项的位标需要被记录下来，以便在回溯时进行恢复
    return () => {
      let success = true;
      let error = null
      this.mark();
      try {
        speculate();
      } catch (e) {
        success = false;
        error = e;
      } finally {
        this.release();
      }
      // 返回推断结果，推断过程的错误，推断过程中成功消耗的词法单元数量
      return [success, error, this.p];
    }
  }

  obj() {
    const localctx = new ObjContext(this._ctx);
    this.enterRule(localctx);
    const speculate_obj_alt1 = this.speculate_helper(this.obj_alt1.bind(this));
    const speculate_obj_alt2 = this.speculate_helper(this.obj_alt2.bind(this));
    const [success1, e1, p1] = speculate_obj_alt1();
    const [success2, e2, p2] = speculate_obj_alt2();
    if (success1) {
      this.obj_alt1();
    } else if (success2) {
      this.obj_alt2();
    } else {
      throw p1 > p2 ? e1 : e2;
    }
    this.exitRule();
    return localctx
  }

  obj_alt1() {
    this.match(1);
    this.match(4);
  }

  obj_alt2() {
    this.match(1); this.match(10); this.match(2); this.value();
    while (this.LA(1) === 3) {
      this.match(3); this.match(10); this.match(2); this.value();
    }
    this.match(4);
  }

  arr() {
    const localctx = new ArrContext(this._ctx);
    this.enterRule(localctx);
    this.match(5); this.value();
    while (this.LA(1) === 3) {
      this.match(3); this.value();
    }
    this.match(6);
    this.exitRule();
    return localctx;
  }

  value() {
    const localctx = new ValueContext(this._ctx);
    this.enterRule(localctx);
    switch (this.LA(1)) {
      case 1: this.obj(); break;
      case 5: this.arr(); break;
      case 7: this.match(7); break;
      case 8: this.match(8); break;
      case 9: this.match(9); break;
      case 10: this.match(10); break;
      case 11: this.match(11); break;
      default: throw new Error(`Unexpected token ${this.LN(1)} in JSON at position ${this.LT(1).start}`);
    }
    this.exitRule();
    return localctx;
  }
}