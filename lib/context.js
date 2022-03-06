class RuleContext {
  constructor(parent) {
    this.parentCtx = parent;
    this.children = null;
  }

  getText() {
    if (this.getChildCount() === 0) {
      return '';
    } else {
      return this.children.map(child => child.getText()).join('');
    }
  }

  getChildCount() {
    if (this.children === null) {
      return 0;
    } else {
      return this.children.length;
    }
  }

  addChild(child) {
    if (this.children === null) {
      this.children = [];
    }
    this.children.push(child);
    return child;
  }

  removeLastChild() {
    if (this.children !== null) {
      this.children.pop();
    }
  }
}
const return_helper = (res, i) => {
  if (i !== undefined) {
    return res[i] || null
  }
  return res
}

export class ObjContext extends RuleContext {
  constructor(parent) {
    super(parent);
    this.ruleIndex = 1;
  }

  // accept 方法被重写，调用访问者具体的 visitXxx 方法
  accept(visitor) {
    if (visitor) {
      return visitor.visitObj(this);
    } else {
      return visitor.visitChildren(this);
    }
  }

  // 对于 ObjContext，允许有多个 STRING 词法单元
  STRING(i) {
    return return_helper(this.children.filter(child => child.symbol && child.symbol.type === 10), i);
  }

  value(i) {
    return return_helper(this.children.filter(child => child instanceof ValueContext), i);
  }
}

export class ArrContext extends RuleContext {
  constructor(parent) {
    super(parent);
    this.ruleIndex = 2;
  }
  accept(visitor) {
    if (visitor) {
      return visitor.visitArr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }

  value(i) {
    return return_helper(this.children.filter(child => child instanceof ValueContext), i);
  }
}

export class ValueContext extends RuleContext {
  constructor(parent) {
    super(parent);
    this.ruleIndex = 3;
  }
  accept(visitor) {
    if (visitor) {
      return visitor.visitValue(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
  obj() {
    return this.children[0] instanceof ObjContext ? this.children[0] : null
  }

  arr() {
    return this.children[0] instanceof ArrContext ? this.children[0] : null
  }

  value() {
    return this.children[0] instanceof ValueContext ? this.children[0] : null
  }

  // 对于 ValueContext，有且只允许有一个 STRING 词法单元
  STRING() {
    return this.children[0].symbol.type === 10 ? this.children[0] : null
  }

  NUMBER() {
    return this.children[0].symbol.type === 11 ? this.children[0] : null
  }
}

export class TerminalNodeImpl {
  constructor(symbol) {
    this.symbol = symbol;
  }

  getText() {
    return this.symbol.text;
  }
}