import Visitor from './lib/visitor.js';

export default class MyVisitor extends Visitor {

	visitValue(ctx) {
		if (ctx.obj()) {
			return this.visitObj(ctx.obj());
		} else if (ctx.arr()) {
			return this.visitArr(ctx.arr());
		} else if (ctx.STRING()) {
			return ctx.STRING().getText();
		} else if (ctx.NUMBER()) {
			return parseFloat(ctx.NUMBER().getText())
		} else if (ctx.getText() === 'true') {
			return true;
		} else if (ctx.getText() === 'false') {
			return false;
		} else if (ctx.getText() === 'null') {
			return null;
		}
	}

	visitObj(ctx) {
		const obj = {};
		const length = ctx.STRING().length;
		for (let i = 0; i < length; i++) {
			const key = ctx.STRING()[i].getText()
			const value = this.visitValue(ctx.value()[i]);
			obj[key] = value;
		}
		return obj;
	}

	visitArr(ctx) {
		const arr = [];
		for (let i = 0; i < ctx.value().length; i++) {
			arr.push(this.visitValue(ctx.value(i)));
		}
		return arr;
	}
}

