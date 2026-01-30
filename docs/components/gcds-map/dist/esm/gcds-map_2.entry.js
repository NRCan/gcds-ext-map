import { l as leafletSrcExports, d as requireLeafletSrc, U as Util, r as registerInstance, a as getElement, e as localeFr, i as locale, M as MapFeatureLayer } from './index-PZrWUcjo.js';
import { g as getDefaultExportFromCjs } from './_commonjsHelpers-B85MJLTf.js';
import { M as MapTileLayer } from './MapTileLayer-dNMHgVBV.js';
import { r as renderStyles } from './renderStyles-EYVT9Efh.js';

// Export the class directly as DOMTokenList for easy use
class CustomDOMTokenList {
    // Private properties using TypeScript private fields
    element;
    valueSet;
    attribute;
    domain;
    domtokenlist;
    constructor(initialValue, element, attribute, domain) {
        // create donor/host div to extract DomTokenList from
        const hostingElement = document.createElement('div');
        this.domtokenlist = hostingElement.classList;
        // to check if value is being set, protects from infinite recursion
        // from attributeChangedCallback of mapml-viewer and web-map
        this.valueSet = false;
        this.domtokenlist.value = initialValue ?? '';
        this.element = element;
        this.attribute = attribute;
        this.domain = domain;
    }
    get isValueSet() {
        return this.valueSet;
    }
    get length() {
        return this.domtokenlist.length;
    }
    get value() {
        return this.domtokenlist.value;
    }
    set value(val) {
        if (val === null) {
            // when attribute is being removed
            this.domtokenlist.value = '';
        }
        else {
            this.domtokenlist.value = val.toLowerCase();
            this.valueSet = true;
            this.element.setAttribute(this.attribute, this.domtokenlist.value);
            this.valueSet = false;
        }
    }
    item(index) {
        return this.domtokenlist.item(index);
    }
    contains(token) {
        return this.domtokenlist.contains(token);
    }
    // Modified default behavior
    add(token) {
        this.domtokenlist.add(token);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
    }
    // Modified default behavior
    remove(token) {
        this.domtokenlist.remove(token);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
    }
    // Modified default behavior
    replace(oldToken, newToken) {
        const result = this.domtokenlist.replace(oldToken, newToken);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
        return result;
    }
    // Modified default behavior
    supports(token) {
        return this.domain.includes(token);
    }
    // Modified default behavior
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
    toggle(token, force) {
        const result = this.domtokenlist.toggle(token, force);
        this.element.setAttribute(this.attribute, this.domtokenlist.value);
        return result;
    }
    entries() {
        const tokenList = this.domtokenlist;
        return tokenList.entries ? tokenList.entries() : this._manualEntries();
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/forEach
    forEach(callback, thisArg) {
        if (this.domtokenlist.forEach) {
            this.domtokenlist.forEach((value, key) => callback.call(thisArg, value, key, this));
        }
        else {
            for (let i = 0; i < this.domtokenlist.length; i++) {
                callback.call(thisArg, this.domtokenlist[i], i, this);
            }
        }
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/keys
    keys() {
        const tokenList = this.domtokenlist;
        return tokenList.keys ? tokenList.keys() : this._manualKeys();
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/values
    values() {
        const tokenList = this.domtokenlist;
        return tokenList.values ? tokenList.values() : this._manualValues();
    }
    // Make it iterable
    [Symbol.iterator]() {
        return this.values();
    }
    // Fallback implementations for older browsers
    *_manualEntries() {
        for (let i = 0; i < this.domtokenlist.length; i++) {
            yield [i, this.domtokenlist[i]];
        }
    }
    *_manualKeys() {
        for (let i = 0; i < this.domtokenlist.length; i++) {
            yield i;
        }
    }
    *_manualValues() {
        for (let i = 0; i < this.domtokenlist.length; i++) {
            yield this.domtokenlist[i];
        }
    }
}

const t$3 = '<'.codePointAt(0),
	n$2 = '>'.codePointAt(0),
	e$3 = '='.codePointAt(0),
	i$2 = '/'.codePointAt(0),
	a$2 = (n, i = 0) => {
		const a = n.at(i);
		if ('delim' === (null == a ? void 0 : a._t) && a.value === t$3) {
			const t = n.at(i + 1),
				a = 'delim' === (null == t ? void 0 : t._t) && t.value === e$3 && !t.isAfterSpace;
			return {t: {t: 'lt', isIncl: a}, i: i + (a ? 2 : 1)}
		}
	},
	o$2 = (t, i = 0) => {
		const a = t.at(i);
		if ('delim' === (null == a ? void 0 : a._t) && a.value === n$2) {
			const n = t.at(i + 1),
				a = 'delim' === (null == n ? void 0 : n._t) && n.value === e$3 && !n.isAfterSpace;
			return {t: {t: 'gt', isIncl: a}, i: i + (a ? 2 : 1)}
		}
	},
	r$2 = (t, n = 0) => {
		var i, r;
		return null !== (r = null !== (i = a$2(t, n)) && void 0 !== i ? i : o$2(t, n)) && void 0 !== r
			? r
			: ((t, n = 0) => {
					const i = t.at(n);
					if ('delim' === (null == i ? void 0 : i._t) && i.value === e$3)
						return {t: {t: 'eq'}, i: n + 1}
				})(t, n)
	},
	s$2 = (t, n = 0) => {
		const e = ((t, n = 0) => {
			const e = t.at(n);
			if ('number' === (null == e ? void 0 : e._t) && e.value >= 0) {
				const a = t.at(n + 1);
				if ('delim' === (null == a ? void 0 : a._t) && a.value === i$2) {
					const i = t.at(n + 2);
					if ('number' === (null == i ? void 0 : i._t) && i.value >= 0)
						return {
							t: {_t: 'ratio', left: e.value, right: i.value, start: e.start, end: i.end},
							i: n + 3
						}
				}
			}
		})(t, n);
		if (e) return e
		const a = t.at(n);
		if (a && ('number' === a._t || 'dimension' === a._t)) {
			return {
				t:
					'number' === a._t
						? {_t: 'number', value: a.value, flag: a.flag, start: a.start, end: a.end}
						: {_t: 'dimension', value: a.value, unit: a.unit, start: a.start, end: a.end},
				i: n + 1
			}
		}
	},
	c = (t, n = 0) => {
		const e = s$2(t, n);
		if (e) return e
		const i = t.at(n);
		return 'ident' === (null == i ? void 0 : i._t)
			? {t: {_t: 'ident', value: i.value, start: i.start, end: i.end}, i: n + 1}
			: void 0
	};
const matchPlain = (t, n = 0) => {
	const e = t.at(n);
	if ('ident' === (null == e ? void 0 : e._t)) {
		const i = t.at(n + 1);
		if ('colon' === (null == i ? void 0 : i._t)) {
			const i = c(t, n + 2);
			if (i)
				return {
					t: {
						_t: 'feature',
						context: 'value',
						feature: e.value,
						value: i.t,
						start: e.start,
						end: i.t.end
					},
					i: i.i
				}
		}
	}
};
const matchBoolean = (t, n = 0) => {
	const e = t.at(n);
	if ('ident' === (null == e ? void 0 : e._t))
		return {
			t: {_t: 'feature', context: 'boolean', feature: e.value, start: e.start, end: e.end},
			i: n + 1
		}
};
const matchFeature = (t, n = 0) => {
	var e, i;
	const s = t.at(n);
	if ('(' === (null == s ? void 0 : s._t)) {
		const s =
			null !==
				(i =
					null !== (e = matchPlain(t, n + 1)) && void 0 !== e
						? e
						: ((t, n = 0) => {
								var e;
								const i = c(t, n);
								if (i) {
									const n = r$2(t, i.i);
									if (n) {
										const r = c(t, n.i);
										if (r) {
											const s = null !== (e = a$2(t, r.i)) && void 0 !== e ? e : o$2(t, r.i);
											if (s) {
												const e = c(t, s.i);
												if (e && 'ident' === r.t._t && 'ident' !== i.t._t && 'ident' !== e.t._t) {
													if ('lt' === n.t.t && 'lt' === s.t.t)
														return {
															t: {
																_t: 'feature',
																context: 'range',
																ops: 2,
																feature: r.t.value,
																minValue: i.t,
																minOp: n.t.isIncl ? '<=' : '<',
																maxOp: s.t.isIncl ? '<=' : '<',
																maxValue: e.t,
																start: i.t.start,
																end: e.t.end
															},
															i: e.i
														}
													if ('gt' === n.t.t && 'gt' === s.t.t)
														return {
															t: {
																_t: 'feature',
																context: 'range',
																ops: 2,
																feature: r.t.value,
																minValue: e.t,
																minOp: s.t.isIncl ? '<=' : '<',
																maxOp: n.t.isIncl ? '<=' : '<',
																maxValue: i.t,
																start: i.t.start,
																end: e.t.end
															},
															i: e.i
														}
												}
											}
											let u = '=';
											if (
												('lt' === n.t.t
													? (u = n.t.isIncl ? '<=' : '<')
													: 'gt' === n.t.t && (u = n.t.isIncl ? '>=' : '>'),
												'ident' === i.t._t && 'ident' !== r.t._t)
											)
												return {
													t: {
														_t: 'feature',
														context: 'range',
														feature: i.t.value,
														ops: 1,
														op: u,
														value: r.t,
														start: i.t.start,
														end: r.t.end
													},
													i: r.i
												}
											if ('ident' === r.t._t && 'ident' !== i.t._t) {
												let t = '=';
												return (
													'<' === u
														? (t = '>')
														: '<=' === u
															? (t = '>=')
															: '>' === u
																? (t = '<')
																: '>=' === u && (t = '<='),
													{
														t: {
															_t: 'feature',
															context: 'range',
															feature: r.t.value,
															ops: 1,
															op: t,
															value: i.t,
															start: i.t.start,
															end: r.t.end
														},
														i: r.i
													}
												)
											}
										}
									}
								}
							})(t, n + 1)) && void 0 !== i
				? i
				: matchBoolean(t, n + 1);
		if (s) {
			const n = t.at(s.i);
			if (')' === (null == n ? void 0 : n._t)) return {t: s.t, i: s.i + 1}
		}
	}
};
const matchGeneralEnclosed = (t, n = 0) => {
	var e;
	const i = t.at(n);
	if (i && ('function' === i._t || '(' === i._t)) {
		const a = ['('];
		let o = n + 1,
			r = t.at(o);
		t: for (; r; ) {
			switch (r._t) {
				case 'function':
				case '(':
					a.push('(');
					break
				case '{':
				case '[':
					a.push(r._t);
					break
				case ')':
					if (('(' === a.at(-1) && a.pop(), 0 === a.length)) break t
					break
				case ']':
					'[' === a.at(-1) && a.pop();
					break
				case '}':
					'{' === a.at(-1) && a.pop();
			}
			r = t.at(++o);
		}
		if (0 === a.length)
			return {
				t: {
					_t: 'general-enclosed',
					tokens: t.slice(n, o),
					start: i.start,
					end: (null !== (e = t.at(o)) && void 0 !== e ? e : t[o - 1]).end
				},
				i: o
			}
	}
};
const matchInParens = (t, n = 0) => {
	const e = matchFeature(t, n);
	if (e) return {t: {_t: 'in-parens', node: e.t}, i: e.i}
	const i = t.at(n);
	if ('(' === (null == i ? void 0 : i._t)) {
		const e = matchCondition(t, n + 1);
		if (e) {
			const n = t.at(e.i);
			if (')' === (null == n ? void 0 : n._t)) return {t: {_t: 'in-parens', node: e.t}, i: e.i + 1}
		}
	}
	const a = matchGeneralEnclosed(t, n);
	return a ? {t: {_t: 'in-parens', node: a.t}, i: a.i} : void 0
};
const matchOr = (t, n = 0) => {
	const e = t.at(n);
	if ('ident' === (null == e ? void 0 : e._t) && 'or' === e.value) {
		const e = matchInParens(t, n + 1);
		if (e) return {t: e.t, i: e.i}
	}
};
const matchAnd = (t, n = 0) => {
	const e = t.at(n);
	if ('ident' === (null == e ? void 0 : e._t) && 'and' === e.value) {
		const e = matchInParens(t, n + 1);
		if (e) return {t: e.t, i: e.i}
	}
};
const matchNot = (t, n = 0) => {
	const e = t.at(n);
	if ('ident' === (null == e ? void 0 : e._t) && 'not' === e.value) {
		const e = matchInParens(t, n + 1);
		if (e) return {t: e.t, i: e.i}
	}
};
const matchCondition = (t, n = 0) => {
	const e = matchNot(t, n);
	if (e)
		return {
			t: {_t: 'condition', op: 'not', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
			i: e.i
		}
	{
		const e = matchInParens(t, n);
		if (e) {
			const i = matchAnd(t, e.i);
			if (i) {
				const a = [i.t];
				let o = i.i,
					r = matchAnd(t, i.i);
				for (; r; ) a.push(r.t), (o = r.i), (r = matchAnd(t, r.i));
				return {
					t: {_t: 'condition', op: 'and', nodes: [e.t, ...a], start: t[n].start, end: t[o - 1].end},
					i: o
				}
			}
			const a = matchOr(t, e.i);
			if (a) {
				const i = [a.t];
				let o = a.i,
					r = matchOr(t, a.i);
				for (; r; ) i.push(r.t), (o = r.i), (r = matchOr(t, r.i));
				return {
					t: {_t: 'condition', op: 'or', nodes: [e.t, ...i], start: t[n].start, end: t[o - 1].end},
					i: o
				}
			}
			return {
				t: {_t: 'condition', op: 'and', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
				i: e.i
			}
		}
	}
};
const matchConditionWithoutOr = (t, n = 0) => {
	const e = matchNot(t, n);
	if (e)
		return {
			t: {_t: 'condition', op: 'not', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
			i: e.i
		}
	{
		const e = matchInParens(t, n);
		if (e) {
			const i = matchAnd(t, e.i);
			if (i) {
				const a = [i.t];
				let o = i.i,
					r = matchAnd(t, i.i);
				for (; r; ) a.push(r.t), (o = r.i), (r = matchAnd(t, r.i));
				return {
					t: {_t: 'condition', op: 'and', nodes: [e.t, ...a], start: t[n].start, end: t[o - 1].end},
					i: o
				}
			}
			return {
				t: {_t: 'condition', op: 'and', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
				i: e.i
			}
		}
	}
};
const matchQuery = t => {
	const n = matchCondition(t, 0);
	if (n) return {t: {_t: 'query', condition: n.t, start: 0, end: t[n.i - 1].end}, i: n.i}
	{
		const n = t.at(0);
		if ('ident' === (null == n ? void 0 : n._t)) {
			if ('not' === n.value || 'only' === n.value) {
				const e = t.at(1);
				if ('ident' === (null == e ? void 0 : e._t)) {
					const i = t.at(2);
					if ('ident' === (null == i ? void 0 : i._t) && 'and' === i.value) {
						const i = matchConditionWithoutOr(t, 3);
						if (i)
							return {
								t: {
									_t: 'query',
									condition: i.t,
									type: e.value,
									prefix: n.value,
									start: 0,
									end: t[i.i - 1].end
								},
								i: i.i
							}
					}
					return {t: {_t: 'query', type: e.value, prefix: n.value, start: 0, end: e.end}, i: 2}
				}
			}
			const e = t.at(1);
			if ('ident' === (null == e ? void 0 : e._t) && 'and' === e.value) {
				const e = matchConditionWithoutOr(t, 2);
				if (e)
					return {
						t: {_t: 'query', condition: e.t, type: n.value, start: 0, end: t[e.i - 1].end},
						i: e.i
					}
			}
			return {t: {_t: 'query', type: n.value, start: 0, end: n.end}, i: 1}
		}
	}
};
const matchQueryList = t => {
	const n = splitMediaQueryList(t);
	if (1 === n.length && 0 === n[0].length)
		return {_t: 'query-list', nodes: [{_t: 'query', type: 'all', start: 0, end: 0}]}
	{
		const t = [];
		for (const e of n) {
			const n = matchQuery(e);
			n && n.i === e.length ? t.push(n.t) : t.push(void 0);
		}
		return {_t: 'query-list', nodes: t}
	}
};
const splitMediaQueryList = t => {
	const n = [[]],
		e = [];
	for (const i of t)
		if ('comma' === i._t && 0 === e.length) n.push([]);
		else {
			switch (i._t) {
				case 'function':
				case '(':
					e.push(')');
					break
				case '[':
					e.push(']');
					break
				case '{':
					e.push('}');
					break
				case ')':
				case ']':
				case '}':
					e.at(-1) === i._t && e.pop();
					break
			}
			n[n.length - 1].push(i);
		}
	return n
};

const isParserError = r => 'object' == typeof r && null !== r && '_errid' in r;

let e$2;
const readCodepoints = s => {
	const t = (() => {
			let s;
			return e$2 ? (s = e$2) : ((s = new TextEncoder()), (e$2 = s)), s
		})().encode(s),
		r = [],
		a = t.length;
	for (let e = 0; e < a; e += 1) {
		const s = t.at(e);
		if (s < 128)
			switch (s) {
				case 0:
					r.push(65533);
					break
				case 12:
					r.push(10);
					break
				case 13:
					r.push(10), 10 === t.at(e + 1) && (e += 1);
					break
				default:
					r.push(s);
			}
		else
			s < 224
				? r.push(((s << 59) >>> 53) | ((t[++e] << 58) >>> 58))
				: s < 240
					? r.push(((s << 60) >>> 48) | ((t[++e] << 58) >>> 52) | ((t[++e] << 58) >>> 58))
					: r.push(
							((s << 61) >>> 43) |
								((t[++e] << 58) >>> 46) |
								((t[++e] << 58) >>> 52) |
								((t[++e] << 58) >>> 58)
						);
	}
	return r
};

const convertToParserTokens = e => {
	const r = [];
	let t = false;
	for (const s of e)
		switch (s._t) {
			case '{':
				return {_errid: 'NO_LCURLY', start: s.start, end: s.end}
			case 'semicolon':
				return {_errid: 'NO_SEMICOLON', start: s.start, end: s.end}
			case 'whitespace':
				t = true;
				break
			case 'EOF':
				break
			default:
				r.push({...s, isAfterSpace: t}), (t = false);
		}
	return r
};

const t$2 = 10,
	e$1 = 32,
	n$1 = 45,
	s$1 = 48,
	u$1 = 57,
	r$1 = 65,
	o$1 = 92,
	l$1 = 97,
	i$1 = 122,
	a$1 = 128;
const codepointsToTokens = (f, c = 0) => {
	const d = [];
	for (; c < f.length; c += 1) {
		const h = f.at(c),
			p = c;
		if (47 === h && 42 === f.at(c + 1)) {
			c += 2;
			for (let t = f.at(c); void 0 !== t; t = f.at(++c))
				if (42 === t && 47 === f.at(c + 1)) {
					c += 1;
					break
				}
		} else if (9 === h || h === e$1 || h === t$2) {
			let n = f.at(++c);
			for (; 9 === n || n === e$1 || n === t$2; ) n = f.at(++c);
			c -= 1;
			const s = d.at(-1);
			'whitespace' === (null == s ? void 0 : s._t)
				? (d.pop(), d.push({_t: 'whitespace', start: s.start, end: c}))
				: d.push({_t: 'whitespace', start: p, end: c});
		} else if (34 === h) {
			const t = consumeString(f, c);
			if (null === t) return {_errid: 'INVALID_STRING', start: c, end: c}
			const [e, n] = t
			;(c = e), d.push({_t: 'string', value: n, start: p, end: c});
		} else if (35 === h) {
			if (c + 1 < f.length) {
				const e = f.at(c + 1);
				if (
					95 === e ||
					(e >= r$1 && e <= 90) ||
					(e >= l$1 && e <= i$1) ||
					e >= a$1 ||
					(e >= s$1 && e <= u$1) ||
					(e === o$1 && c + 2 < f.length && f.at(c + 2) !== t$2)
				) {
					const t = wouldStartIdentifier(f, c + 1) ? 'id' : 'unrestricted',
						e = consumeIdentUnsafe(f, c + 1);
					if (null !== e) {
						const [n, s] = e
						;(c = n), d.push({_t: 'hash', value: s.toLowerCase(), flag: t, start: p, end: c});
						continue
					}
				}
			}
			d.push({_t: 'delim', value: h, start: p, end: c});
		} else if (39 === h) {
			const t = consumeString(f, c);
			if (null === t) return {_errid: 'INVALID_STRING', start: c, end: c}
			const [e, n] = t
			;(c = e), d.push({_t: 'string', value: n, start: p, end: c});
		} else if (40 === h) d.push({_t: '(', start: p, end: c});
		else if (41 === h) d.push({_t: ')', start: p, end: c});
		else if (43 === h) {
			const t = consumeNumeric(f, c);
			if (null === t) d.push({_t: 'delim', value: h, start: p, end: c});
			else {
				const [e, n] = t
				;(c = e),
					'dimension' === n[0]
						? d.push({
								_t: 'dimension',
								value: n[1],
								unit: n[2].toLowerCase(),
								flag: 'number',
								start: p,
								end: c
							})
						: 'number' === n[0]
							? d.push({_t: n[0], value: n[1], flag: n[2], start: p, end: c})
							: d.push({_t: n[0], value: n[1], flag: 'number', start: p, end: c});
			}
		} else if (44 === h) d.push({_t: 'comma', start: p, end: c});
		else if (h === n$1) {
			const t = consumeNumeric(f, c);
			if (null !== t) {
				const [e, n] = t
				;(c = e),
					'dimension' === n[0]
						? d.push({
								_t: 'dimension',
								value: n[1],
								unit: n[2].toLowerCase(),
								flag: 'number',
								start: p,
								end: c
							})
						: 'number' === n[0]
							? d.push({_t: n[0], value: n[1], flag: n[2], start: p, end: c})
							: d.push({_t: n[0], value: n[1], flag: 'number', start: p, end: c});
				continue
			}
			if (c + 2 < f.length) {
				const t = f.at(c + 1),
					e = f.at(c + 2);
				if (t === n$1 && 62 === e) {
(c += 2), d.push({_t: 'CDC', start: p, end: c});
					continue
				}
			}
			const e = consumeIdentLike(f, c);
			if (null !== e) {
				const [t, n, s] = e
				;(c = t), d.push({_t: s, value: n, start: p, end: c});
				continue
			}
			d.push({_t: 'delim', value: h, start: p, end: c});
		} else if (46 === h) {
			const t = consumeNumeric(f, c);
			if (null !== t) {
				const [e, n] = t
				;(c = e),
					'dimension' === n[0]
						? d.push({
								_t: 'dimension',
								value: n[1],
								unit: n[2].toLowerCase(),
								flag: 'number',
								start: p,
								end: c
							})
						: 'number' === n[0]
							? d.push({_t: n[0], value: n[1], flag: n[2], start: p, end: c})
							: d.push({_t: n[0], value: n[1], flag: 'number', start: p, end: c});
				continue
			}
			d.push({_t: 'delim', value: h, start: p, end: c});
		} else if (58 === h) d.push({_t: 'colon', start: p, end: c});
		else if (59 === h) d.push({_t: 'semicolon', start: p, end: c});
		else if (60 === h) {
			if (c + 3 < f.length) {
				const t = f.at(c + 1),
					e = f.at(c + 2),
					s = f.at(c + 3);
				if (33 === t && e === n$1 && s === n$1) {
(c += 3), d.push({_t: 'CDO', start: p, end: c});
					continue
				}
			}
			d.push({_t: 'delim', value: h, start: p, end: c});
		} else if (64 === h) {
			const t = consumeIdent(f, c + 1);
			if (null !== t) {
				const [e, n] = t
				;(c = e), d.push({_t: 'at-keyword', value: n.toLowerCase(), start: p, end: c});
				continue
			}
			d.push({_t: 'delim', value: h, start: p, end: c});
		} else if (91 === h) d.push({_t: '[', start: p, end: c});
		else if (93 === h) d.push({_t: ']', start: p, end: c});
		else if (123 === h) d.push({_t: '{', start: p, end: c});
		else if (125 === h) d.push({_t: '}', start: p, end: c});
		else if (h >= s$1 && h <= u$1) {
			const t = consumeNumeric(f, c),
				[e, n] = t
			;(c = e),
				'dimension' === n[0]
					? d.push({
							_t: 'dimension',
							value: n[1],
							unit: n[2].toLowerCase(),
							flag: 'number',
							start: p,
							end: c
						})
					: 'number' === n[0]
						? d.push({_t: n[0], value: n[1], flag: n[2], start: p, end: c})
						: d.push({_t: n[0], value: n[1], flag: 'number', start: p, end: c});
		} else if (95 === h || (h >= r$1 && h <= 90) || (h >= l$1 && h <= i$1) || h >= a$1 || h === o$1) {
			const t = consumeIdentLike(f, c);
			if (null === t) d.push({_t: 'delim', value: h, start: p, end: c});
			else {
				const [e, n, s] = t
				;(c = e), d.push({_t: s, value: n, start: p, end: c});
			}
		} else d.push({_t: 'delim', value: h, start: p, end: c});
	}
	return d.push({_t: 'EOF', start: c, end: c}), d
};
const consumeString = (e, n) => {
	if (e.length <= n + 1) return null
	const s = e.at(n),
		u = [];
	for (let r = n + 1; r < e.length; r += 1) {
		const n = e.at(r);
		if (n === s) return [r, String.fromCodePoint(...u)]
		if (n === o$1) {
			const t = consumeEscape(e, r);
			if (null === t) return null
			const [n, s] = t;
			u.push(s), (r = n);
		} else {
			if (n === t$2) return null
			u.push(n);
		}
	}
	return null
};
const wouldStartIdentifier = (e, s) => {
	const u = e.at(s);
	if (void 0 === u) return false
	if (u === n$1) {
		const u = e.at(s + 1);
		if (void 0 === u) return false
		if (u === n$1 || 95 === u || (u >= r$1 && u <= 90) || (u >= l$1 && u <= i$1) || u >= a$1) return true
		if (u === o$1) {
			if (e.length <= s + 2) return false
			return e.at(s + 2) !== t$2
		}
		return false
	}
	if (95 === u || (u >= r$1 && u <= 90) || (u >= l$1 && u <= i$1) || u >= a$1) return true
	if (u === o$1) {
		if (e.length <= s + 1) return false
		return e.at(s + 1) !== t$2
	}
	return false
};
const consumeEscape = (n, i) => {
	if (n.length <= i + 1) return null
	if (n.at(i) !== o$1) return null
	const a = n.at(i + 1);
	if (a === t$2) return null
	if ((a >= s$1 && a <= u$1) || (a >= r$1 && a <= 70) || (a >= l$1 && a <= 102)) {
		const o = [a],
			f = Math.min(i + 7, n.length);
		let c = i + 2;
		for (; c < f; c += 1) {
			const t = n.at(c);
			if (!((t >= s$1 && t <= u$1) || (t >= r$1 && t <= 70) || (t >= l$1 && t <= 102))) break
			o.push(t);
		}
		if (c < n.length) {
			const s = n.at(c)
			;(9 !== s && s !== e$1 && s !== t$2) || (c += 1);
		}
		return [c - 1, Number.parseInt(String.fromCodePoint(...o), 16)]
	}
	return [i + 1, a]
};
const consumeNumeric = (t, e) => {
	const n = consumeNumber(t, e);
	if (null === n) return null
	const [s, u, r] = n,
		o = consumeIdent(t, s + 1);
	if (null !== o) {
		const [t, e] = o;
		return [t, ['dimension', u, e]]
	}
	return s + 1 < t.length && 37 === t.at(s + 1) ? [s + 1, ['percentage', u]] : [s, ['number', u, r]]
};
const consumeNumber = (t, e) => {
	const r = t.at(e);
	if (void 0 === r) return null
	let o = 'integer';
	const l = [];
	for ((43 !== r && r !== n$1) || ((e += 1), r === n$1 && l.push(n$1)); e < t.length; ) {
		const n = t.at(e);
		if (!(n >= s$1 && n <= u$1)) break
		l.push(n), (e += 1);
	}
	if (e + 1 < t.length) {
		const n = t.at(e),
			r = t.at(e + 1);
		if (46 === n && r >= s$1 && r <= u$1)
			for (l.push(n, r), o = 'number', e += 2; e < t.length; ) {
				const n = t.at(e);
				if (!(n >= s$1 && n <= u$1)) break
				l.push(n), (e += 1);
			}
	}
	if (e + 1 < t.length) {
		const r = t.at(e),
			i = t.at(e + 1),
			a = t.at(e + 2);
		if (69 === r || 101 === r) {
			let r = false;
			if (
				(i >= s$1 && i <= u$1
					? (l.push(69, i), (e += 2), (r = true))
					: (i === n$1 || 43 === i) &&
						void 0 !== a &&
						a >= s$1 &&
						a <= u$1 &&
						(l.push(69), i === n$1 && l.push(n$1), l.push(a), (e += 3), (r = true)),
				r)
			)
				for (o = 'number'; e < t.length; ) {
					const n = t.at(e);
					if (!(n >= s$1 && n <= u$1)) break
					l.push(n), (e += 1);
				}
		}
	}
	const i = String.fromCodePoint(...l);
	let a = 'number' === o ? Number.parseFloat(i) : Number.parseInt(i);
	return 0 === a && (a = 0), Number.isNaN(a) ? null : [e - 1, a, o]
};
const consumeIdentUnsafe = (t, e) => {
	if (t.length <= e) return null
	const o = [];
	for (let f = t.at(e); e < t.length; f = t.at(++e)) {
		if (
			!(
				f === n$1 ||
				95 === f ||
				(f >= r$1 && f <= 90) ||
				(f >= l$1 && f <= i$1) ||
				f >= a$1 ||
				(f >= s$1 && f <= u$1)
			)
		) {
			{
				const n = consumeEscape(t, e);
				if (null !== n) {
					const [t, s] = n;
					o.push(s), (e = t);
					continue
				}
			}
			break
		}
		o.push(f);
	}
	return 0 === e ? null : [e - 1, String.fromCodePoint(...o)]
};
const consumeIdent = (t, e) => (wouldStartIdentifier(t, e) ? consumeIdentUnsafe(t, e) : null);
const consumeUrl = (n, s) => {
	let u = n.at(s);
	for (; 9 === u || u === e$1 || u === t$2; ) u = n.at(++s);
	const r = [];
	let l = false;
	for (; s < n.length; ) {
		if (41 === u) return [s, String.fromCodePoint(...r)]
		if (34 === u || 39 === u || 40 === u) return null
		if (9 === u || u === e$1 || u === t$2) !l && r.length > 0 && (l = true);
		else if (u === o$1) {
			const t = consumeEscape(n, s);
			if (null === t || l) return null
			const [e, u] = t;
			r.push(u), (s = e);
		} else {
			if (l) return null
			r.push(u);
		}
		u = n.at(++s);
	}
	return null
};
const consumeIdentLike = (n, s) => {
	const u = consumeIdent(n, s);
	if (null === u) return null
	const [r, o] = u;
	if ('url' === o.toLowerCase()) {
		if (n.length > r + 1) {
			if (40 === n.at(r + 1)) {
				for (let s = 2; r + s < n.length; s += 1) {
					const u = n.at(r + s);
					if (34 === u || 39 === u) return [r + 1, o.toLowerCase(), 'function']
					if (9 !== u && u !== e$1 && u !== t$2) {
						const t = consumeUrl(n, r + s);
						if (null === t) return null
						const [e, u] = t;
						return [e, u, 'url']
					}
				}
				return [r + 1, o.toLowerCase(), 'function']
			}
		}
	} else if (n.length > r + 1) {
		if (40 === n.at(r + 1)) return [r + 1, o.toLowerCase(), 'function']
	}
	return [r, o.toLowerCase(), 'ident']
};

const lexer = m => {
	const e = codepointsToTokens(readCodepoints(m));
	return isParserError(e) ? e : convertToParserTokens(e)
};

/**! media-query-parser | Tom Golden <oss@tom.bio> (https://tom.bio) | @license MIT  */
/*! v3.0.2 */
const parseMediaQueryList = t => {
	const r = lexer(t);
	return isParserError(r) ? r : matchQueryList(r)
};

const isValueInteger = t => 'number' === t._t && 'integer' === t.flag;
const isValueLength = t =>
	('dimension' === t._t && r(t.unit)) ||
	('number' === t._t && 'integer' === t.flag && 0 === t.value);
const isValueResolution = t => 'dimension' === t._t && o(t.unit);
const isValueRatio = t => 'ratio' === t._t || (isValueInteger(t) && t.value >= 0);
const t$1 = new Set(['cm', 'mm', 'q', 'in', 'pc', 'pt', 'px']),
	e = e => t$1.has(e.unit),
	n = new Set([
		...t$1,
		'em',
		'ex',
		'cap',
		'ch',
		'ic',
		'rem',
		'lh',
		'rlh',
		'vw',
		'vh',
		'vi',
		'vb',
		'vmin',
		'vmax',
		'svw',
		'svh',
		'svi',
		'svb',
		'svmin',
		'svmax',
		'lvw',
		'lvh',
		'lvi',
		'lvb',
		'lvmin',
		'lvmax',
		'dvw',
		'dvh',
		'dvi',
		'dvb',
		'dvmin',
		'dvmax',
		'cqw',
		'cqh',
		'cqi',
		'cqb',
		'cqmin',
		'cqmax'
	]),
	r = t => n.has(t);
const compareLength = (t, n) => {
	const r =
			'number' === t._t ? {_t: 'dimension', value: 0, unit: 'px'} : t,
		i = 'number' === n._t ? {_t: 'dimension', value: 0, unit: 'px'} : n;
	if (e(r)) {
		const t = u(r);
		if (e(i)) {
			const e = u(i);
			return t === e ? 'eq' : t > e ? 'gt' : 'lt'
		}
		return 0 === t && 0 === i.value ? 'eq' : 'unknown'
	}
	if (e(i)) {
		const t = compareLength(i, r);
		return 'lt' === t ? 'gt' : 'gt' === t ? 'lt' : t
	}
	return 0 === r.value && 0 === i.value ? 'eq' : 'unknown'
};
const i = new Map([
		['cm', 96 / 2.54],
		['mm', 96 / 25.4],
		['q', 96 / 101.6],
		['in', 96],
		['pc', 16],
		['pt', 96 / 72]
	]),
	u = t => {
		var e;
		return t.value * (null !== (e = i.get(t.unit)) && void 0 !== e ? e : 1)
	};
const compareRatio = (t, e) => {
	const n = 'number' === t._t ? t.value : t.left,
		r = 'number' === t._t ? 1 : t.right,
		i = 'number' === e._t ? e.value : e.left,
		u = 'number' === e._t ? 1 : e.right;
	if (0 === n && 0 === r) return 0 === i && 0 === u ? 'eq' : 'incomparable'
	if (0 === i && 0 === u) return 'incomparable'
	if (0 === n && 0 === i) return 'eq'
	if (0 === r && 0 === u) return 'eq'
	if (0 !== n && 0 !== i && 0 !== r && 0 !== u && n * u == i * r) return 'eq'
	const a = n / r,
		o = i / u;
	return a > o ? 'gt' : a < o ? 'lt' : 'eq'
};
const a = new Set(['dpi', 'dpcm', 'dppx', 'x']),
	o = t => a.has(t);
const compareResolution = (t, e) => {
	const n = l(t),
		r = l(e);
	return n === r ? 'eq' : n > r ? 'gt' : 'lt'
};
const s = new Map([
		['dpi', 96],
		['dpcm', 96 / 2.54],
		['dppx', 1]
	]),
	l = t => {
		var e;
		return t.value * (null !== (e = s.get(t.unit)) && void 0 !== e ? e : 1)
	};

const solveMediaFeature_ = (e, a) => {
	const t = e.feature.startsWith('min-'),
		c = e.feature.startsWith('max-');
	if ((t || c) && 'value' === e.context && 'ident' !== e.value._t)
		return solveMediaFeature_(
			{
				_t: 'feature',
				context: 'range',
				ops: 1,
				feature: e.feature.slice(4),
				op: t ? '>=' : '<=',
				value: e.value,
				start: e.start,
				end: e.end
			},
			a
		)
	{
		const t = a.features.get(e.feature);
		if (t) {
			if ('boolean' === e.context) {
				return ('discrete' === t.type && (t.values.has('none') || t.values.has(0))) ||
					('range' === t.type && ('ratio' === t.valueType ? t.canNumeratorBeZero : t.canBeZero))
					? a.solveUnknownFeature(e)
					: 'true'
			}
			if ('value' === e.context) {
				if ('discrete' === t.type) {
					let n;
					if ('ident' === e.value._t) n = e.value.value;
					else {
						if ('number' !== e.value._t || 'integer' !== e.value.flag) return 'false'
						n = e.value.value;
					}
					return t.values.has(n) ? a.solveUnknownFeature(e) : 'false'
				}
				if ('integer' === t.valueType) {
					if (isValueInteger(e.value)) {
						return (e.value.value < 0 && !t.canBeNegative) || (0 === e.value.value && !t.canBeZero)
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ('length' === t.valueType) {
					if (isValueLength(e.value)) {
						const r = compareLength(e.value, {_t: 'number', value: 0});
						return ('lt' === r && !t.canBeNegative) || ('eq' === r && !t.canBeZero)
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ('ratio' === t.valueType) {
					if (isValueRatio(e.value)) {
						return 'eq' ===
							compareRatio(e.value, {_t: 'number', value: 0}) &&
							!t.canNumeratorBeZero
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if (isValueResolution(e.value)) {
					const n = compareResolution(e.value, {value: 0, unit: 'x'});
					return ('lt' === n && !t.canBeNegative) || ('eq' === n && !t.canBeZero)
						? 'false'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('discrete' === t.type) return 'false'
			if (2 === e.ops)
				return solveMediaCondition_(
					{
						op: 'and',
						nodes: [
							{
								_t: 'in-parens',
								node: {
									_t: 'feature',
									context: 'range',
									ops: 1,
									feature: e.feature,
									op: '<' === e.minOp ? '>' : '>=',
									value: e.minValue,
									start: e.minValue.start,
									end: e.minValue.end
								}
							},
							{
								_t: 'in-parens',
								node: {
									_t: 'feature',
									context: 'range',
									ops: 1,
									feature: e.feature,
									op: e.maxOp,
									value: e.maxValue,
									start: e.maxValue.start,
									end: e.maxValue.end
								}
							}
						]},
					a
				)
			if ('ratio' === t.valueType) {
				if (isValueRatio(e.value)) {
					const n = 'number' === e.value._t ? e.value.value : e.value.left,
						r = 'number' === e.value._t ? 1 : e.value.right;
					if (
						(0 === n &&
							0 !== r &&
							(('=' === e.op && !t.canNumeratorBeZero) ||
								('<=' === e.op && !t.canNumeratorBeZero) ||
								'<' === e.op)) ||
						(0 === n &&
							0 === r &&
							(!t.canNumeratorBeZero || !t.canDenominatorBeZero) &&
							('<' === e.op || '>' === e.op))
					)
						return 'false'
					return ('>=' === e.op && 0 === n && 0 !== r && !t.canDenominatorBeZero) ||
						('>' === e.op &&
							0 === n &&
							0 !== r &&
							!t.canNumeratorBeZero &&
							t.canDenominatorBeZero) ||
						('<=' === e.op &&
							0 !== n &&
							0 === r &&
							!(t.canNumeratorBeZero && t.canDenominatorBeZero)) ||
						('<' === e.op && 0 !== n && 0 === r && !t.canDenominatorBeZero)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('integer' === t.valueType) {
				if (isValueInteger(e.value)) {
					if (
						('=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('=' === e.op && !t.canBeZero && 0 === e.value.value) ||
						('<=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('<=' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value) ||
						('<' === e.op && !t.canBeNegative && e.value.value <= 0) ||
						('<' === e.op && !t.canBeNegative && !t.canBeZero && 1 === e.value.value)
					)
						return 'false'
					return ('>=' === e.op && !t.canBeNegative && e.value.value <= 0) ||
						('>=' === e.op && !t.canBeNegative && !t.canBeZero && 1 === e.value.value) ||
						('>' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('>' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('length' === t.valueType) {
				if (isValueLength(e.value)) {
					if (
						('=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('=' === e.op && !t.canBeZero && 0 === e.value.value) ||
						('<=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('<=' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value) ||
						('<' === e.op && !t.canBeNegative && e.value.value <= 0)
					)
						return 'false'
					return ('>=' === e.op && !t.canBeNegative && e.value.value <= 0) ||
						('>' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('>' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if (isValueResolution(e.value)) {
				if (
					('=' === e.op && !t.canBeNegative && e.value.value < 0) ||
					('=' === e.op && !t.canBeZero && 0 === e.value.value) ||
					('<=' === e.op && !t.canBeNegative && e.value.value < 0) ||
					('<=' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value) ||
					('<' === e.op && !t.canBeNegative && e.value.value <= 0)
				)
					return 'false'
				return ('>=' === e.op && !t.canBeNegative && e.value.value <= 0) ||
					('>' === e.op && !t.canBeNegative && e.value.value < 0) ||
					('>' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value)
					? 'true'
					: a.solveUnknownFeature(e)
			}
			return 'false'
		}
		return 'false'
	}
};

const solveMediaInParens_ = (e, o) =>
	'condition' === e.node._t
		? solveMediaCondition_(e.node, o)
		: 'feature' === e.node._t
			? solveMediaFeature_(e.node, o)
			: o.solveGeneralEnclosed(e.node);

const solveMediaCondition_ = (o, e) =>
	'and' === o.op
		? and(...o.nodes.map(o => solveMediaInParens_(o, e)))
		: 'or' === o.op
			? or(...o.nodes.map(o => solveMediaInParens_(o, e)))
			: not(solveMediaInParens_(o.nodes[0], e));

const solveMediaQuery_ = (e, r) => {
	if ('true' === r.isLegacyBrowser && 'only' === e.prefix) return 'false'
	let i;
	i =
		void 0 === e.type || 'all' === e.type
			? 'true'
			: 'screen' === e.type
				? r.isMediaTypeScreen
				: 'print' === e.type
					? not(r.isMediaTypeScreen)
					: 'false';
	const n = void 0 === e.condition ? 'true' : solveMediaCondition_(e.condition, r),
		p = and(i, n);
	return 'not' === e.prefix ? not(p) : p
};

const not = e => ('true' === e ? 'false' : 'false' === e ? 'true' : 'unknown');
const and = (...e) =>
	e.reduce(
		(e, n) =>
			'false' === e || 'false' === n
				? 'false'
				: 'unknown' === e || 'unknown' === n
					? 'unknown'
					: 'true',
		'true'
	);
const or = (...e) =>
	e.reduce(
		(e, n) =>
			'true' === e || 'true' === n
				? 'true'
				: 'unknown' === e || 'unknown' === n
					? 'unknown'
					: 'false',
		'false'
	);
const DEFAULT_KNOWN_FEATURES = {
	'color-gamut': {type: 'discrete', values: ['srgb', 'p3', 'rec2020']},
	'display-mode': {type: 'discrete', values: ['fullscreen', 'standalone', 'minimal-ui', 'browser']},
	'dynamic-range': {type: 'discrete', values: ['standard', 'high']},
	'environment-blending': {type: 'discrete', values: ['opaque', 'additive', 'subtractive']},
	orientation: {type: 'discrete', values: ['portrait', 'landscape']},
	'prefers-color-scheme': {type: 'discrete', values: ['light', 'dark']},
	'prefers-contrast': {type: 'discrete', values: ['no-preference', 'less', 'more', 'custom']},
	'prefers-reduced-data': {type: 'discrete', values: ['no-preference', 'reduce']},
	'prefers-reduced-motion': {type: 'discrete', values: ['no-preference', 'reduce']},
	'prefers-reduced-transparency': {type: 'discrete', values: ['no-preference', 'reduce']},
	scan: {type: 'discrete', values: ['interlace', 'progressive']},
	'video-color-gamut': {type: 'discrete', values: ['srgb', 'p3', 'rec2020']},
	'video-dynamic-range': {type: 'discrete', values: ['standard', 'high']},
	'any-hover': {type: 'discrete', values: ['none', 'hover']},
	'any-pointer': {type: 'discrete', values: ['none', 'coarse', 'fine']},
	'forced-colors': {type: 'discrete', values: ['none', 'active']},
	hover: {type: 'discrete', values: ['none', 'hover']},
	'inverted-colors': {type: 'discrete', values: ['none', 'inverted']},
	'nav-controls': {type: 'discrete', values: ['none', 'back']},
	'overflow-block': {type: 'discrete', values: ['none', 'scroll', 'paged']},
	'overflow-inline': {type: 'discrete', values: ['none', 'scroll']},
	pointer: {type: 'discrete', values: ['none', 'coarse', 'fine']},
	update: {type: 'discrete', values: ['none', 'slow', 'fast']},
	scripting: {type: 'discrete', values: ['none', 'initial-only', 'enabled']},
	grid: {type: 'discrete', values: [0, 1]},
	resolution: {
		type: 'range',
		valueType: 'resolution',
		canBeZero: true,
		canBeNegative: false,
		extraValues: {infinite: Number.POSITIVE_INFINITY}
	},
	'device-height': {type: 'range', valueType: 'length', canBeZero: true, canBeNegative: false},
	'device-width': {type: 'range', valueType: 'length', canBeZero: true, canBeNegative: false},
	height: {type: 'range', valueType: 'length', canBeZero: true, canBeNegative: false},
	width: {type: 'range', valueType: 'length', canBeZero: true, canBeNegative: false},
	'device-aspect-ratio': {
		type: 'range',
		valueType: 'ratio',
		canNumeratorBeZero: true,
		canDenominatorBeZero: true
	},
	'aspect-ratio': {
		type: 'range',
		valueType: 'ratio',
		canNumeratorBeZero: true,
		canDenominatorBeZero: true
	},
	color: {type: 'range', valueType: 'integer', canBeZero: true, canBeNegative: false},
	'horizontal-viewport-segments': {
		type: 'range',
		valueType: 'integer',
		canBeZero: true,
		canBeNegative: false
	},
	'color-index': {type: 'range', valueType: 'integer', canBeZero: true, canBeNegative: false},
	monochrome: {type: 'range', valueType: 'integer', canBeZero: true, canBeNegative: false},
	'vertical-viewport-segments': {
		type: 'range',
		valueType: 'integer',
		canBeZero: true,
		canBeNegative: false
	}
};
const t = e => Object.entries(e);
const createSolverConfig = e => {
	var n, r, a, o, s, i;
	const l = new Map();
	for (const [a, o] of t({...DEFAULT_KNOWN_FEATURES, ...(null == e ? void 0 : e.features)}))
		'discrete' === o.type
			? l.set(a, {...o, values: new Set(null !== (n = o.values) && void 0 !== n ? n : [])})
			: l.set(a, {
					...o,
					extraValues: new Map(
						t(null !== (r = null == o ? void 0 : o.extraValues) && void 0 !== r ? r : {})
					)
				});
	return {
		solveUnknownFeature:
			null !== (a = null == e ? void 0 : e.solveUnknownFeature) && void 0 !== a
				? a
				: () => 'unknown',
		solveGeneralEnclosed:
			null !== (o = null == e ? void 0 : e.solveGeneralEnclosed) && void 0 !== o
				? o
				: () => 'unknown',
		isMediaTypeScreen:
			null !== (s = null == e ? void 0 : e.isMediaTypeScreen) && void 0 !== s ? s : 'unknown',
		isLegacyBrowser:
			null !== (i = null == e ? void 0 : e.isLegacyBrowser) && void 0 !== i ? i : 'unknown',
		features: l
	}
};
const solveMediaQueryList = (r, t) => {
	const a = 'string' == typeof r ? parseMediaQueryList(r) : r;
	return isParserError(a) ? 'false' : solveMediaQueryList_(a, createSolverConfig(t))
};
const solveMediaQueryList_ = (e, n) => {
	const t = e.nodes.map(e => (void 0 === e ? 'false' : solveMediaQuery_(e, n)));
	if (0 === t.length) return 'true'
	{
		let e = 'false';
		for (const n of t) {
			if ('true' === n) return 'true'
			'unknown' === n && (e = 'unknown');
		}
		return e
	}
};

const matchMedia = function (query) {
  // useful features for maps: prefers-color-scheme, prefers-lang, projection, zoom, extent
  const parsedQuery = parseMediaQueryList(query);

  // less obviously useful: aspect-ratio, orientation, (device) resolution, overflow-block, overflow-inline

  const map = this;
  const features = {
    'prefers-lang': {
      type: 'discrete',
      get values() {
        return [navigator.language.substring(0, 2)];
      }
    },
    'map-projection': {
      type: 'discrete',
      get values() {
        return [map.projection.toLowerCase()];
      }
    },
    'map-zoom': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: false,
      canBeZero: true,
      get extraValues() {
        return {
          min: 0,
          max: map.zoom
        };
      }
    },
    'map-top-left-easting': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.topLeft.pcrs.horizontal)];
      }
    },
    'map-top-left-northing': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.topLeft.pcrs.vertical)];
      }
    },
    'map-bottom-right-easting': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.bottomRight.pcrs.horizontal)];
      }
    },
    'map-bottom-right-northing': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.bottomRight.pcrs.vertical)];
      }
    },
    'prefers-color-scheme': {
      type: 'discrete',
      get values() {
        return [
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        ];
      }
    },
    'prefers-map-content': {
      type: 'discrete',
      get values() {
        return M.options.contentPreference;
      }
    }
  };

  const solveUnknownFeature = (featureNode) => {
    let feature = featureNode.feature;
    let queryValue = featureNode.value.value;

    if (feature === 'prefers-lang') {
      return features['prefers-lang'].values.includes(queryValue).toString();
    } else if (
      feature === 'map-zoom' ||
      feature === 'map-top-left-easting' ||
      feature === 'map-top-left-northing' ||
      feature === 'map-bottom-right-easting' ||
      feature === 'map-bottom-right-northing'
    ) {
      return solveRangeFeature(featureNode);
    } else if (feature === 'map-projection') {
      return features['map-projection'].values
        .some((p) => p === queryValue)
        .toString();
    } else if (feature === 'prefers-color-scheme') {
      return features['prefers-color-scheme'].values
        .some((s) => s === queryValue)
        .toString();
    } else if (feature === 'prefers-map-content') {
      return features[feature].values
        .some((pref) => pref === queryValue)
        .toString();
    }
    return 'false';
  };
  let matches =
    solveMediaQueryList(parsedQuery, {
      features,
      solveUnknownFeature
    }) === 'true'
      ? true
      : false;

  function solveRangeFeature(featureNode) {
    const { context, feature, value, op } = featureNode;

    if (!feature.startsWith('map-')) {
      return 'unknown';
    }

    const currentValue = getMapFeatureValue(feature);

    if (currentValue === undefined) {
      return 'unknown';
    }

    if (context === 'value') {
      // Plain case: <mf-name>: <mf-value>
      // Example: (map-zoom: 15)
      return currentValue === value.value ? 'true' : 'false';
    }

    if (context === 'range') {
      // Range case: <mf-name> <mf-comparison> <mf-value>
      // Example: (0 <= map-zoom < 15)
      switch (op) {
        case '<':
          return currentValue < value.value ? 'true' : 'false';
        case '<=':
          return currentValue <= value.value ? 'true' : 'false';
        case '>':
          return currentValue > value.value ? 'true' : 'false';
        case '>=':
          return currentValue >= value.value ? 'true' : 'false';
        case '=':
          return currentValue === value.value ? 'true' : 'false';
        default:
          return 'unknown';
      }
    }

    return 'unknown'; // If the context is neither "value" nor "range"
  }

  function getMapFeatureValue(feature) {
    switch (feature) {
      case 'map-zoom':
        return map.zoom;
      case 'map-top-left-easting':
        return Math.trunc(map.extent.topLeft.pcrs.horizontal);
      case 'map-top-left-northing':
        return Math.trunc(map.extent.topLeft.pcrs.vertical);
      case 'map-bottom-right-easting':
        return Math.trunc(map.extent.bottomRight.pcrs.horizontal);
      case 'map-bottom-right-northing':
        return Math.trunc(map.extent.bottomRight.pcrs.vertical);
      default:
        return undefined; // Unsupported or unknown feature
    }
  }

  // Make mediaQueryList an EventTarget for dispatching events
  const mediaQueryList = Object.assign(new EventTarget(), {
    matches,
    media: query,
    listeners: [],
    // this is a client facing api
    addEventListener(event, listener) {
      if (event === 'change') {
        this.listeners.push(listener);

        // Start observing properties only if there is at least one listener
        if (this.listeners.length !== 0) {
          observeProperties();
        }
        EventTarget.prototype.addEventListener.call(this, event, listener);
      }
    },

    // this is a client facing api
    removeEventListener(event, listener) {
      if (event === 'change') {
        this.listeners = this.listeners.filter((l) => l !== listener);

        // Stop observing if there are no more listeners
        if (this.listeners.length === 0) {
          stopObserving();
        }
        EventTarget.prototype.removeEventListener.call(this, event, listener);
      }
    }
  });

  const observeProperties = () => {
    const notifyIfChanged = () => {
      const newMatches =
        solveMediaQueryList(parsedQuery, {
          features,
          solveUnknownFeature
        }) === 'true'
          ? true
          : false;
      if (newMatches !== mediaQueryList.matches) {
        mediaQueryList.matches = newMatches;

        // Dispatch a "change" event to notify listeners of the update
        mediaQueryList.dispatchEvent(new Event('change'));
      }
    };
    notifyIfChanged.bind(this);
    // Subscribe to internal events for changes in projection, zoom, and extent
    this.addEventListener('map-projectionchange', notifyIfChanged);
    this.addEventListener('map-moveend', notifyIfChanged);
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', notifyIfChanged);

    // Stop observing function
    stopObserving = () => {
      this.removeEventListener('map-projectionchange', notifyIfChanged);
      this.removeEventListener('map-moveend', notifyIfChanged);
      colorSchemeQuery.removeEventListener('change', notifyIfChanged);
    };
  };

  let stopObserving; // Declare here so it can be assigned within observeProperties

  return mediaQueryList;
};

// Refactored LayerControl to remove global L dependency
var LayerControl = leafletSrcExports.Control.Layers.extend({
  options: {
    autoZIndex: false,
    sortLayers: true,
    sortFunction: function (layerA, layerB) {
      return layerA.options.zIndex < layerB.options.zIndex
        ? -1
        : layerA.options.zIndex > layerB.options.zIndex
        ? 1
        : 0;
    }
  },
  initialize: function (overlays, options) {
    leafletSrcExports.setOptions(this, options);

    // the _layers array contains objects like {layer: layer, name: "name", overlay: true}
    // the array index is the id of the layer returned by stamp(layer) which I guess is a unique hash
    this._layerControlInputs = [];
    this._layers = [];
    this._lastZIndex = 0;
    this._handlingClick = false;

    for (var i in overlays) {
      this._addLayer(overlays[i], i, true);
    }
  },
  onAdd: function () {
    this._initLayout();
    // Adding event on layer control button
    leafletSrcExports.DomEvent.on(
      this._container.getElementsByTagName('a')[0],
      'keydown',
      this._focusFirstLayer,
      this._container
    );
    leafletSrcExports.DomEvent.on(
      this._container,
      'contextmenu',
      this._preventDefaultContextMenu,
      this
    );
    this._update();
    if (this._layers.length < 1 && !this._map._showControls) {
      this._container.setAttribute('hidden', '');
    } else {
      this._map._showControls = true;
    }
    return this._container;
  },
  onRemove: function (map) {
    leafletSrcExports.DomEvent.off(
      this._container.getElementsByTagName('a')[0],
      'keydown',
      this._focusFirstLayer,
      this._container
    );
  },
  addOrUpdateOverlay: function (layer, name) {
    var alreadyThere = false;
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].layer === layer) {
        alreadyThere = true;
        this._layers[i].name = name;
        // replace the controls with updated controls if necessary.
        break;
      }
    }
    if (!alreadyThere) {
      this.addOverlay(layer, name);
    }
    if (this._layers.length > 0) {
      this._container.removeAttribute('hidden');
      this._map._showControls = true;
    }
    return this._map ? this._update() : this;
  },
  removeLayer: function (layer) {
    leafletSrcExports.Control.Layers.prototype.removeLayer.call(this, layer);
    if (this._layers.length === 0) {
      this._container.setAttribute('hidden', '');
    }
  },

  _checkDisabledLayers: function () {},

  // focus the first layer in the layer control when enter is pressed
  _focusFirstLayer: function (e) {
    if (
      e.key === 'Enter' &&
      this.className ===
        'leaflet-control-layers leaflet-control leaflet-control-layers-expanded'
    ) {
      var elem =
        this.children[1].children[2].children[0].children[0].children[0]
          .children[0];
      if (elem) setTimeout(() => elem.focus(), 0);
    }
  },

  // imported from leaflet with slight modifications
  // for layerControl ordering based on zIndex
  _update: function () {
    if (!this._container) {
      return this;
    }

    leafletSrcExports.DomUtil.empty(this._baseLayersList);
    leafletSrcExports.DomUtil.empty(this._overlaysList);

    this._layerControlInputs = [];
    var baseLayersPresent,
      overlaysPresent,
      i,
      obj,
      baseLayersCount = 0;

    // <----------- MODIFICATION from the default _update method
    // sort the layercontrol layers object based on the zIndex
    // provided by MapLayer
    if (this.options.sortLayers) {
      this._layers.sort((a, b) =>
        this.options.sortFunction(a.layer, b.layer, a.name, b.name)
      );
    }

    for (i = 0; i < this._layers.length; i++) {
      obj = this._layers[i];
      this._addItem(obj);
      overlaysPresent = overlaysPresent || obj.overlay;
      baseLayersPresent = baseLayersPresent || !obj.overlay;
      baseLayersCount += !obj.overlay ? 1 : 0;
    }

    // Hide base layers section if there's only one layer.
    if (this.options.hideSingleBase) {
      baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
      this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
    }

    this._separator.style.display =
      overlaysPresent && baseLayersPresent ? '' : 'none';

    return this;
  },

  _addItem: function (obj) {
    var layercontrols = obj.layer._layerEl._layerControlHTML;
    // the input is required by Leaflet...
    obj.input = layercontrols.querySelector(
      'input.leaflet-control-layers-selector'
    );

    this._layerControlInputs.push(obj.input);
    obj.input.layerId = leafletSrcExports.stamp(obj.layer);

    this._overlaysList.appendChild(layercontrols);
    return layercontrols;
  },

  //overrides collapse and conditionally collapses the panel
  collapse: function (e) {
    // if layer control is not expanded, return
    if (!this._container.className.includes('expanded')) {
      return;
    }
    // return if layer contextmenu is still open
    if (
      !this._map.contextMenu._extentLayerMenu.hidden ||
      !this._map.contextMenu._layerMenu.hidden
    ) {
      return;
    }
    if (
      e.target.tagName === 'SELECT' ||
      (e.relatedTarget &&
        e.relatedTarget.parentElement &&
        (e.relatedTarget.className === 'mapml-contextmenu mapml-layer-menu' ||
          e.relatedTarget.parentElement.className ===
            'mapml-contextmenu mapml-layer-menu')) ||
      (this._map && this._map.contextMenu._layerMenu.style.display === 'block')
    )
      return this;

    leafletSrcExports.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
    if (e.originalEvent?.pointerType === 'touch') {
      this._container._isExpanded = false;
    }
    return this;
  },
  _preventDefaultContextMenu: function (e) {
    let latlng = this._map.mouseEventToLatLng(e);
    let containerPoint = this._map.mouseEventToContainerPoint(e);
    e.preventDefault();
    // for touch devices, when the layer control is not expanded,
    // the layer context menu should not show on map
    if (!this._container._isExpanded && e.pointerType === 'touch') {
      this._container._isExpanded = true;
      return;
    }
    this._map.fire('contextmenu', {
      originalEvent: e,
      containerPoint: containerPoint,
      latlng: latlng
    });
  }
});
var layerControl = function (layers, options) {
  return new LayerControl(layers, options);
};

var ReloadButton = leafletSrcExports.Control.extend({
  options: {
    position: 'topleft'
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    let locale = this._getLocale(map);
    let container = leafletSrcExports.DomUtil.create('div', 'mapml-reload-button leaflet-bar');

    let link = leafletSrcExports.DomUtil.create('button', 'mapml-reload-button', container);
    link.innerHTML = "<span aria-hidden='true'>&#x021BA</span>";
    link.title = locale.cmReload;
    link.setAttribute('type', 'button');
    link.classList.add('mapml-button');
    link.setAttribute('aria-label', 'Reload');

    leafletSrcExports.DomEvent.disableClickPropagation(link);
    leafletSrcExports.DomEvent.on(link, 'click', leafletSrcExports.DomEvent.stop);
    leafletSrcExports.DomEvent.on(link, 'click', this._goReload, this);

    this._reloadButton = link;

    this._updateDisabled();
    map.on('moveend', this._updateDisabled, this);

    return container;
  },

  onRemove: function (map) {
    map.off('moveend', this._updateDisabled, this);
  },

  disable: function () {
    this._disabled = true;
    this._updateDisabled();
    return this;
  },

  enable: function () {
    this._disabled = false;
    this._updateDisabled();
    return this;
  },

  _goReload: function (e) {
    if (!this._disabled && this._map.options.mapEl._history.length > 1) {
      this._map.options.mapEl.reload();
    }
  },

  _updateDisabled: function () {
    setTimeout(() => {
      leafletSrcExports.DomUtil.removeClass(this._reloadButton, 'leaflet-disabled');
      this._reloadButton.setAttribute('aria-disabled', 'false');

      if (
        this._map &&
        (this._disabled || this._map.options.mapEl._history.length <= 1)
      ) {
        leafletSrcExports.DomUtil.addClass(this._reloadButton, 'leaflet-disabled');
        this._reloadButton.setAttribute('aria-disabled', 'true');
      }
    }, 0);
  }
});

var reloadButton = function (options) {
  return new ReloadButton(options);
};

var ScaleBar = leafletSrcExports.Control.Scale.extend({
  options: {
    maxWidth: 100,
    updateWhenIdle: true,
    position: 'bottomleft'
  },

  onAdd: function (map) {
    // create output tag for screenreader to read from
    let outputScale =
      "<output role='status' aria-live='polite' aria-atomic='true' class='mapml-screen-reader-output-scale'></output>";
    map._container.insertAdjacentHTML('beforeend', outputScale);

    // initialize _container
    this._container = leafletSrcExports.DomUtil.create('div', 'mapml-control-scale');
    let scaleControl = leafletSrcExports.Control.Scale.prototype.onAdd.call(this, map);
    this._container.appendChild(scaleControl);
    this._container.setAttribute('tabindex', 0);
    this._scaleControl = this;

    // run on load
    setTimeout(() => {
      this._updateOutput();
      this._focusOutput();
    }, 0);

    // update whenever map is zoomed or dragged
    map.on('zoomend moveend', this._updateOutput, this);

    // have screenreader read out everytime the map is focused
    this._map._container.addEventListener('focus', () => this._focusOutput());

    return this._container;
  },

  onRemove: function (map) {
    map.off('zoomend moveend', this._updateOutput, this);
  },

  getContainer: function () {
    return this._container;
  },

  _pixelsToDistance: function (px, units) {
    let dpi = window.devicePixelRatio * 96; // default dpi
    if (units === 'metric') {
      return (px / dpi) * 2.54; // inches to cm
    }
    return px / dpi;
  },

  _scaleLength: function (scale) {
    let scaleLength = scale.getAttribute('style');
    let finalLength = parseInt(scaleLength.match(/width:\s*(\d+)px/)[1]);

    return finalLength;
  },

  _focusOutput: function () {
    setTimeout(() => {
      let outputFocus = this._map._container.querySelector(
        '.mapml-screen-reader-output-scale'
      );
      outputFocus.textContent = '';
      setTimeout(() => {
        outputFocus.textContent = this._container.getAttribute('aria-label');
      }, 100);
    }, 0);
  },

  _updateOutput: function () {
    let output = '';
    let scaleLine = this._scaleControl
      .getContainer()
      .getElementsByClassName('leaflet-control-scale-line')[0];

    if (this.options.metric) {
      let distance = parseFloat(
        this._pixelsToDistance(this._scaleLength(scaleLine), 'metric').toFixed(
          1
        )
      );
      output = `${distance} centimeters to ${scaleLine.textContent.trim()}`;
      output = output.replace(/(\d+)\s*m\b/g, '$1 meters');
      output = output.replace(/ km/g, ' kilometers');
    } else {
      let distance = parseFloat(
        this._pixelsToDistance(
          this._scaleLength(scaleLine),
          'imperial'
        ).toFixed(1)
      );
      output = `${distance} inches to ${scaleLine.textContent.trim()}`;
      output = output.replace(/ft/g, 'feet');
      output = output.replace(/mi/g, 'miles');
    }

    this._container.setAttribute('aria-label', output);
    this._map._container.querySelector(
      '.mapml-screen-reader-output-scale'
    ).textContent = output;
  }
});
var scaleBar = function (options) {
  return new ScaleBar(options);
};

var L_Control_Locate = {exports: {}};

/*!
Copyright (c) 2016 Dominik Moritz

This file is part of the leaflet locate control. It is licensed under the MIT license.
You can find the project at: https://github.com/domoritz/leaflet-locatecontrol
*/

var hasRequiredL_Control_Locate;

function requireL_Control_Locate () {
	if (hasRequiredL_Control_Locate) return L_Control_Locate.exports;
	hasRequiredL_Control_Locate = 1;
	(function (module, exports) {
		(function (factory, window) {
		  // see https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md#module-loaders
		  // for details on how to structure a leaflet plugin.

		  // define an AMD module that relies on 'leaflet'
		  {
		    if (typeof window !== "undefined" && window.L) {
		      module.exports = factory(L);
		    } else {
		      module.exports = factory(requireLeafletSrc());
		    }
		  }

		  // attach your plugin to the global 'L' variable
		  if (typeof window !== "undefined" && window.L) {
		    window.L.Control.Locate = factory(L);
		  }
		})(function (L) {
		  const LDomUtilApplyClassesMethod = (method, element, classNames) => {
		    classNames = classNames.split(" ");
		    classNames.forEach(function (className) {
		      L.DomUtil[method].call(this, element, className);
		    });
		  };

		  const addClasses = (el, names) => LDomUtilApplyClassesMethod("addClass", el, names);
		  const removeClasses = (el, names) => LDomUtilApplyClassesMethod("removeClass", el, names);

		  /**
		   * Compatible with L.Circle but a true marker instead of a path
		   */
		  const LocationMarker = L.Marker.extend({
		    initialize(latlng, options) {
		      L.Util.setOptions(this, options);
		      this._latlng = latlng;
		      this.createIcon();
		    },

		    /**
		     * Create a styled circle location marker
		     */
		    createIcon() {
		      const opt = this.options;

		      let style = "";

		      if (opt.color !== undefined) {
		        style += `stroke:${opt.color};`;
		      }
		      if (opt.weight !== undefined) {
		        style += `stroke-width:${opt.weight};`;
		      }
		      if (opt.fillColor !== undefined) {
		        style += `fill:${opt.fillColor};`;
		      }
		      if (opt.fillOpacity !== undefined) {
		        style += `fill-opacity:${opt.fillOpacity};`;
		      }
		      if (opt.opacity !== undefined) {
		        style += `opacity:${opt.opacity};`;
		      }

		      const icon = this._getIconSVG(opt, style);

		      this._locationIcon = L.divIcon({
		        className: icon.className,
		        html: icon.svg,
		        iconSize: [icon.w, icon.h]
		      });

		      this.setIcon(this._locationIcon);
		    },

		    /**
		     * Return the raw svg for the shape
		     *
		     * Split so can be easily overridden
		     */
		    _getIconSVG(options, style) {
		      const r = options.radius;
		      const w = options.weight;
		      const s = r + w;
		      const s2 = s * 2;
		      const svg =
		        `<svg xmlns="http://www.w3.org/2000/svg" width="${s2}" height="${s2}" version="1.1" viewBox="-${s} -${s} ${s2} ${s2}">` +
		        '<circle r="' +
		        r +
		        '" style="' +
		        style +
		        '" />' +
		        "</svg>";
		      return {
		        className: "leaflet-control-locate-location",
		        svg,
		        w: s2,
		        h: s2
		      };
		    },

		    setStyle(style) {
		      L.Util.setOptions(this, style);
		      this.createIcon();
		    }
		  });

		  const CompassMarker = LocationMarker.extend({
		    initialize(latlng, heading, options) {
		      L.Util.setOptions(this, options);
		      this._latlng = latlng;
		      this._heading = heading;
		      this.createIcon();
		    },

		    setHeading(heading) {
		      this._heading = heading;
		    },

		    /**
		     * Create a styled arrow compass marker
		     */
		    _getIconSVG(options, style) {
		      const r = options.radius;
		      const w = options.width + options.weight;
		      const h = (r + options.depth + options.weight) * 2;
		      const path = `M0,0 l${options.width / 2},${options.depth} l-${w},0 z`;
		      const svgstyle = `transform: rotate(${this._heading}deg)`;
		      const svg =
		        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" version="1.1" viewBox="-${w / 2} 0 ${w} ${h}" style="${svgstyle}">` +
		        '<path d="' +
		        path +
		        '" style="' +
		        style +
		        '" />' +
		        "</svg>";
		      return {
		        className: "leaflet-control-locate-heading",
		        svg,
		        w,
		        h
		      };
		    }
		  });

		  const LocateControl = L.Control.extend({
		    options: {
		      /** Position of the control */
		      position: "topleft",
		      /** The layer that the user's location should be drawn on. By default creates a new layer. */
		      layer: undefined,
		      /**
		       * Automatically sets the map view (zoom and pan) to the user's location as it updates.
		       * While the map is following the user's location, the control is in the `following` state,
		       * which changes the style of the control and the circle marker.
		       *
		       * Possible values:
		       *  - false: never updates the map view when location changes.
		       *  - 'once': set the view when the location is first determined
		       *  - 'always': always updates the map view when location changes.
		       *              The map view follows the user's location.
		       *  - 'untilPan': like 'always', except stops updating the
		       *                view if the user has manually panned the map.
		       *                The map view follows the user's location until she pans.
		       *  - 'untilPanOrZoom': (default) like 'always', except stops updating the
		       *                view if the user has manually panned the map.
		       *                The map view follows the user's location until she pans.
		       */
		      setView: "untilPanOrZoom",
		      /** Keep the current map zoom level when setting the view and only pan. */
		      keepCurrentZoomLevel: false,
		      /** After activating the plugin by clicking on the icon, zoom to the selected zoom level, even when keepCurrentZoomLevel is true. Set to 'false' to disable this feature. */
		      initialZoomLevel: false,
		      /**
		       * This callback can be used to override the viewport tracking
		       * This function should return a LatLngBounds object.
		       *
		       * For example to extend the viewport to ensure that a particular LatLng is visible:
		       *
		       * getLocationBounds: function(locationEvent) {
		       *    return locationEvent.bounds.extend([-33.873085, 151.219273]);
		       * },
		       */
		      getLocationBounds(locationEvent) {
		        return locationEvent.bounds;
		      },
		      /** Smooth pan and zoom to the location of the marker. Only works in Leaflet 1.0+. */
		      flyTo: false,
		      /**
		       * The user location can be inside and outside the current view when the user clicks on the
		       * control that is already active. Both cases can be configures separately.
		       * Possible values are:
		       *  - 'setView': zoom and pan to the current location
		       *  - 'stop': stop locating and remove the location marker
		       */
		      clickBehavior: {
		        /** What should happen if the user clicks on the control while the location is within the current view. */
		        inView: "stop",
		        /** What should happen if the user clicks on the control while the location is outside the current view. */
		        outOfView: "setView",
		        /**
		         * What should happen if the user clicks on the control while the location is within the current view
		         * and we could be following but are not. Defaults to a special value which inherits from 'inView';
		         */
		        inViewNotFollowing: "inView"
		      },
		      /**
		       * If set, save the map bounds just before centering to the user's
		       * location. When control is disabled, set the view back to the
		       * bounds that were saved.
		       */
		      returnToPrevBounds: false,
		      /**
		       * Keep a cache of the location after the user deactivates the control. If set to false, the user has to wait
		       * until the locate API returns a new location before they see where they are again.
		       */
		      cacheLocation: true,
		      /** If set, a circle that shows the location accuracy is drawn. */
		      drawCircle: true,
		      /** If set, the marker at the users' location is drawn. */
		      drawMarker: true,
		      /** If set and supported then show the compass heading */
		      showCompass: true,
		      /** The class to be used to create the marker. For example L.CircleMarker or L.Marker */
		      markerClass: LocationMarker,
		      /** The class us be used to create the compass bearing arrow */
		      compassClass: CompassMarker,
		      /** Accuracy circle style properties. NOTE these styles should match the css animations styles */
		      circleStyle: {
		        className: "leaflet-control-locate-circle",
		        color: "#136AEC",
		        fillColor: "#136AEC",
		        fillOpacity: 0.15,
		        weight: 0
		      },
		      /** Inner marker style properties. Only works if your marker class supports `setStyle`. */
		      markerStyle: {
		        className: "leaflet-control-locate-marker",
		        color: "#fff",
		        fillColor: "#2A93EE",
		        fillOpacity: 1,
		        weight: 3,
		        opacity: 1,
		        radius: 9
		      },
		      /** Compass */
		      compassStyle: {
		        fillColor: "#2A93EE",
		        fillOpacity: 1,
		        weight: 0,
		        color: "#fff",
		        opacity: 1,
		        radius: 9, // How far is the arrow from the center of the marker
		        width: 9, // Width of the arrow
		        depth: 6 // Length of the arrow
		      },
		      /**
		       * Changes to accuracy circle and inner marker while following.
		       * It is only necessary to provide the properties that should change.
		       */
		      followCircleStyle: {},
		      followMarkerStyle: {
		        // color: '#FFA500',
		        // fillColor: '#FFB000'
		      },
		      followCompassStyle: {},
		      /** The CSS class for the icon. For example fa-location-arrow or fa-map-marker */
		      icon: "leaflet-control-locate-location-arrow",
		      iconLoading: "leaflet-control-locate-spinner",
		      /** The element to be created for icons. For example span or i */
		      iconElementTag: "span",
		      /** The element to be created for the text. For example small or span */
		      textElementTag: "small",
		      /** Padding around the accuracy circle. */
		      circlePadding: [0, 0],
		      /** Use metric units. */
		      metric: true,
		      /**
		       * This callback can be used in case you would like to override button creation behavior.
		       * This is useful for DOM manipulation frameworks such as angular etc.
		       * This function should return an object with HtmlElement for the button (link property) and the icon (icon property).
		       */
		      createButtonCallback(container, options) {
		        const link = L.DomUtil.create("a", "leaflet-bar-part leaflet-bar-part-single", container);
		        link.title = options.strings.title;
		        link.href = "#";
		        link.setAttribute("role", "button");
		        const icon = L.DomUtil.create(options.iconElementTag, options.icon, link);

		        if (options.strings.text !== undefined) {
		          const text = L.DomUtil.create(options.textElementTag, "leaflet-locate-text", link);
		          text.textContent = options.strings.text;
		          link.classList.add("leaflet-locate-text-active");
		          link.parentNode.style.display = "flex";
		          if (options.icon.length > 0) {
		            icon.classList.add("leaflet-locate-icon");
		          }
		        }

		        return { link, icon };
		      },
		      /** This event is called in case of any location error that is not a time out error. */
		      onLocationError(err, control) {
		        alert(err.message);
		      },
		      /**
		       * This event is called when the user's location is outside the bounds set on the map.
		       * The event is called repeatedly when the location changes.
		       */
		      onLocationOutsideMapBounds(control) {
		        control.stop();
		        alert(control.options.strings.outsideMapBoundsMsg);
		      },
		      /** Display a pop-up when the user click on the inner marker. */
		      showPopup: true,
		      strings: {
		        title: "Show me where I am",
		        metersUnit: "meters",
		        feetUnit: "feet",
		        popup: "You are within {distance} {unit} from this point",
		        outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
		      },
		      /** The default options passed to leaflets locate method. */
		      locateOptions: {
		        maxZoom: Infinity,
		        watch: true, // if you overwrite this, visualization cannot be updated
		        setView: false // have to set this to false because we have to
		        // do setView manually
		      }
		    },

		    initialize(options) {
		      // set default options if nothing is set (merge one step deep)
		      for (const i in options) {
		        if (typeof this.options[i] === "object") {
		          L.extend(this.options[i], options[i]);
		        } else {
		          this.options[i] = options[i];
		        }
		      }

		      // extend the follow marker style and circle from the normal style
		      this.options.followMarkerStyle = L.extend({}, this.options.markerStyle, this.options.followMarkerStyle);
		      this.options.followCircleStyle = L.extend({}, this.options.circleStyle, this.options.followCircleStyle);
		      this.options.followCompassStyle = L.extend({}, this.options.compassStyle, this.options.followCompassStyle);
		    },

		    /**
		     * Add control to map. Returns the container for the control.
		     */
		    onAdd(map) {
		      const container = L.DomUtil.create("div", "leaflet-control-locate leaflet-bar leaflet-control");
		      this._container = container;
		      this._map = map;
		      this._layer = this.options.layer || new L.LayerGroup();
		      this._layer.addTo(map);
		      this._event = undefined;
		      this._compassHeading = null;
		      this._prevBounds = null;

		      const linkAndIcon = this.options.createButtonCallback(container, this.options);
		      this._link = linkAndIcon.link;
		      this._icon = linkAndIcon.icon;

		      L.DomEvent.on(
		        this._link,
		        "click",
		        function (ev) {
		          L.DomEvent.stopPropagation(ev);
		          L.DomEvent.preventDefault(ev);
		          this._onClick();
		        },
		        this
		      ).on(this._link, "dblclick", L.DomEvent.stopPropagation);

		      this._resetVariables();

		      this._map.on("unload", this._unload, this);

		      return container;
		    },

		    /**
		     * This method is called when the user clicks on the control.
		     */
		    _onClick() {
		      this._justClicked = true;
		      const wasFollowing = this._isFollowing();
		      this._userPanned = false;
		      this._userZoomed = false;

		      if (this._active && !this._event) {
		        // click while requesting
		        this.stop();
		      } else if (this._active) {
		        const behaviors = this.options.clickBehavior;
		        let behavior = behaviors.outOfView;
		        if (this._map.getBounds().contains(this._event.latlng)) {
		          behavior = wasFollowing ? behaviors.inView : behaviors.inViewNotFollowing;
		        }

		        // Allow inheriting from another behavior
		        if (behaviors[behavior]) {
		          behavior = behaviors[behavior];
		        }

		        switch (behavior) {
		          case "setView":
		            this.setView();
		            break;
		          case "stop":
		            this.stop();
		            if (this.options.returnToPrevBounds) {
		              const f = this.options.flyTo ? this._map.flyToBounds : this._map.fitBounds;
		              f.bind(this._map)(this._prevBounds);
		            }
		            break;
		        }
		      } else {
		        if (this.options.returnToPrevBounds) {
		          this._prevBounds = this._map.getBounds();
		        }
		        this.start();
		      }

		      this._updateContainerStyle();
		    },

		    /**
		     * Starts the plugin:
		     * - activates the engine
		     * - draws the marker (if coordinates available)
		     */
		    start() {
		      this._activate();

		      if (this._event) {
		        this._drawMarker(this._map);

		        // if we already have a location but the user clicked on the control
		        if (this.options.setView) {
		          this.setView();
		        }
		      }
		      this._updateContainerStyle();
		    },

		    /**
		     * Stops the plugin:
		     * - deactivates the engine
		     * - reinitializes the button
		     * - removes the marker
		     */
		    stop() {
		      this._deactivate();

		      this._cleanClasses();
		      this._resetVariables();

		      this._removeMarker();
		    },

		    /**
		     * Keep the control active but stop following the location
		     */
		    stopFollowing() {
		      this._userPanned = true;
		      this._updateContainerStyle();
		      this._drawMarker();
		    },

		    /**
		     * This method launches the location engine.
		     * It is called before the marker is updated,
		     * event if it does not mean that the event will be ready.
		     *
		     * Override it if you want to add more functionalities.
		     * It should set the this._active to true and do nothing if
		     * this._active is true.
		     */
		    _activate() {
		      if (this._active || !this._map) {
		        return;
		      }

		      this._map.locate(this.options.locateOptions);
		      this._map.fire("locateactivate", this);
		      this._active = true;

		      // bind event listeners
		      this._map.on("locationfound", this._onLocationFound, this);
		      this._map.on("locationerror", this._onLocationError, this);
		      this._map.on("dragstart", this._onDrag, this);
		      this._map.on("zoomstart", this._onZoom, this);
		      this._map.on("zoomend", this._onZoomEnd, this);
		      if (this.options.showCompass) {
		        const oriAbs = "ondeviceorientationabsolute" in window;
		        if (oriAbs || "ondeviceorientation" in window) {
		          const _this = this;
		          const deviceorientation = function () {
		            L.DomEvent.on(window, oriAbs ? "deviceorientationabsolute" : "deviceorientation", _this._onDeviceOrientation, _this);
		          };
		          if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
		            DeviceOrientationEvent.requestPermission().then(function (permissionState) {
		              if (permissionState === "granted") {
		                deviceorientation();
		              }
		            });
		          } else {
		            deviceorientation();
		          }
		        }
		      }
		    },

		    /**
		     * Called to stop the location engine.
		     *
		     * Override it to shutdown any functionalities you added on start.
		     */
		    _deactivate() {
		      if (!this._active || !this._map) {
		        return;
		      }

		      this._map.stopLocate();
		      this._map.fire("locatedeactivate", this);
		      this._active = false;

		      if (!this.options.cacheLocation) {
		        this._event = undefined;
		      }

		      // unbind event listeners
		      this._map.off("locationfound", this._onLocationFound, this);
		      this._map.off("locationerror", this._onLocationError, this);
		      this._map.off("dragstart", this._onDrag, this);
		      this._map.off("zoomstart", this._onZoom, this);
		      this._map.off("zoomend", this._onZoomEnd, this);
		      if (this.options.showCompass) {
		        this._compassHeading = null;
		        if ("ondeviceorientationabsolute" in window) {
		          L.DomEvent.off(window, "deviceorientationabsolute", this._onDeviceOrientation, this);
		        } else if ("ondeviceorientation" in window) {
		          L.DomEvent.off(window, "deviceorientation", this._onDeviceOrientation, this);
		        }
		      }
		    },

		    /**
		     * Zoom (unless we should keep the zoom level) and an to the current view.
		     */
		    setView() {
		      this._drawMarker();
		      if (this._isOutsideMapBounds()) {
		        this._event = undefined; // clear the current location so we can get back into the bounds
		        this.options.onLocationOutsideMapBounds(this);
		      } else {
		        if (this._justClicked && this.options.initialZoomLevel !== false) {
		          var f = this.options.flyTo ? this._map.flyTo : this._map.setView;
		          f.bind(this._map)([this._event.latitude, this._event.longitude], this.options.initialZoomLevel);
		        } else if (this.options.keepCurrentZoomLevel) {
		          var f = this.options.flyTo ? this._map.flyTo : this._map.panTo;
		          f.bind(this._map)([this._event.latitude, this._event.longitude]);
		        } else {
		          var f = this.options.flyTo ? this._map.flyToBounds : this._map.fitBounds;
		          // Ignore zoom events while setting the viewport as these would stop following
		          this._ignoreEvent = true;
		          f.bind(this._map)(this.options.getLocationBounds(this._event), {
		            padding: this.options.circlePadding,
		            maxZoom: this.options.initialZoomLevel || this.options.locateOptions.maxZoom
		          });
		          L.Util.requestAnimFrame(function () {
		            // Wait until after the next animFrame because the flyTo can be async
		            this._ignoreEvent = false;
		          }, this);
		        }
		      }
		    },

		    /**
		     *
		     */
		    _drawCompass() {
		      if (!this._event) {
		        return;
		      }

		      const latlng = this._event.latlng;

		      if (this.options.showCompass && latlng && this._compassHeading !== null) {
		        const cStyle = this._isFollowing() ? this.options.followCompassStyle : this.options.compassStyle;
		        if (!this._compass) {
		          this._compass = new this.options.compassClass(latlng, this._compassHeading, cStyle).addTo(this._layer);
		        } else {
		          this._compass.setLatLng(latlng);
		          this._compass.setHeading(this._compassHeading);
		          // If the compassClass can be updated with setStyle, update it.
		          if (this._compass.setStyle) {
		            this._compass.setStyle(cStyle);
		          }
		        }
		        //
		      }
		      if (this._compass && (!this.options.showCompass || this._compassHeading === null)) {
		        this._compass.removeFrom(this._layer);
		        this._compass = null;
		      }
		    },

		    /**
		     * Draw the marker and accuracy circle on the map.
		     *
		     * Uses the event retrieved from onLocationFound from the map.
		     */
		    _drawMarker() {
		      if (this._event.accuracy === undefined) {
		        this._event.accuracy = 0;
		      }

		      const radius = this._event.accuracy;
		      const latlng = this._event.latlng;

		      // circle with the radius of the location's accuracy
		      if (this.options.drawCircle) {
		        const style = this._isFollowing() ? this.options.followCircleStyle : this.options.circleStyle;

		        if (!this._circle) {
		          this._circle = L.circle(latlng, radius, style).addTo(this._layer);
		        } else {
		          this._circle.setLatLng(latlng).setRadius(radius).setStyle(style);
		        }
		      }

		      let distance;
		      let unit;
		      if (this.options.metric) {
		        distance = radius.toFixed(0);
		        unit = this.options.strings.metersUnit;
		      } else {
		        distance = (radius * 3.2808399).toFixed(0);
		        unit = this.options.strings.feetUnit;
		      }

		      // small inner marker
		      if (this.options.drawMarker) {
		        const mStyle = this._isFollowing() ? this.options.followMarkerStyle : this.options.markerStyle;
		        if (!this._marker) {
		          this._marker = new this.options.markerClass(latlng, mStyle).addTo(this._layer);
		        } else {
		          this._marker.setLatLng(latlng);
		          // If the markerClass can be updated with setStyle, update it.
		          if (this._marker.setStyle) {
		            this._marker.setStyle(mStyle);
		          }
		        }
		      }

		      this._drawCompass();

		      const t = this.options.strings.popup;
		      function getPopupText() {
		        if (typeof t === "string") {
		          return L.Util.template(t, { distance, unit });
		        } else if (typeof t === "function") {
		          return t({ distance, unit });
		        } else {
		          return t;
		        }
		      }
		      if (this.options.showPopup && t && this._marker) {
		        this._marker.bindPopup(getPopupText())._popup.setLatLng(latlng);
		      }
		      if (this.options.showPopup && t && this._compass) {
		        this._compass.bindPopup(getPopupText())._popup.setLatLng(latlng);
		      }
		    },

		    /**
		     * Remove the marker from map.
		     */
		    _removeMarker() {
		      this._layer.clearLayers();
		      this._marker = undefined;
		      this._circle = undefined;
		    },

		    /**
		     * Unload the plugin and all event listeners.
		     * Kind of the opposite of onAdd.
		     */
		    _unload() {
		      this.stop();
		      // May become undefined during HMR
		      if (this._map) {
		        this._map.off("unload", this._unload, this);
		      }
		    },

		    /**
		     * Sets the compass heading
		     */
		    _setCompassHeading(angle) {
		      if (!isNaN(parseFloat(angle)) && isFinite(angle)) {
		        angle = Math.round(angle);

		        this._compassHeading = angle;
		        L.Util.requestAnimFrame(this._drawCompass, this);
		      } else {
		        this._compassHeading = null;
		      }
		    },

		    /**
		     * If the compass fails calibration just fail safely and remove the compass
		     */
		    _onCompassNeedsCalibration() {
		      this._setCompassHeading();
		    },

		    /**
		     * Process and normalise compass events
		     */
		    _onDeviceOrientation(e) {
		      if (!this._active) {
		        return;
		      }

		      if (e.webkitCompassHeading) {
		        // iOS
		        this._setCompassHeading(e.webkitCompassHeading);
		      } else if (e.absolute && e.alpha) {
		        // Android
		        this._setCompassHeading(360 - e.alpha);
		      }
		    },

		    /**
		     * Calls deactivate and dispatches an error.
		     */
		    _onLocationError(err) {
		      // ignore time out error if the location is watched
		      if (err.code == 3 && this.options.locateOptions.watch) {
		        return;
		      }

		      this.stop();
		      this.options.onLocationError(err, this);
		    },

		    /**
		     * Stores the received event and updates the marker.
		     */
		    _onLocationFound(e) {
		      // no need to do anything if the location has not changed
		      if (this._event && this._event.latlng.lat === e.latlng.lat && this._event.latlng.lng === e.latlng.lng && this._event.accuracy === e.accuracy) {
		        return;
		      }

		      if (!this._active) {
		        // we may have a stray event
		        return;
		      }

		      this._event = e;

		      this._drawMarker();
		      this._updateContainerStyle();

		      switch (this.options.setView) {
		        case "once":
		          if (this._justClicked) {
		            this.setView();
		          }
		          break;
		        case "untilPan":
		          if (!this._userPanned) {
		            this.setView();
		          }
		          break;
		        case "untilPanOrZoom":
		          if (!this._userPanned && !this._userZoomed) {
		            this.setView();
		          }
		          break;
		        case "always":
		          this.setView();
		          break;
		      }

		      this._justClicked = false;
		    },

		    /**
		     * When the user drags. Need a separate event so we can bind and unbind event listeners.
		     */
		    _onDrag() {
		      // only react to drags once we have a location
		      if (this._event && !this._ignoreEvent) {
		        this._userPanned = true;
		        this._updateContainerStyle();
		        this._drawMarker();
		      }
		    },

		    /**
		     * When the user zooms. Need a separate event so we can bind and unbind event listeners.
		     */
		    _onZoom() {
		      // only react to drags once we have a location
		      if (this._event && !this._ignoreEvent) {
		        this._userZoomed = true;
		        this._updateContainerStyle();
		        this._drawMarker();
		      }
		    },

		    /**
		     * After a zoom ends update the compass and handle sideways zooms
		     */
		    _onZoomEnd() {
		      if (this._event) {
		        this._drawCompass();
		      }

		      if (this._event && !this._ignoreEvent) {
		        // If we have zoomed in and out and ended up sideways treat it as a pan
		        if (this._marker && !this._map.getBounds().pad(-0.3).contains(this._marker.getLatLng())) {
		          this._userPanned = true;
		          this._updateContainerStyle();
		          this._drawMarker();
		        }
		      }
		    },

		    /**
		     * Compute whether the map is following the user location with pan and zoom.
		     */
		    _isFollowing() {
		      if (!this._active) {
		        return false;
		      }

		      if (this.options.setView === "always") {
		        return true;
		      } else if (this.options.setView === "untilPan") {
		        return !this._userPanned;
		      } else if (this.options.setView === "untilPanOrZoom") {
		        return !this._userPanned && !this._userZoomed;
		      }
		    },

		    /**
		     * Check if location is in map bounds
		     */
		    _isOutsideMapBounds() {
		      if (this._event === undefined) {
		        return false;
		      }
		      return this._map.options.maxBounds && !this._map.options.maxBounds.contains(this._event.latlng);
		    },

		    /**
		     * Toggles button class between following and active.
		     */
		    _updateContainerStyle() {
		      if (!this._container) {
		        return;
		      }

		      if (this._active && !this._event) {
		        // active but don't have a location yet
		        this._setClasses("requesting");
		      } else if (this._isFollowing()) {
		        this._setClasses("following");
		      } else if (this._active) {
		        this._setClasses("active");
		      } else {
		        this._cleanClasses();
		      }
		    },

		    /**
		     * Sets the CSS classes for the state.
		     */
		    _setClasses(state) {
		      if (state == "requesting") {
		        removeClasses(this._container, "active following");
		        addClasses(this._container, "requesting");

		        removeClasses(this._icon, this.options.icon);
		        addClasses(this._icon, this.options.iconLoading);
		      } else if (state == "active") {
		        removeClasses(this._container, "requesting following");
		        addClasses(this._container, "active");

		        removeClasses(this._icon, this.options.iconLoading);
		        addClasses(this._icon, this.options.icon);
		      } else if (state == "following") {
		        removeClasses(this._container, "requesting");
		        addClasses(this._container, "active following");

		        removeClasses(this._icon, this.options.iconLoading);
		        addClasses(this._icon, this.options.icon);
		      }
		    },

		    /**
		     * Removes all classes from button.
		     */
		    _cleanClasses() {
		      L.DomUtil.removeClass(this._container, "requesting");
		      L.DomUtil.removeClass(this._container, "active");
		      L.DomUtil.removeClass(this._container, "following");

		      removeClasses(this._icon, this.options.iconLoading);
		      addClasses(this._icon, this.options.icon);
		    },

		    /**
		     * Reinitializes state variables.
		     */
		    _resetVariables() {
		      // whether locate is active or not
		      this._active = false;

		      // true if the control was clicked for the first time
		      // we need this so we can pan and zoom once we have the location
		      this._justClicked = false;

		      // true if the user has panned the map after clicking the control
		      this._userPanned = false;

		      // true if the user has zoomed the map after clicking the control
		      this._userZoomed = false;
		    }
		  });

		  L.control.locate = (options) => new L.Control.Locate(options);

		  return LocateControl;
		}, window); 
	} (L_Control_Locate));
	return L_Control_Locate.exports;
}

var L_Control_LocateExports = requireL_Control_Locate();
var LocateControl = /*@__PURE__*/getDefaultExportFromCjs(L_Control_LocateExports);

var GeolocationButton = leafletSrcExports.Control.extend({
  options: {
    position: 'bottomright'
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    // customize locate control to focus map after start/stop, so that
    // featureIndexOverlay is correctly displayed
    leafletSrcExports.Control.CustomLocate = LocateControl.extend({
      start: function () {
        LocateControl.prototype.start.call(this);
        map.getContainer().focus();
      },
      stop: function () {
        LocateControl.prototype.stop.call(this);
        map.getContainer().focus();
      }
    });
    let locale = this._getLocale(map);

    this.locateControl = new leafletSrcExports.Control.CustomLocate({
      showPopup: false,
      strings: {
        title: locale.btnLocTrackOff
      },
      position: this.options.position,
      locateOptions: {
        maxZoom: 16
      }
    }).addTo(map);

    var container = this.locateControl._container;
    var button = this.locateControl;
    var observer = new MutationObserver(function (mutations) {
      if (
        container.classList.contains('active') &&
        container.classList.contains('following')
      ) {
        container.firstChild.title = locale.btnLocTrackOn;
        button._marker.bindTooltip(locale.btnMyLocTrackOn, {
          permanent: true
        });
      } else if (container.classList.contains('active')) {
        container.firstChild.title = locale.btnLocTrackLastKnown;
        button._marker.bindTooltip(locale.btnMyLastKnownLocTrackOn);
      } else {
        container.firstChild.title = locale.btnLocTrackOff;
      }
    });
    var observerConfig = { attributes: true, attributeFilter: ['class'] };
    observer.observe(container, observerConfig);

    return container;
  },

  stop: function () {
    return this.locateControl.stop();
  }
});

var geolocationButton = function (options) {
  return new GeolocationButton(options);
};

var FullscreenButton = leafletSrcExports.Control.extend({
  options: {
    position: 'topleft',
    title: {
      false: M.options.locale.btnFullScreen,
      true: M.options.locale.btnExitFullScreen
    }
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    let locale = this._getLocale(map);
    this.options.title = {
      false: locale.btnFullScreen,
      true: locale.btnExitFullScreen
    };
    var container = leafletSrcExports.DomUtil.create(
      'div',
      'leaflet-control-fullscreen leaflet-bar leaflet-control'
    );

    this.link = leafletSrcExports.DomUtil.create(
      'a',
      'leaflet-control-fullscreen-button leaflet-bar-part',
      container
    );
    this.link.href = '#';
    this.link.setAttribute('role', 'button');

    this._map = map;
    this._map.on('fullscreenchange', this._toggleTitle, this);
    this._toggleTitle();

    leafletSrcExports.DomEvent.on(this.link, 'click', this._click, this);

    return container;
  },

  onRemove: function (map) {
    map.off('fullscreenchange', this._toggleTitle, this);
  },

  _click: function (e) {
    leafletSrcExports.DomEvent.stopPropagation(e);
    leafletSrcExports.DomEvent.preventDefault(e);
    this._map.toggleFullscreen(this.options);
  },

  _toggleTitle: function () {
    this.link.title = this.options.title[this._map.isFullscreen()];
  }
});

leafletSrcExports.Map.include({
  isFullscreen: function () {
    return this._isFullscreen || false;
  },

  toggleFullscreen: function (options) {
    // <gcds-map> can contain a shadow root, so return it directly
    var mapEl = Util.getClosest(
      this.getContainer(),
      'gcds-map'
    );
    if (this.isFullscreen()) {
      if (options && options.pseudoFullscreen) {
        this._disablePseudoFullscreen(mapEl);
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else {
        this._disablePseudoFullscreen(mapEl);
      }
    } else {
      if (options && options.pseudoFullscreen) {
        this._enablePseudoFullscreen(mapEl);
      } else if (mapEl.requestFullscreen) {
        mapEl.requestFullscreen();
      } else if (mapEl.mozRequestFullScreen) {
        mapEl.mozRequestFullScreen();
      } else if (mapEl.webkitRequestFullscreen) {
        mapEl.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (mapEl.msRequestFullscreen) {
        mapEl.msRequestFullscreen();
      } else {
        this._enablePseudoFullscreen(mapEl);
      }
    }
    this.getContainer().focus();
  },

  _enablePseudoFullscreen: function (container) {
    leafletSrcExports.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
    this._setFullscreen(true);
    this.fire('fullscreenchange');
  },

  _disablePseudoFullscreen: function (container) {
    leafletSrcExports.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
    this._setFullscreen(false);
    this.fire('fullscreenchange');
  },

  _setFullscreen: function (fullscreen) {
    this._isFullscreen = fullscreen;
    var container = Util.getClosest(
      this.getContainer(),
      'gcds-map'
    );
    if (fullscreen) {
      leafletSrcExports.DomUtil.addClass(container, 'mapml-fullscreen-on');
    } else {
      leafletSrcExports.DomUtil.removeClass(container, 'mapml-fullscreen-on');
    }
    this.invalidateSize();
  },

  _onFullscreenChange: function (e) {
    var fullscreenElement = Util.getClosest(this.getContainer(), ':fullscreen'),
      mapEl = Util.getClosest(this.getContainer(), 'gcds-map');
    if (fullscreenElement === mapEl && !this._isFullscreen) {
      this._setFullscreen(true);
      this.fire('fullscreenchange');
    } else if (fullscreenElement !== mapEl && this._isFullscreen) {
      this._setFullscreen(false);
      this.fire('fullscreenchange');
    }
  }
});

leafletSrcExports.Map.mergeOptions({
  fullscreenControl: false
});

leafletSrcExports.Map.addInitHook(function () {
  if (this.options.fullscreenControl) {
    this.fullscreenControl = new FullscreenButton(
      this.options.fullscreenControl
    );
    this.addControl(this.fullscreenControl);
  }

  var fullscreenchange;

  if ('onfullscreenchange' in document) {
    fullscreenchange = 'fullscreenchange';
  } else if ('onmozfullscreenchange' in document) {
    fullscreenchange = 'mozfullscreenchange';
  } else if ('onwebkitfullscreenchange' in document) {
    fullscreenchange = 'webkitfullscreenchange';
  } else if ('onmsfullscreenchange' in document) {
    fullscreenchange = 'MSFullscreenChange';
  }

  if (fullscreenchange) {
    var onFullscreenChange = leafletSrcExports.Util.bind(this._onFullscreenChange, this);

    this.whenReady(function () {
      leafletSrcExports.DomEvent.on(document, fullscreenchange, onFullscreenChange);
    });

    this.on('unload', function () {
      leafletSrcExports.DomEvent.off(document, fullscreenchange, onFullscreenChange);
    });
  }
});

var fullscreenButton = function (options) {
  return new FullscreenButton(options);
};

var DebugOverlay = leafletSrcExports.Layer.extend({
  onAdd: function (map) {
    let mapSize = map.getSize();

    //conditionally show container for debug panel/banner only when the map has enough space for it
    if (mapSize.x > 400 || mapSize.y > 300) {
      this._container = leafletSrcExports.DomUtil.create('table', 'mapml-debug', map._container);

      this._panel = debugPanel({
        className: 'mapml-debug-panel',
        pane: this._container
      });
      map.addLayer(this._panel);
    }

    this._grid = debugGrid({
      className: 'mapml-debug-grid',
      pane: map._panes.mapPane,
      zIndex: 400,
      tileSize: map.options.crs.options.crs.tile.bounds.max.x
    });
    map.addLayer(this._grid);

    this._vectors = debugVectors({
      className: 'mapml-debug-vectors',
      pane: map._panes.mapPane,
      toolPane: this._container
    });
    map.addLayer(this._vectors);
  },

  onRemove: function (map) {
    map.removeLayer(this._grid);
    map.removeLayer(this._vectors);
    if (this._panel) {
      //conditionally remove the panel, as it's not always added
      map.removeLayer(this._panel);
      leafletSrcExports.DomUtil.remove(this._container);
    }
  }
});

var debugOverlay = function () {
  return new DebugOverlay();
};

var DebugPanel = leafletSrcExports.Layer.extend({
  initialize: function (options) {
    leafletSrcExports.setOptions(this, options);
  },

  onAdd: function (map) {
    this._title = leafletSrcExports.DomUtil.create(
      'caption',
      'mapml-debug-banner',
      this.options.pane
    );
    this._title.innerHTML = 'Debug mode';

    map.debug = {};
    map.debug._infoContainer = this._debugContainer = leafletSrcExports.DomUtil.create(
      'tbody',
      'mapml-debug-panel',
      this.options.pane
    );

    let infoContainer = map.debug._infoContainer;

    map.debug._tileCoord = leafletSrcExports.DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._tileMatrixCoord = leafletSrcExports.DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._mapCoord = leafletSrcExports.DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._tcrsCoord = leafletSrcExports.DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._pcrsCoord = leafletSrcExports.DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._gcrsCoord = leafletSrcExports.DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );

    this._map.on('mousemove', this._updateCoords);
  },
  onRemove: function () {
    leafletSrcExports.DomUtil.remove(this._title);
    if (this._debugContainer) {
      leafletSrcExports.DomUtil.remove(this._debugContainer);
      this._map.off('mousemove', this._updateCoords);
    }
  },
  _updateCoords: function (e) {
    if (this.contextMenu._visible) return;
    let mapEl = this.options.mapEl,
      pointCoords = mapEl._map.project(e.latlng),
      scale = mapEl._map.options.crs.scale(+mapEl.zoom),
      pcrs = mapEl._map.options.crs.transformation.untransform(
        pointCoords,
        scale
      ),
      tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
      pointI = pointCoords.x % tileSize,
      pointJ = pointCoords.y % tileSize;

    if (pointI < 0) pointI += tileSize;
    if (pointJ < 0) pointJ += tileSize;

    this.debug._tileCoord.innerHTML = `
      <th scope="row">tile: </th>
      <td>i: ${Math.trunc(pointI)}, </td>
      <td>j: ${Math.trunc(pointJ)}</td>
      `;
    this.debug._mapCoord.innerHTML = `
      <th scope="row">map: </th>
      <td>i: ${Math.trunc(e.containerPoint.x)}, </td>
      <td>j: ${Math.trunc(e.containerPoint.y)}</td>
      `;
    this.debug._gcrsCoord.innerHTML = `
      <th scope="row">gcrs: </th>
      <td>lon: ${e.latlng.lng.toFixed(6)}, </td>
      <td>lat: ${e.latlng.lat.toFixed(6)}</td>
      `;
    this.debug._tcrsCoord.innerHTML = `
      <th scope="row">tcrs: </th>
      <td>x: ${Math.trunc(pointCoords.x)}, </td>
      <td>y: ${Math.trunc(pointCoords.y)}</td>
      `;
    this.debug._tileMatrixCoord.innerHTML = `
      <th scope="row">tilematrix: </th>
      <td>column: ${Math.trunc(pointCoords.x / tileSize)}, </td>
      <td>row: ${Math.trunc(pointCoords.y / tileSize)}</td>
      `;
    this.debug._pcrsCoord.innerHTML = `
      <th scope="row">pcrs: </th>
      <td>easting: ${pcrs.x.toFixed(2)}, </td>
      <td>northing: ${pcrs.y.toFixed(2)}</td>
      `;
  }
});

var debugPanel = function (options) {
  return new DebugPanel(options);
};

var DebugGrid = leafletSrcExports.GridLayer.extend({
  initialize: function (options) {
    leafletSrcExports.setOptions(this, options);
    leafletSrcExports.GridLayer.prototype.initialize.call(this, this._map);
  },

  createTile: function (coords) {
    let tile = leafletSrcExports.DomUtil.create('div', 'mapml-debug-tile');
    tile.setAttribute('col', coords.x);
    tile.setAttribute('row', coords.y);
    tile.setAttribute('zoom', coords.z);
    tile.innerHTML = [
      `col: ${coords.x}`,
      `row: ${coords.y}`,
      `zoom: ${coords.z}`
    ].join(', ');

    tile.style.outline = '1px dashed red';
    return tile;
  }
});

var debugGrid = function (options) {
  return new DebugGrid(options);
};

var DebugVectors = leafletSrcExports.LayerGroup.extend({
  initialize: function (options) {
    leafletSrcExports.setOptions(this, options);
    leafletSrcExports.LayerGroup.prototype.initialize.call(this, this._map, options);
  },
  onAdd: function (map) {
    map.on('overlayremove', this._mapLayerUpdate, this);
    map.on('overlayadd', this._mapLayerUpdate, this);
    let center = map.options.crs.transformation.transform(
      leafletSrcExports.point(0, 0),
      map.options.crs.scale(0)
    );
    this._centerVector = leafletSrcExports.circle(map.options.crs.pointToLatLng(center, 0), {
      radius: 250,
      className: 'mapml-debug-vectors projection-centre'
    });
    this._centerVector.bindTooltip('Projection Center');

    this._addBounds(map);
  },
  onRemove: function (map) {
    this.clearLayers();
  },

  _addBounds: function (map) {
    // to delay the addBounds to wait for the layer.extentbounds / layer.layerbounds to be ready when the map-layer checked attribute is changed
    setTimeout(() => {
      let id = Object.keys(map._layers),
        layers = map._layers,
        colors = ['#FF5733', '#8DFF33', '#3397FF', '#E433FF', '#F3FF33'],
        j = 0;

      this.addLayer(this._centerVector);

      for (let i of id) {
        if (layers[i].layerBounds || layers[i].extentBounds) {
          let boundsArray;
          if (layers[i].layerBounds) {
            boundsArray = [
              layers[i].layerBounds.min,
              leafletSrcExports.point(layers[i].layerBounds.max.x, layers[i].layerBounds.min.y),
              layers[i].layerBounds.max,
              leafletSrcExports.point(layers[i].layerBounds.min.x, layers[i].layerBounds.max.y)
            ];
          } else {
            boundsArray = [
              layers[i].extentBounds.min,
              leafletSrcExports.point(layers[i].extentBounds.max.x, layers[i].extentBounds.min.y),
              layers[i].extentBounds.max,
              leafletSrcExports.point(layers[i].extentBounds.min.x, layers[i].extentBounds.max.y)
            ];
          }

          // boundsTestTag adds the value of from the <map-layer@data-testid> element
          // if it exists. this simplifies debugging because the svg path will be
          // tagged with the layer it came from
          let boundsTestTag =
            layers[i].extentBounds &&
            layers[i].options.linkEl.getLayerEl().hasAttribute('data-testid')
              ? layers[i].options.linkEl
                  .getLayerEl()
                  .getAttribute('data-testid')
              : layers[i].layerBounds &&
                layers[i].options?._leafletLayer?._layerEl?.hasAttribute(
                  'data-testid'
                )
              ? layers[i].options._leafletLayer._layerEl.getAttribute(
                  'data-testid'
                )
              : '';
          let boundsRect = projectedExtent(boundsArray, {
            className: this.options.className.concat(' ', boundsTestTag),
            color: colors[j % colors.length],
            weight: 2,
            opacity: 1,
            fillOpacity: 0.01,
            fill: true
          });
          if (layers[i].options._leafletLayer)
            boundsRect.bindTooltip(layers[i].options._leafletLayer._title, {
              sticky: true
            });
          this.addLayer(boundsRect);
          j++;
        }
      }

      if (map.totalLayerBounds) {
        let totalBoundsArray = [
          map.totalLayerBounds.min,
          leafletSrcExports.point(map.totalLayerBounds.max.x, map.totalLayerBounds.min.y),
          map.totalLayerBounds.max,
          leafletSrcExports.point(map.totalLayerBounds.min.x, map.totalLayerBounds.max.y)
        ];

        let totalBounds = projectedExtent(totalBoundsArray, {
          className: 'mapml-debug-vectors mapml-total-bounds',
          color: '#808080',
          weight: 5,
          opacity: 0.5,
          fill: false
        });
        this.addLayer(totalBounds);
      }
    }, 0);
  },

  _mapLayerUpdate: function (e) {
    this.clearLayers();
    this._addBounds(e.target);
  }
});

var debugVectors = function (options) {
  return new DebugVectors(options);
};

var ProjectedExtent = leafletSrcExports.Path.extend({
  getCenter: function (round) {
    let crs = this._map.options.crs;
    return crs.unproject(leafletSrcExports.bounds(this._locations).getCenter());
  },

  options: {
    className: 'mapml-debug-extent'
  },
  initialize: function (locations, options) {
    //locations passed in as pcrs coordinates
    this._locations = locations;
    leafletSrcExports.setOptions(this, options);
  },

  _project: function () {
    this._rings = [];
    let scale = this._map.options.crs.scale(this._map.getZoom()),
      map = this._map;
    for (let i = 0; i < this._locations.length; i++) {
      let pt0 = map.options.crs.transformation.transform(
        this._locations[i],
        scale
      );
      //substract the pixel origin from the pixel coordinates to get the location relative to map viewport
      this._rings.push(leafletSrcExports.point(pt0.x, pt0.y)._subtract(map.getPixelOrigin()));
    }
    //leaflet SVG renderer looks for and array of arrays to build polygons,
    //in this case it only deals with a rectangle so one closed array or points
    this._parts = [this._rings];
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updatePoly(this, true); //passing true creates a closed path i.e. a rectangle
  }
});

var projectedExtent = function (locations, options) {
  return new ProjectedExtent(locations, options);
};

var Crosshair = leafletSrcExports.Layer.extend({
  onAdd: function (map) {
    // SVG crosshair design from https://github.com/xguaita/Leaflet.MapCenterCoord/blob/master/src/icons/MapCenterCoordIcon1.svg?short_path=81a5c76
    // Optimized with SVGOMG: https://jakearchibald.github.io/svgomg/
    let svgInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 100 100"><g stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><circle cx="50.028" cy="50.219" r="3.923" stroke-width="2" color="currentColor" overflow="visible"/><path stroke-width="3" d="M4.973 54.424h31.768a4.204 4.204 0 1 0 0-8.409H4.973A4.203 4.203 0 0 0 .77 50.22a4.203 4.203 0 0 0 4.204 4.205z" color="currentColor" overflow="visible"/><path stroke-width="3" d="M54.232 5.165a4.204 4.204 0 1 0-8.408 0v31.767a4.204 4.204 0 1 0 8.408 0V5.165z"/><path stroke-width="3" d="M99.288 50.22a4.204 4.204 0 0 0-4.204-4.205H63.317a4.204 4.204 0 1 0 0 8.409h31.767a4.205 4.205 0 0 0 4.204-4.205zM45.823 95.274a4.204 4.204 0 1 0 8.409 0V63.506a4.204 4.204 0 1 0-8.409 0v31.768z" color="currentColor" overflow="visible"/></g></svg>`;

    this._container = leafletSrcExports.DomUtil.create('div', 'mapml-crosshair', map._container);
    this._container.innerHTML = svgInnerHTML;
    map.isFocused = false;
    this._isQueryable = false;

    map.on(
      'layerchange layeradd layerremove overlayremove',
      this._toggleEvents,
      this
    );
    map.on('popupopen', this._isMapFocused, this);
    leafletSrcExports.DomEvent.on(
      map._container,
      'keydown keyup mousedown',
      this._isMapFocused,
      this
    );

    this._addOrRemoveCrosshair();
  },

  onRemove: function (map) {
    map.off(
      'layerchange layeradd layerremove overlayremove',
      this._toggleEvents
    );
    map.off('popupopen', this._isMapFocused);
    leafletSrcExports.DomEvent.off(map._container, 'keydown keyup mousedown', this._isMapFocused);
  },

  _toggleEvents: function () {
    if (this._hasQueryableLayer()) {
      this._map.on('viewreset move moveend', this._addOrRemoveCrosshair, this);
    } else {
      this._map.off('viewreset move moveend', this._addOrRemoveCrosshair, this);
    }
    this._addOrRemoveCrosshair();
  },

  _addOrRemoveCrosshair: function (e) {
    if (this._hasQueryableLayer()) {
      this._container.removeAttribute('hidden');
    } else {
      this._container.setAttribute('hidden', '');
    }
  },

  _addOrRemoveMapOutline: function (e) {
    let mapContainer = this._map._container;
    if (this._map.isFocused && !this._outline) {
      this._outline = leafletSrcExports.DomUtil.create('div', 'mapml-outline', mapContainer);
    } else if (!this._map.isFocused && this._outline) {
      leafletSrcExports.DomUtil.remove(this._outline);
      delete this._outline;
    }
  },

  _hasQueryableLayer: function () {
    let layers = this._map.options.mapEl.layers;
    if (this._map.isFocused) {
      for (let layer of layers) {
        if (layer.queryable && layer.queryable()) {
          return true;
        }
      }
    }
    return false;
  },

  // TODO: should be merged with the 'mapfocused' event emitted by mapml-viewer and map, not trivial
  _isMapFocused: function (e) {
    //set this._map.isFocused = true if arrow buttons are used
    if (!this._map._container.parentNode.activeElement) {
      this._map.isFocused = false;
      return;
    }
    let isLeafletContainer =
      this._map._container.parentNode.activeElement.classList.contains(
        'leaflet-container'
      );
    if (
      isLeafletContainer &&
      ['keydown'].includes(e.type) &&
      e.shiftKey &&
      e.keyCode === 9
    ) {
      this._map.isFocused = false;
    } else
      this._map.isFocused =
        isLeafletContainer && ['keyup', 'keydown'].includes(e.type);

    if (this._map.isFocused) this._map.fire('mapkeyboardfocused');
    this._addOrRemoveMapOutline();
    this._addOrRemoveCrosshair();
  }
});

var crosshair = function (options) {
  return new Crosshair(options);
};

var FeatureIndexOverlay = leafletSrcExports.Layer.extend({
  onAdd: function (map) {
    let svgInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 100 100"><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M0 0h100v100H0z" color="#000" overflow="visible"/></svg>`;

    this._container = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-feature-index-box',
      map._container
    );
    this._container.innerHTML = svgInnerHTML;

    this._output = leafletSrcExports.DomUtil.create(
      'output',
      'mapml-feature-index',
      map._container
    );
    this._output.setAttribute('role', 'status');
    this._output.setAttribute('aria-live', 'polite');
    this._output.setAttribute('aria-atomic', 'true');
    this._body = leafletSrcExports.DomUtil.create(
      'span',
      'mapml-feature-index-content',
      this._output
    );
    this._body.index = 0;
    this._output.initialFocus = false;
    map.on('focus blur popupclose', this._addOrRemoveFeatureIndex, this);
    map.on('moveend focus templatedfeatureslayeradd', this._checkOverlap, this);
    map.on('keydown', this._onKeyDown, this);
    this._addOrRemoveFeatureIndex();
  },

  _calculateReticleBounds: function () {
    let bnds = this._map.getPixelBounds();
    let center = bnds.getCenter();
    let wRatio =
      Math.abs(bnds.min.x - bnds.max.x) / this._map.options.mapEl.width;
    let hRatio =
      Math.abs(bnds.min.y - bnds.max.y) / this._map.options.mapEl.height;

    let reticleDimension = getComputedStyle(this._container).width.replace(
      /[^\d.]/g,
      ''
    );
    if (getComputedStyle(this._container).width.slice(-1) === '%') {
      reticleDimension =
        (reticleDimension * this._map.options.mapEl.width) / 100;
    }
    let w = (wRatio * reticleDimension) / 2;
    let h = (hRatio * reticleDimension) / 2;
    let minPoint = leafletSrcExports.point(center.x - w, center.y + h);
    let maxPoint = leafletSrcExports.point(center.x + w, center.y - h);
    let b = leafletSrcExports.bounds(minPoint, maxPoint);
    return Util.pixelToPCRSBounds(
      b,
      this._map.getZoom(),
      this._map.options.projection
    );
  },

  _checkOverlap: function (e) {
    if (e.type === 'focus') this._output.initialFocus = true;
    if (!this._output.initialFocus) return;
    if (this._output.popupClosed) {
      this._output.popupClosed = false;
      return;
    }

    this._map.fire('mapkeyboardfocused');

    let featureIndexBounds = this._calculateReticleBounds();
    let features = this._map.featureIndex.inBoundFeatures;
    let index = 1;
    let keys = Object.keys(features);
    let body = this._body;
    let noFeaturesMessage = document.createElement('span');
    noFeaturesMessage.innerHTML =
      this._map.options.mapEl.locale.fIndexNoFeatures;

    body.innerHTML = '';
    body.index = 0;

    body.allFeatures = [];
    keys.forEach((i) => {
      let layer = features[i].layer;
      let layers = features[i].layer._layers;
      let b = leafletSrcExports.bounds();

      if (layers) {
        let keys = Object.keys(layers);
        keys.forEach((j) => {
          if (!b)
            b = leafletSrcExports.bounds(
              layer._layers[j]._bounds.min,
              layer._layers[j]._bounds.max
            );
          b.extend(layer._layers[j]._bounds.min);
          b.extend(layer._layers[j]._bounds.max);
        });
      } else if (layer._bounds) {
        b = leafletSrcExports.bounds(layer._bounds.min, layer._bounds.max);
      }

      if (featureIndexBounds.overlaps(b)) {
        let label = features[i].path.getAttribute('aria-label');

        if (index < 8) {
          body.appendChild(this._updateOutput(label, index, index));
        }
        if (index % 7 === 0 || index === 1) {
          body.allFeatures.push([]);
        }
        body.allFeatures[Math.floor((index - 1) / 7)].push({
          label,
          index,
          layer
        });
        if (body.allFeatures[1] && body.allFeatures[1].length === 1) {
          body.appendChild(this._updateOutput('More results', 0, 9));
        }
        index += 1;
      }
    });
    this._addToggleKeys();
    if (index === 1) {
      body.appendChild(noFeaturesMessage);
    }
  },

  _updateOutput: function (label, index, key) {
    let span = document.createElement('span');
    span.setAttribute('data-index', index);
    //", " adds a brief auditory pause when a screen reader is reading through the feature index
    //also prevents names with numbers + key from being combined when read
    span.innerHTML = `<kbd>${key}</kbd>` + ' ' + label + '<span>, </span>';
    return span;
  },

  _addToggleKeys: function () {
    let allFeatures = this._body.allFeatures;
    for (let i = 0; i < allFeatures.length; i++) {
      if (allFeatures[i].length === 0) return;
      if (allFeatures[i - 1]) {
        let label = 'Previous results';
        allFeatures[i].push({ label });
      }

      if (allFeatures[i + 1] && allFeatures[i + 1].length > 0) {
        let label = 'More results';
        allFeatures[i].push({ label });
      }
    }
  },

  _onKeyDown: function (e) {
    let body = this._body;
    let key = e.originalEvent.keyCode;
    if (key >= 49 && key <= 55) {
      if (!body.allFeatures[body.index]) return;
      let feature = body.allFeatures[body.index][key - 49];
      if (!feature) return;
      let layer = feature.layer;
      if (layer) {
        this._map.featureIndex.currentIndex = feature.index - 1;
        if (layer._popup) {
          this._map.closePopup();
          layer.openPopup();
        } else layer.options.group.focus();
      }
    } else if (key === 56) {
      this._newContent(body, -1);
    } else if (key === 57) {
      this._newContent(body, 1);
    }
  },

  _newContent: function (body, direction) {
    let index = body.firstChild.getAttribute('data-index');
    let newContent = body.allFeatures[Math.floor((index - 1) / 7 + direction)];
    if (newContent && newContent.length > 0) {
      body.innerHTML = '';
      body.index += direction;
      for (let i = 0; i < newContent.length; i++) {
        let feature = newContent[i];
        let index = feature.index ? feature.index : 0;
        let key = i + 1;
        if (feature.label === 'More results') key = 9;
        if (feature.label === 'Previous results') key = 8;
        body.appendChild(this._updateOutput(feature.label, index, key));
      }
    }
  },

  _addOrRemoveFeatureIndex: function (e) {
    //Toggle aria-hidden attribute so screen reader rereads the feature index on focus
    if (!this._output.initialFocus) {
      this._output.setAttribute('aria-hidden', 'true');
    } else if (this._output.hasAttribute('aria-hidden')) {
      let obj = this;
      setTimeout(function () {
        obj._output.removeAttribute('aria-hidden');
      }, 100);
    }

    if (e && e.type === 'popupclose') {
      this._output.setAttribute('aria-hidden', 'true');
      this._output.popupClosed = true;
    } else if (e && e.type === 'focus') {
      this._container.removeAttribute('hidden');
      this._output.classList.remove('mapml-screen-reader-output');
      // this is a very subtle branch.  The event that gets handled below is a blur
      // event, which happens to have the e.target._popup property
      // when there will be a popup.  Because blur gets handled here, it doesn't
      // get handled in the next else if block, which would hide both the reticle
      // and the index menu, and then recursively call this method with no event
      // argument, which manipulates the aria-hidden attribute on the output
      // in order to have the screenreader read its contents when the focus returns
      // to (what exactly???).
    } else if (e && e.target._popup) {
      this._container.setAttribute('hidden', '');
    } else if (e && e.type === 'blur') {
      this._container.setAttribute('hidden', '');
      this._output.classList.add('mapml-screen-reader-output');
      this._output.initialFocus = false;
      this._addOrRemoveFeatureIndex();
    } else {
      // this is the default block, called when no event is passed (recursive call)
      this._container.setAttribute('hidden', '');
      this._output.classList.add('mapml-screen-reader-output');
    }
  }
});

var featureIndexOverlay = function (options) {
  return new FeatureIndexOverlay(options);
};

const gcdsMapCss = "/*\n * GCDS Map Component CSS\n * \n * This file composes the complete map styling by importing:\n * 1. Leaflet core CSS (essential for map layout)\n * 2. Leaflet.locatecontrol CSS (geolocation control)\n * 3. Original MapML CSS (MapML-specific features)\n * 4. GCDS-specific overrides (design system integration)\n * \n * This mirrors the original mapml.js Gruntfile.js CSS composition.\n */\n\n/* Import Leaflet core CSS - ESSENTIAL for proper map display */\n/* required styles */\r\n\r\n.leaflet-pane,\r\n.leaflet-tile,\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow,\r\n.leaflet-tile-container,\r\n.leaflet-pane > svg,\r\n.leaflet-pane > canvas,\r\n.leaflet-zoom-box,\r\n.leaflet-image-layer,\r\n.leaflet-layer {\r\n\tposition: absolute;\r\n\tleft: 0;\r\n\ttop: 0;\r\n\t}\r\n.leaflet-container {\r\n\toverflow: hidden;\r\n\t}\r\n.leaflet-tile,\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow {\r\n\t-webkit-user-select: none;\r\n\t   -moz-user-select: none;\r\n\t        user-select: none;\r\n\t  -webkit-user-drag: none;\r\n\t}\r\n/* Prevents IE11 from highlighting tiles in blue */\r\n.leaflet-tile::selection {\r\n\tbackground: transparent;\r\n}\r\n/* Safari renders non-retina tile on retina better with this, but Chrome is worse */\r\n.leaflet-safari .leaflet-tile {\r\n\timage-rendering: -webkit-optimize-contrast;\r\n\t}\r\n/* hack that prevents hw layers \"stretching\" when loading new tiles */\r\n.leaflet-safari .leaflet-tile-container {\r\n\twidth: 1600px;\r\n\theight: 1600px;\r\n\t-webkit-transform-origin: 0 0;\r\n\t}\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow {\r\n\tdisplay: block;\r\n\t}\r\n/* .leaflet-container svg: reset svg max-width decleration shipped in Joomla! (joomla.org) 3.x */\r\n/* .leaflet-container img: map is broken in FF if you have max-width: 100% on tiles */\r\n.leaflet-container .leaflet-overlay-pane svg {\r\n\tmax-width: none !important;\r\n\tmax-height: none !important;\r\n\t}\r\n.leaflet-container .leaflet-marker-pane img,\r\n.leaflet-container .leaflet-shadow-pane img,\r\n.leaflet-container .leaflet-tile-pane img,\r\n.leaflet-container img.leaflet-image-layer,\r\n.leaflet-container .leaflet-tile {\r\n\tmax-width: none !important;\r\n\tmax-height: none !important;\r\n\twidth: auto;\r\n\tpadding: 0;\r\n\t}\r\n\r\n.leaflet-container img.leaflet-tile {\r\n\t/* See: https://bugs.chromium.org/p/chromium/issues/detail?id=600120 */\r\n\tmix-blend-mode: plus-lighter;\r\n}\r\n\r\n.leaflet-container.leaflet-touch-zoom {\r\n\t-ms-touch-action: pan-x pan-y;\r\n\ttouch-action: pan-x pan-y;\r\n\t}\r\n.leaflet-container.leaflet-touch-drag {\r\n\t-ms-touch-action: pinch-zoom;\r\n\t/* Fallback for FF which doesn't support pinch-zoom */\r\n\ttouch-action: none;\r\n\ttouch-action: pinch-zoom;\r\n}\r\n.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom {\r\n\t-ms-touch-action: none;\r\n\ttouch-action: none;\r\n}\r\n.leaflet-container {\r\n\t-webkit-tap-highlight-color: transparent;\r\n}\r\n.leaflet-container a {\r\n\t-webkit-tap-highlight-color: rgba(51, 181, 229, 0.4);\r\n}\r\n.leaflet-tile {\r\n\tfilter: inherit;\r\n\tvisibility: hidden;\r\n\t}\r\n.leaflet-tile-loaded {\r\n\tvisibility: inherit;\r\n\t}\r\n.leaflet-zoom-box {\r\n\twidth: 0;\r\n\theight: 0;\r\n\t-moz-box-sizing: border-box;\r\n\t     box-sizing: border-box;\r\n\tz-index: 800;\r\n\t}\r\n/* workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=888319 */\r\n.leaflet-overlay-pane svg {\r\n\t-moz-user-select: none;\r\n\t}\r\n\r\n.leaflet-pane         { z-index: 400; }\r\n\r\n.leaflet-tile-pane    { z-index: 200; }\r\n.leaflet-overlay-pane { z-index: 400; }\r\n.leaflet-shadow-pane  { z-index: 500; }\r\n.leaflet-marker-pane  { z-index: 600; }\r\n.leaflet-tooltip-pane   { z-index: 650; }\r\n.leaflet-popup-pane   { z-index: 700; }\r\n\r\n.leaflet-map-pane canvas { z-index: 100; }\r\n.leaflet-map-pane svg    { z-index: 200; }\r\n\r\n.leaflet-vml-shape {\r\n\twidth: 1px;\r\n\theight: 1px;\r\n\t}\r\n.lvml {\r\n\tbehavior: url(#default#VML);\r\n\tdisplay: inline-block;\r\n\tposition: absolute;\r\n\t}\r\n\r\n\r\n/* control positioning */\r\n\r\n.leaflet-control {\r\n\tposition: relative;\r\n\tz-index: 800;\r\n\tpointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\r\n\tpointer-events: auto;\r\n\t}\r\n.leaflet-top,\r\n.leaflet-bottom {\r\n\tposition: absolute;\r\n\tz-index: 1000;\r\n\tpointer-events: none;\r\n\t}\r\n.leaflet-top {\r\n\ttop: 0;\r\n\t}\r\n.leaflet-right {\r\n\tright: 0;\r\n\t}\r\n.leaflet-bottom {\r\n\tbottom: 0;\r\n\t}\r\n.leaflet-left {\r\n\tleft: 0;\r\n\t}\r\n.leaflet-control {\r\n\tfloat: left;\r\n\tclear: both;\r\n\t}\r\n.leaflet-right .leaflet-control {\r\n\tfloat: right;\r\n\t}\r\n.leaflet-top .leaflet-control {\r\n\tmargin-top: 10px;\r\n\t}\r\n.leaflet-bottom .leaflet-control {\r\n\tmargin-bottom: 10px;\r\n\t}\r\n.leaflet-left .leaflet-control {\r\n\tmargin-left: 10px;\r\n\t}\r\n.leaflet-right .leaflet-control {\r\n\tmargin-right: 10px;\r\n\t}\r\n\r\n\r\n/* zoom and fade animations */\r\n\r\n.leaflet-fade-anim .leaflet-popup {\r\n\topacity: 0;\r\n\t-webkit-transition: opacity 0.2s linear;\r\n\t   -moz-transition: opacity 0.2s linear;\r\n\t        transition: opacity 0.2s linear;\r\n\t}\r\n.leaflet-fade-anim .leaflet-map-pane .leaflet-popup {\r\n\topacity: 1;\r\n\t}\r\n.leaflet-zoom-animated {\r\n\t-webkit-transform-origin: 0 0;\r\n\t    -ms-transform-origin: 0 0;\r\n\t        transform-origin: 0 0;\r\n\t}\r\nsvg.leaflet-zoom-animated {\r\n\twill-change: transform;\r\n}\r\n\r\n.leaflet-zoom-anim .leaflet-zoom-animated {\r\n\t-webkit-transition: -webkit-transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t   -moz-transition:    -moz-transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t        transition:         transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t}\r\n.leaflet-zoom-anim .leaflet-tile,\r\n.leaflet-pan-anim .leaflet-tile {\r\n\t-webkit-transition: none;\r\n\t   -moz-transition: none;\r\n\t        transition: none;\r\n\t}\r\n\r\n.leaflet-zoom-anim .leaflet-zoom-hide {\r\n\tvisibility: hidden;\r\n\t}\r\n\r\n\r\n/* cursors */\r\n\r\n.leaflet-interactive {\r\n\tcursor: pointer;\r\n\t}\r\n.leaflet-grab {\r\n\tcursor: -webkit-grab;\r\n\tcursor:    -moz-grab;\r\n\tcursor:         grab;\r\n\t}\r\n.leaflet-crosshair,\r\n.leaflet-crosshair .leaflet-interactive {\r\n\tcursor: crosshair;\r\n\t}\r\n.leaflet-popup-pane,\r\n.leaflet-control {\r\n\tcursor: auto;\r\n\t}\r\n.leaflet-dragging .leaflet-grab,\r\n.leaflet-dragging .leaflet-grab .leaflet-interactive,\r\n.leaflet-dragging .leaflet-marker-draggable {\r\n\tcursor: move;\r\n\tcursor: -webkit-grabbing;\r\n\tcursor:    -moz-grabbing;\r\n\tcursor:         grabbing;\r\n\t}\r\n\r\n/* marker & overlays interactivity */\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow,\r\n.leaflet-image-layer,\r\n.leaflet-pane > svg path,\r\n.leaflet-tile-container {\r\n\tpointer-events: none;\r\n\t}\r\n\r\n.leaflet-marker-icon.leaflet-interactive,\r\n.leaflet-image-layer.leaflet-interactive,\r\n.leaflet-pane > svg path.leaflet-interactive,\r\nsvg.leaflet-image-layer.leaflet-interactive path {\r\n\tpointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\r\n\tpointer-events: auto;\r\n\t}\r\n\r\n/* visual tweaks */\r\n\r\n.leaflet-container {\r\n\tbackground: #ddd;\r\n\toutline-offset: 1px;\r\n\t}\r\n.leaflet-container a {\r\n\tcolor: #0078A8;\r\n\t}\r\n.leaflet-zoom-box {\r\n\tborder: 2px dotted #38f;\r\n\tbackground: rgba(255,255,255,0.5);\r\n\t}\r\n\r\n\r\n/* general typography */\r\n.leaflet-container {\r\n\tfont-family: \"Helvetica Neue\", Arial, Helvetica, sans-serif;\r\n\tfont-size: 12px;\r\n\tfont-size: 0.75rem;\r\n\tline-height: 1.5;\r\n\t}\r\n\r\n\r\n/* general toolbar styles */\r\n\r\n.leaflet-bar {\r\n\tbox-shadow: 0 1px 5px rgba(0,0,0,0.65);\r\n\tborder-radius: 4px;\r\n\t}\r\n.leaflet-bar a {\r\n\tbackground-color: #fff;\r\n\tborder-bottom: 1px solid #ccc;\r\n\twidth: 26px;\r\n\theight: 26px;\r\n\tline-height: 26px;\r\n\tdisplay: block;\r\n\ttext-align: center;\r\n\ttext-decoration: none;\r\n\tcolor: black;\r\n\t}\r\n.leaflet-bar a,\r\n.leaflet-control-layers-toggle {\r\n\tbackground-position: 50% 50%;\r\n\tbackground-repeat: no-repeat;\r\n\tdisplay: block;\r\n\t}\r\n.leaflet-bar a:hover,\r\n.leaflet-bar a:focus {\r\n\tbackground-color: #f4f4f4;\r\n\t}\r\n.leaflet-bar a:first-child {\r\n\tborder-top-left-radius: 4px;\r\n\tborder-top-right-radius: 4px;\r\n\t}\r\n.leaflet-bar a:last-child {\r\n\tborder-bottom-left-radius: 4px;\r\n\tborder-bottom-right-radius: 4px;\r\n\tborder-bottom: none;\r\n\t}\r\n.leaflet-bar a.leaflet-disabled {\r\n\tcursor: default;\r\n\tbackground-color: #f4f4f4;\r\n\tcolor: #bbb;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-bar a {\r\n\twidth: 30px;\r\n\theight: 30px;\r\n\tline-height: 30px;\r\n\t}\r\n.leaflet-touch .leaflet-bar a:first-child {\r\n\tborder-top-left-radius: 2px;\r\n\tborder-top-right-radius: 2px;\r\n\t}\r\n.leaflet-touch .leaflet-bar a:last-child {\r\n\tborder-bottom-left-radius: 2px;\r\n\tborder-bottom-right-radius: 2px;\r\n\t}\r\n\r\n/* zoom control */\r\n\r\n.leaflet-control-zoom-in,\r\n.leaflet-control-zoom-out {\r\n\tfont: bold 18px 'Lucida Console', Monaco, monospace;\r\n\ttext-indent: 1px;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out  {\r\n\tfont-size: 22px;\r\n\t}\r\n\r\n\r\n/* layers control */\r\n\r\n.leaflet-control-layers {\r\n\tbox-shadow: 0 1px 5px rgba(0,0,0,0.4);\r\n\tbackground: #fff;\r\n\tborder-radius: 5px;\r\n\t}\r\n.leaflet-control-layers-toggle {\r\n\tbackground-image: url(images/layers.png);\r\n\twidth: 36px;\r\n\theight: 36px;\r\n\t}\r\n.leaflet-retina .leaflet-control-layers-toggle {\r\n\tbackground-image: url(images/layers-2x.png);\r\n\tbackground-size: 26px 26px;\r\n\t}\r\n.leaflet-touch .leaflet-control-layers-toggle {\r\n\twidth: 44px;\r\n\theight: 44px;\r\n\t}\r\n.leaflet-control-layers .leaflet-control-layers-list,\r\n.leaflet-control-layers-expanded .leaflet-control-layers-toggle {\r\n\tdisplay: none;\r\n\t}\r\n.leaflet-control-layers-expanded .leaflet-control-layers-list {\r\n\tdisplay: block;\r\n\tposition: relative;\r\n\t}\r\n.leaflet-control-layers-expanded {\r\n\tpadding: 6px 10px 6px 6px;\r\n\tcolor: #333;\r\n\tbackground: #fff;\r\n\t}\r\n.leaflet-control-layers-scrollbar {\r\n\toverflow-y: scroll;\r\n\toverflow-x: hidden;\r\n\tpadding-right: 5px;\r\n\t}\r\n.leaflet-control-layers-selector {\r\n\tmargin-top: 2px;\r\n\tposition: relative;\r\n\ttop: 1px;\r\n\t}\r\n.leaflet-control-layers label {\r\n\tdisplay: block;\r\n\tfont-size: 13px;\r\n\tfont-size: 1.08333em;\r\n\t}\r\n.leaflet-control-layers-separator {\r\n\theight: 0;\r\n\tborder-top: 1px solid #ddd;\r\n\tmargin: 5px -10px 5px -6px;\r\n\t}\r\n\r\n/* Default icon URLs */\r\n.leaflet-default-icon-path { /* used only in path-guessing heuristic, see L.Icon.Default */\r\n\tbackground-image: url(images/marker-icon.png);\r\n\t}\r\n\r\n\r\n/* attribution and scale controls */\r\n\r\n.leaflet-container .leaflet-control-attribution {\r\n\tbackground: #fff;\r\n\tbackground: rgba(255, 255, 255, 0.8);\r\n\tmargin: 0;\r\n\t}\r\n.leaflet-control-attribution,\r\n.leaflet-control-scale-line {\r\n\tpadding: 0 5px;\r\n\tcolor: #333;\r\n\tline-height: 1.4;\r\n\t}\r\n.leaflet-control-attribution a {\r\n\ttext-decoration: none;\r\n\t}\r\n.leaflet-control-attribution a:hover,\r\n.leaflet-control-attribution a:focus {\r\n\ttext-decoration: underline;\r\n\t}\r\n.leaflet-attribution-flag {\r\n\tdisplay: inline !important;\r\n\tvertical-align: baseline !important;\r\n\twidth: 1em;\r\n\theight: 0.6669em;\r\n\t}\r\n.leaflet-left .leaflet-control-scale {\r\n\tmargin-left: 5px;\r\n\t}\r\n.leaflet-bottom .leaflet-control-scale {\r\n\tmargin-bottom: 5px;\r\n\t}\r\n.leaflet-control-scale-line {\r\n\tborder: 2px solid #777;\r\n\tborder-top: none;\r\n\tline-height: 1.1;\r\n\tpadding: 2px 5px 1px;\r\n\twhite-space: nowrap;\r\n\t-moz-box-sizing: border-box;\r\n\t     box-sizing: border-box;\r\n\tbackground: rgba(255, 255, 255, 0.8);\r\n\ttext-shadow: 1px 1px #fff;\r\n\t}\r\n.leaflet-control-scale-line:not(:first-child) {\r\n\tborder-top: 2px solid #777;\r\n\tborder-bottom: none;\r\n\tmargin-top: -2px;\r\n\t}\r\n.leaflet-control-scale-line:not(:first-child):not(:last-child) {\r\n\tborder-bottom: 2px solid #777;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-control-attribution,\r\n.leaflet-touch .leaflet-control-layers,\r\n.leaflet-touch .leaflet-bar {\r\n\tbox-shadow: none;\r\n\t}\r\n.leaflet-touch .leaflet-control-layers,\r\n.leaflet-touch .leaflet-bar {\r\n\tborder: 2px solid rgba(0,0,0,0.2);\r\n\tbackground-clip: padding-box;\r\n\t}\r\n\r\n\r\n/* popup */\r\n\r\n.leaflet-popup {\r\n\tposition: absolute;\r\n\ttext-align: center;\r\n\tmargin-bottom: 20px;\r\n\t}\r\n.leaflet-popup-content-wrapper {\r\n\tpadding: 1px;\r\n\ttext-align: left;\r\n\tborder-radius: 12px;\r\n\t}\r\n.leaflet-popup-content {\r\n\tmargin: 13px 24px 13px 20px;\r\n\tline-height: 1.3;\r\n\tfont-size: 13px;\r\n\tfont-size: 1.08333em;\r\n\tmin-height: 1px;\r\n\t}\r\n.leaflet-popup-content p {\r\n\tmargin: 17px 0;\r\n\tmargin: 1.3em 0;\r\n\t}\r\n.leaflet-popup-tip-container {\r\n\twidth: 40px;\r\n\theight: 20px;\r\n\tposition: absolute;\r\n\tleft: 50%;\r\n\tmargin-top: -1px;\r\n\tmargin-left: -20px;\r\n\toverflow: hidden;\r\n\tpointer-events: none;\r\n\t}\r\n.leaflet-popup-tip {\r\n\twidth: 17px;\r\n\theight: 17px;\r\n\tpadding: 1px;\r\n\r\n\tmargin: -10px auto 0;\r\n\tpointer-events: auto;\r\n\r\n\t-webkit-transform: rotate(45deg);\r\n\t   -moz-transform: rotate(45deg);\r\n\t    -ms-transform: rotate(45deg);\r\n\t        transform: rotate(45deg);\r\n\t}\r\n.leaflet-popup-content-wrapper,\r\n.leaflet-popup-tip {\r\n\tbackground: white;\r\n\tcolor: #333;\r\n\tbox-shadow: 0 3px 14px rgba(0,0,0,0.4);\r\n\t}\r\n.leaflet-container a.leaflet-popup-close-button {\r\n\tposition: absolute;\r\n\ttop: 0;\r\n\tright: 0;\r\n\tborder: none;\r\n\ttext-align: center;\r\n\twidth: 24px;\r\n\theight: 24px;\r\n\tfont: 16px/24px Tahoma, Verdana, sans-serif;\r\n\tcolor: #757575;\r\n\ttext-decoration: none;\r\n\tbackground: transparent;\r\n\t}\r\n.leaflet-container a.leaflet-popup-close-button:hover,\r\n.leaflet-container a.leaflet-popup-close-button:focus {\r\n\tcolor: #585858;\r\n\t}\r\n.leaflet-popup-scrolled {\r\n\toverflow: auto;\r\n\t}\r\n\r\n.leaflet-oldie .leaflet-popup-content-wrapper {\r\n\t-ms-zoom: 1;\r\n\t}\r\n.leaflet-oldie .leaflet-popup-tip {\r\n\twidth: 24px;\r\n\tmargin: 0 auto;\r\n\r\n\t-ms-filter: \"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)\";\r\n\tfilter: progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678);\r\n\t}\r\n\r\n.leaflet-oldie .leaflet-control-zoom,\r\n.leaflet-oldie .leaflet-control-layers,\r\n.leaflet-oldie .leaflet-popup-content-wrapper,\r\n.leaflet-oldie .leaflet-popup-tip {\r\n\tborder: 1px solid #999;\r\n\t}\r\n\r\n\r\n/* div icon */\r\n\r\n.leaflet-div-icon {\r\n\tbackground: #fff;\r\n\tborder: 1px solid #666;\r\n\t}\r\n\r\n\r\n/* Tooltip */\r\n/* Base styles for the element that has a tooltip */\r\n.leaflet-tooltip {\r\n\tposition: absolute;\r\n\tpadding: 6px;\r\n\tbackground-color: #fff;\r\n\tborder: 1px solid #fff;\r\n\tborder-radius: 3px;\r\n\tcolor: #222;\r\n\twhite-space: nowrap;\r\n\t-webkit-user-select: none;\r\n\t-moz-user-select: none;\r\n\t-ms-user-select: none;\r\n\tuser-select: none;\r\n\tpointer-events: none;\r\n\tbox-shadow: 0 1px 3px rgba(0,0,0,0.4);\r\n\t}\r\n.leaflet-tooltip.leaflet-interactive {\r\n\tcursor: pointer;\r\n\tpointer-events: auto;\r\n\t}\r\n.leaflet-tooltip-top:before,\r\n.leaflet-tooltip-bottom:before,\r\n.leaflet-tooltip-left:before,\r\n.leaflet-tooltip-right:before {\r\n\tposition: absolute;\r\n\tpointer-events: none;\r\n\tborder: 6px solid transparent;\r\n\tbackground: transparent;\r\n\tcontent: \"\";\r\n\t}\r\n\r\n/* Directions */\r\n\r\n.leaflet-tooltip-bottom {\r\n\tmargin-top: 6px;\r\n}\r\n.leaflet-tooltip-top {\r\n\tmargin-top: -6px;\r\n}\r\n.leaflet-tooltip-bottom:before,\r\n.leaflet-tooltip-top:before {\r\n\tleft: 50%;\r\n\tmargin-left: -6px;\r\n\t}\r\n.leaflet-tooltip-top:before {\r\n\tbottom: 0;\r\n\tmargin-bottom: -12px;\r\n\tborder-top-color: #fff;\r\n\t}\r\n.leaflet-tooltip-bottom:before {\r\n\ttop: 0;\r\n\tmargin-top: -12px;\r\n\tmargin-left: -6px;\r\n\tborder-bottom-color: #fff;\r\n\t}\r\n.leaflet-tooltip-left {\r\n\tmargin-left: -6px;\r\n}\r\n.leaflet-tooltip-right {\r\n\tmargin-left: 6px;\r\n}\r\n.leaflet-tooltip-left:before,\r\n.leaflet-tooltip-right:before {\r\n\ttop: 50%;\r\n\tmargin-top: -6px;\r\n\t}\r\n.leaflet-tooltip-left:before {\r\n\tright: 0;\r\n\tmargin-right: -12px;\r\n\tborder-left-color: #fff;\r\n\t}\r\n.leaflet-tooltip-right:before {\r\n\tleft: 0;\r\n\tmargin-left: -12px;\r\n\tborder-right-color: #fff;\r\n\t}\r\n\r\n/* Printing */\r\n\r\n@media print {\r\n\t/* Prevent printers from removing background-images of controls. */\r\n\t.leaflet-control {\r\n\t\t-webkit-print-color-adjust: exact;\r\n\t\tprint-color-adjust: exact;\r\n\t\t}\r\n\t}\r\n\n\n/* Import Leaflet locate control CSS */\n.leaflet-control-locate a {\n  cursor: pointer;\n}\n.leaflet-control-locate a .leaflet-control-locate-location-arrow {\n  display: inline-block;\n  width: 16px;\n  height: 16px;\n  margin: 7px;\n  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"black\" d=\"M445 4 29 195c-48 23-32 93 19 93h176v176c0 51 70 67 93 19L508 67c16-38-25-79-63-63z\"/></svg>');\n}\n.leaflet-control-locate a .leaflet-control-locate-spinner {\n  display: inline-block;\n  width: 16px;\n  height: 16px;\n  margin: 7px;\n  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"black\" d=\"M304 48a48 48 0 1 1-96 0 48 48 0 0 1 96 0zm-48 368a48 48 0 1 0 0 96 48 48 0 0 0 0-96zm208-208a48 48 0 1 0 0 96 48 48 0 0 0 0-96zM96 256a48 48 0 1 0-96 0 48 48 0 0 0 96 0zm13 99a48 48 0 1 0 0 96 48 48 0 0 0 0-96zm294 0a48 48 0 1 0 0 96 48 48 0 0 0 0-96zM109 61a48 48 0 1 0 0 96 48 48 0 0 0 0-96z\"/></svg>');\n  animation: leaflet-control-locate-spin 2s linear infinite;\n}\n.leaflet-control-locate.active a .leaflet-control-locate-location-arrow {\n  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"rgb(32, 116, 182)\" d=\"M445 4 29 195c-48 23-32 93 19 93h176v176c0 51 70 67 93 19L508 67c16-38-25-79-63-63z\"/></svg>');\n}\n.leaflet-control-locate.following a .leaflet-control-locate-location-arrow {\n  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"rgb(252, 132, 40)\" d=\"M445 4 29 195c-48 23-32 93 19 93h176v176c0 51 70 67 93 19L508 67c16-38-25-79-63-63z\"/></svg>');\n}\n\n.leaflet-touch .leaflet-bar .leaflet-locate-text-active {\n  width: 100%;\n  max-width: 200px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  padding: 0 10px;\n}\n.leaflet-touch .leaflet-bar .leaflet-locate-text-active .leaflet-locate-icon {\n  padding: 0 5px 0 0;\n}\n\n.leaflet-control-locate-location circle {\n  animation: leaflet-control-locate-throb 4s ease infinite;\n}\n\n@keyframes leaflet-control-locate-throb {\n  0% {\n    stroke-width: 1;\n  }\n  50% {\n    stroke-width: 3;\n    transform: scale(0.8, 0.8);\n  }\n  100% {\n    stroke-width: 1;\n  }\n}\n@keyframes leaflet-control-locate-spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n/*# sourceMappingURL=L.Control.Locate.css.map */\n\n\n/* copy of original mapml.css from MapML.js submodule */\n\n.leaflet-container {\n  /* Override the `background-color` set by leaflet.css, enables inheritance from\n     the map or <body> element (same as iframes) to give the author more control. */\n  background-color: transparent;\n  max-height: 100%;\n  max-width: 100%;\n  min-height: 100%;\n  min-width: 100%;\n  width: 100% !important;\n  height: 100% !important;\n}\n\n/* this is required by tiles which are actually divs with multiple images in them */\n.leaflet-tile img {\n        position: absolute;\n        left: 0;\n        top: 0;\n\t}\n/* MapML treats images like map layers, so far as fade animation is concerned */\n.leaflet-fade-anim .leaflet-image-layer {\n        will-change: opacity;\n\t}\n        \n.leaflet-image-layer {\n        visibility: hidden;\n}\n.leaflet-image-loaded {\n        visibility: inherit;\n}\n\n/* Use legible font-sizes (Leaflet upstream PR: https://github.com/Leaflet/Leaflet/pull/7346). */\n.leaflet-control-scale-line,\n.leaflet-container .leaflet-control-scale,\n.leaflet-container .leaflet-control-attribution {\n  font-size: 12px;\n}\n\n/*\n * Controls.\n */\n.leaflet-container {\n    container: leafletmap / size;\n} \n/* Scale bar */\n .mapml-control-scale {\n  bottom: 8px; /* Make room for map-a links */\n  left: 0px; \n}\n@container leafletmap (max-height: 250px) {\n    .mapml-control-scale {\n        left: 45px; \n    }\n}\n\n/* for extents that don't overlap the viewport, the  extent and it's layer\ncontrol fieldset become disabled.  The descendant fieldsets also become \ndisabled (but they / their descendant content are not explicitly italicized by \nthe browser)' */\n.leaflet-control-layers-overlays fieldset:disabled span.mapml-layer-item-name {\n    font-style: italic;\n}\n\n /* Generic class for seamless buttons */\n .mapml-button {\n  background-color: transparent;\n  border: none;\n  border-radius: 0;\n  color: inherit;\n  font: inherit;\n  line-height: inherit;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n  text-align: inherit;\n  text-transform: none;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n\n/* Remove opinionated link colors set by Leaflet. */\n.leaflet-container a {\n  color: revert;\n}\n/* Don't use UA styles for links that are controls\n  (and don't inherit color from map into the reload button for consistency). */\n.mapml-reload-button,\n.leaflet-control-container a,\n.leaflet-container a.leaflet-popup-close-button,\n.leaflet-container a.leaflet-popup-close-button:hover {\n  color: #000;\n}\n/* Revert above `color: #000` for legendlinks. */\n.mapml-layer-item-name a {\n  color: revert;\n}\n\n .leaflet-top .leaflet-control {\n   margin-top: 5px;\n }\n \n .leaflet-left .leaflet-control {\n   margin-left: 5px;\n }\n\n.leaflet-bar a,\n.mapml-reload-button {\n  background-color: #fff;\n  box-sizing: border-box;\n  width: 44px !important;\n  height: 44px !important;\n  line-height: 44px !important;\n  font-size: 34px !important;\n  font-weight: normal;\n  text-align: center;\n}\n\n.mapml-reload-button:hover,\n.mapml-reload-button[aria-disabled=\"true\"] {\n  background-color: #f4f4f4;\n}\n\n.mapml-reload-button[aria-disabled=\"true\"] {\n  cursor: default;\n}\n\nbutton.mapml-button:disabled,\n.mapml-button[aria-disabled=\"true\"] {\n  color: #bbb;\n}\n\nbutton.mapml-contextmenu-item:disabled {\n  opacity: .3;\n}\n\n.leaflet-control-layers-toggle {\n  width: 44px !important;\n  height: 44px !important;\n}\n\n.leaflet-bar a,\n.leaflet-control-layers,\n.mapml-reload-button {\n  border-color: #e3e3e3 !important;\n}\n\n.leaflet-control-layers,\n.mapml-reload-button {\n  border-radius: 4px !important;\n}\n.leaflet-touch .leaflet-bar a:last-child {\n  border-bottom-left-radius: 4px !important;\n  border-bottom-right-radius: 4px !important;\n}\n.leaflet-touch .leaflet-bar a:first-child {\n  border-top-left-radius: 4px !important;\n  border-top-right-radius: 4px !important;\n}\n.leaflet-touch .leaflet-control-layers,\n.leaflet-touch .leaflet-bar {\n  border-style: inherit;\n}\n\n/* Less opinionated box-shadows. */\n.mapml-contextmenu,\n.mapml-debug,\n.leaflet-bar,\n.leaflet-control-layers,\n.leaflet-popup-content-wrapper,\n.leaflet-tooltip-pane .leaflet-tooltip,\n.leaflet-touch .leaflet-control-layers,\n.leaflet-touch .leaflet-bar,\n.leaflet-popup-tip,\n.leaflet-container .leaflet-control-attribution {\n  box-shadow: rgb(0 0 0 / 30%) 0px 1px 4px -1px;\n}\n\n/* Remove opinionated styles of attribution links. */\n.leaflet-control-attribution a {\n  color: revert;\n  text-decoration: revert;\n}\n\n\n/*\n * Attribution.\n */\n\n.leaflet-container .leaflet-control-attribution {\n  background-color: #fff;\n  border-radius: 1.5em;\n  color: currentColor;\n  margin: 5px;\n  min-height: 30px;\n  min-width: 30px;\n  padding: 0;\n}\n\n.leaflet-control-attribution summary {\n  display: block;\n  list-style: none;\n  border-radius: 100%;\n  position: absolute;\n  bottom: 0;\n  left: calc(100% - 30px);\n  line-height: 0;\n  width: 30px;\n  height: 30px;\n}\n\n.leaflet-control-attribution summary svg {\n  border-radius: 100%;\n  width: inherit;\n  height: inherit;\n}\n\n.mapml-attribution-container {\n  padding: 5px 35px 5px 10px;\n}\n\n/*\n * Zoom controls.\n */\n\n.leaflet-control-zoom-in,\n.leaflet-control-zoom-out {\n  text-indent: unset;\n}\n\n/*\n * Fullscreen control. Image contains the on and off images, toggled via\n * the background-position property\n */\n\n.leaflet-control-fullscreen a {  \n  background-image: url(\"data:image/svg+xml,%0A%3Csvg width='26' height='52' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cg transform='translate(0 -1000.4)'%3E%3Cuse transform='translate(0 26)' width='100%25' height='100%25' xlink:href='%23a'/%3E%3Cuse transform='translate(0 26)' width='100%25' height='100%25' xlink:href='%23b'/%3E%3Cuse transform='translate(0 26)' width='100%25' height='100%25' xlink:href='%23c'/%3E%3Cuse transform='translate(0 26)' width='100%25' height='100%25' xlink:href='%23d'/%3E%3Cpath id='a' transform='translate(0 1000.4)' d='M5 15v6h6v-2H7v-4z' color='%23000' fill='%23404040'/%3E%3Cpath id='b' transform='translate(0 1000.4)' d='M21 15v6h-6v-2h4v-4z' color='%23000' fill='%23404040'/%3E%3Cpath d='M10 1037.4v4l1 1h4l1-1v-4l-1-1h-4z' color='%23000' fill='%23404040'/%3E%3Cpath id='d' d='M5 1011.4v-6h6v2H7v4z' color='%23000' fill='%23404040'/%3E%3Cpath id='c' d='M21 1011.4v-6h-6v2h4v4z' color='%23000' fill='%23404040'/%3E%3C/g%3E%3C/svg%3E\");\n  background-repeat: no-repeat;\n  background-size: 38px 76px;\n  background-position: 3px 3px;\n}\n\n/*\n* See: https://developer.mozilla.org/en-US/docs/Web/CSS/:host_function\nand: https://developer.mozilla.org/en-US/docs/Web/CSS/:fullscreen */\n:host(:fullscreen) .leaflet-control-fullscreen a {\n  background-position: 3px -35px;\n}\n\n:host(:-webkit-full-screen) {\n  width: 100%!important;\n  height: 100%!important;\n}\n\n:host(.leaflet-pseudo-fullscreen) {\n  position: fixed!important;\n  width: 100%!important;\n  height: 100%!important;\n  top: 0!important;\n  left: 0!important;\n  z-index: 99999;\n}\n\n/*\n * Layer controls.\n */\n\n.leaflet-control-layers.leaflet-control {\n  margin-right: 5px;\n  margin-left: 5px;\n  padding: 0;\n}\n\n.leaflet-control-layers-list {\n  padding: 0;\n}\n\n.leaflet-control-layers fieldset {\n  margin: 0;\n  padding: 0;\n  min-height: 44px;\n}\n\n.leaflet-control-layers label {\n  display: inline;\n}\n\n.mapml-control-layers > :not(summary) {\n  display: block;\n  margin-block-start: 5px;\n  margin-inline-start: 15px;\n  width: calc(100% - 15px);\n}\n\n.mapml-layer-item-style > div {\n  display: flex;\n}\n\n.mapml-layer-item-style input {\n  margin-inline-start: 0;\n}\n\n.leaflet-control .leaflet-control-layers-toggle {\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='m11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z'/%3E%3C/svg%3E\");\n  background-size: 34px;\n}\n\n/* Revert Leaflet styles that are causing misalignment. */\n.leaflet-control-layers-selector {\n  margin-top: revert;\n  position: revert;\n}\n\n/*\n * Context menu.\n */\n\n.mapml-contextmenu {\n  border-radius: 4px;\n  padding: 4px 0;\n  background-color: #fff;\n  cursor: default;\n  position: absolute;\n  width: fit-content;\n  display: inline-block;\n  z-index: 10001;\n}\n\n.mapml-contextmenu button.mapml-contextmenu-item {\n  color: #222;\n  font-size: 12px;\n  line-height: 20px;\n  text-decoration: none;\n  padding: 0 12px;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  cursor: default;\n  width: 100%;\n  display: block;\n}\n\n.mapml-contextmenu button.mapml-contextmenu-item.over {\n  background-color: #f4f4f4;\n  border-top: 1px solid #f0f0f0;\n  border-bottom: 1px solid #f0f0f0;\n}\n      \n.mapml-contextmenu-separator {\n  border-bottom: 1px solid #e3e3e3;\n  margin: 5px 0;\n}\n\n.mapml-contextmenu.mapml-submenu {\n  width: 80px;\n  margin-bottom: -2rem;\n  width: fit-content;\n}\n\n@supports (contain: layout) {\n  .mapml-contextmenu {\n    position: fixed;\n  }\n  .mapml-contextmenu.mapml-submenu {\n    position: absolute;\n  }\n}\n\n.mapml-contextmenu-item[aria-controls] span::after {\n  content:\">\";\n}\n@supports (list-style-type: disclosure-open) {\n  .mapml-contextmenu-item[aria-controls] span {\n    display: inline-block;\n  }\n  .mapml-contextmenu-item[aria-controls] span::after {\n    content:\"\";\n    display: list-item;\n    list-style-type: disclosure-closed;\n    margin-inline-start: 20px;\n  }\n}\n\n/*\n * Debug mode.\n */\n\n.mapml-debug {\n  contain: content;\n  max-height: 100%;\n  max-width: 100%;\n  border-radius: 4px;\n  padding: 5px 10px;\n  background-color: #fff;\n  cursor: default;\n  z-index: 1000;\n  position: absolute;\n  display: block;\n  top: auto;\n  right: 5px;\n  bottom: 5px;\n  left: 5px;\n  width: -webkit-fit-content;\n  width: -moz-fit-content;\n  width: fit-content;\n  font: inherit;\n}\n\n.mapml-debug-banner {\n  font-weight: bold;\n  text-transform: uppercase;\n  display: inline-block;\n  text-align: left;\n  text-align: inline-start;\n  line-height: 2;\n}\n\n.mapml-debug-panel,\n.mapml-debug-grid {\n  font-family: monospace;\n}\n\n.mapml-debug-tile {\n  text-indent: 6px;\n  line-height: 1.8;\n}\n\n.mapml-debug-coordinates {\n  padding-left: 4px;\n  padding-right: 4px;\n}\n\n.mapml-debug,\n.mapml-debug * {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\n.mapml-debug-coordinates:empty {\n  display: none;\n}\n\n.mapml-debug-coordinates > * {\n  display: inline;\n}\n\n:host(.mapml-fullscreen-on) .mapml-debug-grid {\n  color: #fff;\n  text-shadow: 1px 1px 1px #000, 1px 1px 1px #000;\n}\n\n/*\n * User interaction.\n */\n \n :host(.leaflet-drag-target) .leaflet-grab {\n   cursor: move;\n   cursor: -webkit-grabbing;\n   cursor:    -moz-grabbing;\n   cursor:         grabbing;\n }\n \n /* Prevent `:hover` styles from applying to controls when the user is panning\n the map display and the cursor happens to move over a control. */\n:host(.leaflet-drag-target) .leaflet-control {\n  pointer-events: none;\n}\n\n/* Disable dragging of controls. */\n.mapml-popup-button,\n.leaflet-popup-close-button,\n.leaflet-control :not([draggable=\"true\"]),\n.mapml-contextmenu :not([draggable=\"true\"]) {\n  -webkit-user-drag: none;\n}\n\n/* Disable text selection in controls. */\n.leaflet-control,\n.mapml-contextmenu,\n.mapml-debug,\n.mapml-focus-buttons,\n.mapml-layer-item-settings summary {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\n/* Hide unintended highlighting of controls from clicking the map display in\n   quick succession. This is a workaround for `user-select: contain`, since it has\n   virtually no browser support: https://www.chromestatus.com/feature/5730263904550912. */\n.leaflet-control a::selection,\n.leaflet-popup-close-button::selection,\n.leaflet-control-attribution::selection {\n  background-color: transparent;\n}\n\n/* Disable pointer events where they'd interfere with the intended action. */\n.mapml-feature-index-box,\n.leaflet-tooltip,\n.leaflet-crosshair *,\n.mapml-layer-item-settings .mapml-control-layers summary label,\n.mapml-contextmenu-item > *,\n.mapml-link-preview {\n  pointer-events: none!important;\n}\n\n/* Restore the default focus outline of UA stylesheets,\n   which Leaflet unfortunately removes (https://github.com/Leaflet/Leaflet/issues/6986). */\n.leaflet-container :focus {\n  outline-color: -webkit-focus-ring-color !important;\n  outline-style: auto !important;\n  outline-width: thin !important;\n  outline: revert !important;\n}\n/* Unset the outline that Leaflet occasionally sets on controls without also\n   delegating focus. */\n.leaflet-active:not(:focus) {\n  outline: unset !important;\n}\n.leaflet-container:not(:focus-within) .mapml-outline {\n  outline: 0;\n}\n.leaflet-container:not(:focus-within) .mapml-crosshair {\n  display: none;\n}\n\n/* Restore the default UA tap highlight color by overriding the opinionated tap\n   highlight color inherited from leaflet.css. */\n.leaflet-control a {\n  -webkit-tap-highlight-color: initial;\n}\n\n/* Less opinionated styles for the zoom box than inherited from leaflet.css. */\n.leaflet-zoom-box {\n  border: thin dotted;\n  background-color: rgba(255,255,255,0.33);\n}\n\nlabel,\ninput,\nbutton,\nsummary {\n  cursor: pointer;\n}\n\n.mapml-draggable,\n.mapml-draggable * {\n  cursor: row-resize;\n}\n\n.leaflet-crosshair {\n  cursor: crosshair;\n}\n\n[hidden] {\n  display: none!important;\n}\n\n/*\n * Visibility hack – mitigates FOUC.\n * (https://github.com/Maps4HTML/MapML.js/issues/154)\n */\n\n/* Unset `visibility: hidden` (inherited from mapml.js). */\n.leaflet-container .mapml-contextmenu,\n.leaflet-container .leaflet-control-container {\n  visibility: unset!important;\n}\n\n.mapml-crosshair {\n  margin: -36px 0 0 -36px;\n  width: 72px;\n  height: 72px;\n  left: 50%;\n  top: 50%;\n  position: absolute;\n  z-index: 10000;\n}\n\n.mapml-popup-button {\n\tpadding: 0 4px 0 4px;\n\tborder: none;\n\ttext-align: center;\n\tfont: 16px/14px Tahoma, Verdana, sans-serif;\n\tcolor: inherit;\n\ttext-decoration: none;\n\tfont-weight: bold;\n  background: transparent;\n  white-space: nowrap;\n  box-sizing: border-box;\n  width: 44px;\n  height: 44px;\n  line-height: 44px;\n}\n\n.mapml-zoom-link {\n  display: block;\n  text-align: center;\n}\n\n.mapml-focus-buttons {\n  white-space: nowrap;\n}\n\n.mapml-feature-count {\n  display:inline;\n  white-space: nowrap;\n  text-align: center;\n  padding: 2px;\n}\n\n.mapml-focus-buttons button,\n.leaflet-container a.leaflet-popup-close-button {\n  width: 44px;\n  height: 44px;\n  min-width: 44px;\n  min-height: 44px;\n  line-height: 44px;\n}\n.leaflet-popup-content {\n  margin: 0;\n  min-width: min-content;\n  scrollbar-width: thin;\n}\n.mapml-popup-content {\n  padding-top: 44px;\n}\n.mapml-focus-buttons {\n  display: block;\n  text-align: center;\n}\n.mapml-focus-buttons button {\n  display: inline-block;\n  padding: 0;\n}\n.leaflet-container a.leaflet-popup-close-button {\n  padding: 0;\n  font-size: 20px;\n}\n.leaflet-popup-content .mapml-feature-count {\n  margin: 0;\n  padding: 0 5px;\n  line-height: 44px;\n}\n.mapml-popup-content hr:last-of-type {\n  margin-bottom: 0;\n  border-bottom: 0;\n  border-top: 1px solid #e3e3e3;\n}\n.mapml-popup-content :first-child {\n  margin-top: 0;\n  padding-top: 0;\n}\n.mapml-popup-content > :not(.mapml-focus-buttons) {\n  padding: 0 1rem;\n}\n.leaflet-popup-tip-container {\n  margin-top: -1px;\n}\n\n.mapml-outline {\n  outline-style: auto;\n  outline-offset: -2px;\n  z-index: 1000;\n  pointer-events: none;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n  color: initial;\n}\n \n /* Force printers to include background-images of controls for printing.\n   (https://github.com/Maps4HTML/MapML.js/issues/294) */\n@media print {\n  .leaflet-control {\n    -webkit-print-color-adjust: exact;\n    print-color-adjust: exact;\n  }\n}\n\n.leaflet-pane > svg g.leaflet-interactive,\nsvg.leaflet-image-layer.leaflet-interactive g {\n  pointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\n  pointer-events: auto;\n}\n\n.mapml-link-preview {\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  background-color: rgb(222,225,230);\n  border-radius: 0 5px 0 0 ;\n  z-index: 1050;  \n  max-width: 60%;\n}\n\n.mapml-link-preview > p {\n  margin: 3px 5px 2px 3px;\n  color: rgb(60,64,67);\n  text-overflow: ellipsis;\n  overflow-x: hidden;\n  white-space: nowrap;\n}\n\n/**\n* layer item controls\n*/\n\n.mapml-button-icon {\n  pointer-events: none;\n}\n\n.mapml-button-icon svg {\n  fill: currentColor;\n}\n\n.mapml-layer-item,\n.mapml-layer-item * {\n  box-sizing: border-box;\n}\n\n.mapml-layer-item,\n.mapml-layer-grouped-extents,\n.mapml-layer-extent {\n  background-color: #fff;\n  border: 1px solid #fff;\n  margin: 0;\n  padding: 0;\n}\n\n.mapml-layer-item:not(:last-of-type) {\n  border-bottom: 1px solid #e3e3e3;\n}\n.mapml-layer-item[aria-grabbed=\"true\"],\n.mapml-layer-extent[aria-grabbed=\"true\"] {\n  border: 1px solid #e3e3e3;\n  border-radius: 0;\n}\n.mapml-layer-item:first-of-type,\n.mapml-layer-extent:first-of-type {\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n}\n.mapml-layer-item:last-of-type,\n.mapml-layer-extent:last-of-type {\n  border-bottom-left-radius: 4px;\n  border-bottom-right-radius: 4px;\n}\n\n.mapml-layer-item-properties {\n  align-items: center;\n  display: flex;\n  justify-content: space-between;\n  padding-inline-start: .5rem;\n}\n.mapml-layer-item-controls {\n  margin-inline-start: auto;\n}\n\n\n.mapml-layer-item-controls button span {\n  font-size: large;\n  font-weight: 900;\n  vertical-align: middle;\n}\n\n.mapml-layer-item-controls button svg {\n  vertical-align: text-bottom;\n}\n\n.mapml-layer-item-controls,\n.mapml-layer-item-remove-control,\n.mapml-layer-item-settings-control {\n  align-items: center;\n  display: flex;\n  justify-content: center;\n}\n\n\n.mapml-layer-item-remove-control,\n.mapml-layer-item-settings-control {\n  min-height: 44px;\n  min-width: 44px;\n  height: 44px;\n  width: 44px;\n}\n\nlabel.mapml-layer-item-toggle {\n  display: inline-flex;\n  align-items: center;\n  width: 100%; /* have the clickable area take up all available width */\n  min-height: 44px;\n}\n\n.mapml-layer-item-name {\n  word-break: break-word;\n  padding-block-start: .25rem;\n  padding-block-end: .25rem;\n  padding-inline-start: .25rem;\n  padding-inline-end: 1rem;\n}\n\n.mapml-layer-item-settings > * {\n  display: block;\n  padding-block-start: .25rem;\n  padding-block-end: .25rem;\n  padding-inline-start: 2rem;\n  padding-inline-end: 1rem;\n}\n\n.mapml-screen-reader-output {\n  clip: rect(0 0 0 0);\n  clip-path: inset(50%);\n  height: 1px;\n  overflow: hidden;\n  position: absolute;\n  white-space: nowrap;\n  width: 1px;\n}\n\n.mapml-screen-reader-output-scale {\n  clip: rect(0 0 0 0);\n  clip-path: inset(50%);\n  height: 1px;\n  overflow: hidden;\n  position: absolute;\n  white-space: nowrap;\n  width: 1px\n}\n/*\n * Feature styles.\n */\n\n.mapml-vector-container svg :is(\n  [role=\"link\"]:focus,\n  [role=\"link\"]:hover,\n  [role=\"link\"]:focus path,\n  [role=\"link\"]:hover path,\n  [role=\"link\"] path:focus,\n  [role=\"link\"] path:hover,\n  [role=\"button\"]:focus,\n  [role=\"button\"]:hover,\n  [role=\"button\"]:focus path,\n  [role=\"button\"]:hover path,\n  [role=\"button\"] path:focus,\n  [role=\"button\"] path:hover,\n  path[tabindex=\"0\"]:focus\n  ) {\n  stroke: #0000EE;\n  stroke: LinkText;\n}\n.mapml-vector-container svg :is(\n  [role=\"link\"]:focus:not(:focus-visible),\n  [role=\"link\"]:focus:not(:focus-visible) path,\n  [role=\"link\"] path:focus:not(:focus-visible),\n  [role=\"button\"]:focus:not(:focus-visible),\n  [role=\"button\"]:focus:not(:focus-visible) path,\n  [role=\"button\"] path:focus:not(:focus-visible),\n  path[tabindex=\"0\"]:focus:not(:focus-visible)\n  ) {\n  outline: 0!important;\n}\n\n/*\n* Extent Elements in the Layer Control\n*/\n\n.mapml-layer-item-settings .mapml-layer-extent {\n  padding-inline-start: 1.8rem;\n}\n\n.mapml-layer-item-settings .mapml-layer-extent .mapml-layer-item-properties{\n  padding-inline-start: 0;\n}\n\n.mapml-layer-item-settings .mapml-layer-extent .mapml-layer-item-details {\n  padding-inline-start: 1.6rem;\n}\n\n/**\n* Feature Index\n */\n.mapml-feature-index-box {\n  margin: -8% 0 0 -8%;\n  width: 16%;\n  left: 50%;\n  top: 50%;\n  position: absolute;\n  z-index: 10000;\n  outline: 2px solid #fff;\n}\n\n.mapml-feature-index-box:after{\n  display: block;\n  content: '';\n  padding-top: 100%;\n}\n\n.mapml-feature-index-box > svg {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n\n.mapml-feature-index {\n  outline: 1px solid #000000;\n  contain: content;\n  border-radius: 4px;\n  background-color: #fff;\n  cursor: default;\n  z-index: 1000;\n  position: absolute;\n  top: auto;\n  left: 50%;\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n  bottom: 30px;\n  padding-top: 5px;\n  height: 92px;\n  width: 450px;\n  font-size: 16px;\n}\n@container leafletmap (max-width: 650px ) {\n    .mapml-feature-index {\n        width: 70cqw; \n    }\n}\n@container leafletmap (max-width: 390px ) {\n    .mapml-feature-index {\n        bottom: 100px; \n    }\n}\n.mapml-feature-index-content > span{\n  width: 140px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  display: inline-block;\n  padding-left: 5px;\n  padding-right: 5px;\n}\n\n.shortcuts-dialog > ul > li > kbd,\n.mapml-feature-index-content > span > kbd{\n  background-color: lightgrey;\n  padding-right: 4px;\n  padding-left: 4px;\n  border-radius: 4px;\n}\n\n.mapml-feature-index-content > span > span{\n  clip: rect(0 0 0 0);\n  clip-path: inset(50%);\n  height: 1px;\n  overflow: hidden;\n  position: absolute;\n  white-space: pre;\n  width: 1px;\n}\n\n.shortcuts-dialog > button{\n  font-size: inherit;\n}\n\n.shortcuts-dialog > ul {\n  padding: 0;\n  list-style-type:none;\n}\n\n.mapml-tile-group > svg { \n    overflow: visible;\n}\n/* ===== ESSENTIAL HOST DEFAULTS (immediate application for getBoundingClientRect) ===== */\n:host {\n  /* Reset first, then apply critical MapML defaults */\n  all: initial;\n  \n  /* Critical MapML defaults that must be available immediately */\n  display: inline-block;\n  background-color: white;\n  /* Default dimensions - will be overridden by JavaScript based on CSS rules or attributes */\n  height: 150px;        \n  width: 300px;         \n  contain: layout size;\n  border-width: 2px;\n  border-style: inset;\n}\n\n/* Ensure white background persists in fullscreen */\n:host(.mapml-fullscreen-on) {\n  background-color: white;\n}\n/* Ensure container fills the host element */\n.mapml-map-container {\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n\n/* ===== GCDS LAYER ARCHITECTURE ===== */\n@layer reset, default, display, size, variant, hover, visited, focus;\n\n@layer reset {\n  :host {\n    /* GCDS responsive overrides (when CSS loads) */\n    position: relative;\n    \n    /* Aspect ratio support for responsive design */\n    aspect-ratio: var(--map-aspect);\n  }\n}\n\n@layer default {\n  :host {\n    /* Visual styling */\n    border: 2px inset;\n    cursor: pointer;\n    transition: all 0.35s;\n  }\n  \n  /* Attribute-based styling */\n  :host([frameborder=\"0\"]) {\n    border-width: 0;\n  }\n  \n  :host([hidden]) {\n    display: none !important;\n  }\n}/* Remaining layers: size, variant, hover, visited, focus remain unchanged */\n/* Optional: Add any gcds-specific styling here */\n/* You may want to import gcds design tokens if available */\n";

const GcdsMap = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
    // Mirror the observedAttributes as Stencil props
    lat = 0;
    lon = 0;
    zoom = 0;
    projection = 'OSMTILE';
    // Note: width/height are NOT Stencil props - they're managed via custom properties and MutationObserver
    // @Prop() width?: string;
    // @Prop() height?: string;
    controls = false;
    static = false;
    _controlslist;
    locale;
    _controlsList;
    _source;
    _history = [];
    _historyIndex = -1;
    _traversalCall = false;
    // Private properties that mirror the original (will be set in componentDidLoad)
    _map;
    // private locale: any; // TODO: Use when implementing locale support
    _container;
    mapCaptionObserver;
    // @ts-ignore - Stored for potential cleanup, removed when map is deleted
    _featureIndexOverlay;
    _zoomControl;
    _layerControl;
    _reloadButton;
    _fullScreenControl;
    _geolocationButton;
    _scaleBar;
    _isInitialized = false;
    _debug;
    // @ts-ignore 
    _crosshair;
    _boundDropHandler;
    _boundDragoverHandler;
    // see comments below regarding attributeChangedCallback vs. getter/setter
    // usage.  Effectively, the user of the element must use the property, not
    // the getAttribute/setAttribute/removeAttribute DOM API, because the latter
    // calls don't result in the getter/setter being called (so you have to use
    // the getter/setter directly)
    controlsChanged(newValue) {
        // Mirror original controls setter logic
        if (this._map) {
            if (newValue) {
                this._showControls();
            }
            else {
                this._hideControls();
            }
        }
    }
    controlsListChanged(newValue) {
        if (this._controlsList) {
            this._controlsList.value = newValue;
            // Re-toggle controls to apply the new controlslist filtering
            if (this._map) {
                this._toggleControls();
            }
        }
    }
    get controlsList() {
        return this._controlsList;
    }
    set controlsList(value) {
        if (this._controlsList && (typeof value === 'string' || value === null)) {
            if (value) {
                this.el.setAttribute('controlslist', value);
            }
            else {
                this.el.removeAttribute('controlslist');
            }
            // DOMTokenList automatically reflects the attribute change
            // Re-toggle controls based on new attribute value
            if (this._map) {
                this._toggleControls();
            }
        }
    }
    // Note: width/height watchers removed - handled via MutationObserver instead
    // since they're not Stencil @Prop() anymore
    // Note: lat, lon, and zoom are NOT watched because in mapml-viewer, changing these
    // attributes does not change the map position/zoom. These attributes are only 
    // updated by map events to reflect the current state for external observers.
    async projectionChanged(newValue, oldValue) {
        if (newValue && this._map && this._map.options.projection !== newValue) {
            const reconnectLayers = () => {
                // save map location and zoom
                let lat = this.lat;
                let lon = this.lon;
                let zoom = this.zoom;
                // saving the lat, lon and zoom is necessary because Leaflet seems
                // to try to compensate for the change in the scales for each zoom
                // level in the crs by changing the zoom level of the map when
                // you set the map crs. So, we save the current view for use below
                // when all the layers' reconnections have settled.
                // leaflet doesn't like this: https://github.com/Leaflet/Leaflet/issues/2553
                this._map.options.crs = window.M[newValue];
                this._map.options.projection = newValue;
                let layersReady = [];
                this._map.announceMovement?.disable();
                // Get all map-layer and layer- elements and reconnect them
                const layers = this.el.querySelectorAll('map-layer,layer-');
                for (let layer of Array.from(layers)) {
                    layer.removeAttribute('disabled');
                    let reAttach = this.el.removeChild(layer);
                    this.el.appendChild(reAttach);
                    if (reAttach.whenReady) {
                        layersReady.push(reAttach.whenReady());
                    }
                }
                return Promise.allSettled(layersReady).then(() => {
                    // use the saved map location to ensure it is correct after
                    // changing the map CRS. Specifically affects projection
                    // upgrades, e.g. https://maps4html.org/experiments/custom-projections/BNG/
                    // see leaflet bug: https://github.com/Leaflet/Leaflet/issues/2553
                    // Skip restoration if there's only one layer - link traversal case where layer.zoomTo() should control zoom
                    const layers = this.el.layers;
                    if (layers.length === 1) {
                        const layer = layers[0];
                        if (layer.extent) {
                            this._map.setMinZoom(layer.extent.zoom.minZoom);
                            this._map.setMaxZoom(layer.extent.zoom.maxZoom);
                        }
                    }
                    this.zoomTo(lat, lon, zoom);
                    if (window.M.options.announceMovement)
                        this._map.announceMovement?.enable();
                    // required to delay until map-extent.disabled is correctly set
                    // which happens as a result of map-layer._validateDisabled()
                    // which happens so much we have to delay until the calls are
                    // completed
                    setTimeout(() => {
                        this.el.dispatchEvent(new CustomEvent('map-projectionchange'));
                    }, 0);
                });
            };
            const connect = reconnectLayers.bind(this);
            try {
                await this.whenProjectionDefined(newValue);
                await connect();
                if (this._map && this._map.options.projection !== oldValue) {
                    // this doesn't completely work either
                    this._resetHistory();
                }
                if (this._debug) {
                    // Toggle debug twice to refresh it with new projection
                    for (let i = 0; i < 2; i++)
                        this.toggleDebug();
                }
            }
            catch {
                throw new Error('Undefined projection: ' + newValue);
            }
        }
    }
    // Note: zoom is NOT watched because in mapml-viewer, changing the zoom attribute
    // does not change the map zoom. The zoom attribute is only updated by map events
    // to reflect the current state for external observers.
    // Note: instead of layers getter here, gcds-map.layers property is exposed via Object.defineProperty in componentDidLoad
    get extent() {
        let map = this._map, pcrsBounds = Util.pixelToPCRSBounds(map.getPixelBounds(), map.getZoom(), map.options.projection);
        let formattedExtent = Util._convertAndFormatPCRS(pcrsBounds, map.options.crs, this.projection);
        // get min/max zoom from layers at this moment
        let minZoom = Infinity, maxZoom = -Infinity;
        const layers = this.el.layers;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].extent) {
                if (layers[i].extent.zoom.minZoom < minZoom)
                    minZoom = layers[i].extent.zoom.minZoom;
                if (layers[i].extent.zoom.maxZoom > maxZoom)
                    maxZoom = layers[i].extent.zoom.maxZoom;
            }
        }
        formattedExtent.zoom = {
            minZoom: minZoom !== Infinity ? minZoom : map.getMinZoom(),
            maxZoom: maxZoom !== -Infinity ? maxZoom : map.getMaxZoom()
        };
        return formattedExtent;
    }
    // Width and height getters return computed CSS values (not attribute values)
    // This allows CSS to dominate over HTML attributes, matching mapml-viewer behavior
    getWidth() {
        return +window.getComputedStyle(this.el).width.replace('px', '');
    }
    getHeight() {
        return +window.getComputedStyle(this.el).height.replace('px', '');
    }
    staticChanged() {
        if (this._map) {
            this._toggleStatic();
        }
    }
    // Note: Stencil handles constructor automatically, but we can use componentWillLoad for initialization
    componentWillLoad() {
        // Mirror the original constructor logic
        this._source = this.el.outerHTML;
        // create an array to track the history of the map and the current index
        this._history = [];
        this._historyIndex = -1;
        this._traversalCall = false;
    }
    // Mirror the connectedCallback logic in componentDidLoad
    async connectedCallback() {
        try {
            // Sync initial history state to element for MapML controls
            this.el._history = this._history;
            this.el._historyIndex = this._historyIndex;
            // Publish width/height getters/setters to match mapml-viewer API
            // These return computed style (CSS wins over attributes)
            Object.defineProperty(this.el, 'width', {
                get: () => {
                    return +window.getComputedStyle(this.el).width.replace('px', '');
                },
                set: (val) => {
                    // Set attribute only, don't override CSS with inline styles
                    this.el.setAttribute('width', val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'height', {
                get: () => {
                    return +window.getComputedStyle(this.el).height.replace('px', '');
                },
                set: (val) => {
                    // Set attribute only, don't override CSS with inline styles  
                    this.el.setAttribute('height', val);
                },
                enumerable: true,
                configurable: true
            });
            // Ensure MapML controls are loaded and their init hooks are registered
            // BEFORE creating any maps. This is critical for proper attribution control.
            await this._ensureControlsLoaded();
            await this.whenProjectionDefined(this.projection);
            this._setLocale();
            this._initShadowRoot();
            this._controlsList = new CustomDOMTokenList(this.el.getAttribute('controlslist'), this.el, 'controlslist', [
                'noreload',
                'nofullscreen',
                'nozoom',
                'nolayer',
                'noscale',
                'geolocation'
            ]);
            var s = window.getComputedStyle(this.el), wpx = s.width, hpx = s.height, w = this.el.hasAttribute('width')
                ? this.el.getAttribute('width')
                : parseInt(wpx.replace('px', '')), h = this.el.hasAttribute('height')
                ? this.el.getAttribute('height')
                : parseInt(hpx.replace('px', ''));
            this._changeWidth(w);
            this._changeHeight(h);
            this._createMap();
            // Mark as initialized so watchers can now run
            this._isInitialized = true;
            // Watch for attribute changes to width/height after initialization
            // This handles setAttribute() calls which don't trigger custom property setters
            const attributeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName) {
                        const newValue = this.el.getAttribute(mutation.attributeName);
                        if (mutation.attributeName === 'width' && newValue) {
                            this._changeWidth(newValue);
                        }
                        else if (mutation.attributeName === 'height' && newValue) {
                            this._changeHeight(newValue);
                        }
                    }
                });
            });
            attributeObserver.observe(this.el, {
                attributes: true,
                attributeFilter: ['width', 'height']
            });
            // Store observer for cleanup
            this.el._attributeObserver = attributeObserver;
            // https://github.com/Maps4HTML/MapML.js/issues/274
            this.el.setAttribute('role', 'application');
            this._toggleStatic();
            /*
          1. only deletes aria-label when the last (only remaining) map caption is removed
          2. only deletes aria-label if the aria-label was defined by the map caption element itself
          */
            let mapcaption = this.el.querySelector('map-caption');
            if (mapcaption !== null) {
                setTimeout(() => {
                    let ariaupdate = this.el.getAttribute('aria-label');
                    if (ariaupdate === mapcaption.innerHTML) {
                        this.mapCaptionObserver = new MutationObserver((_m) => {
                            let mapcaptionupdate = this.el.querySelector('map-caption');
                            if (mapcaptionupdate !== mapcaption) {
                                this.el.removeAttribute('aria-label');
                            }
                        });
                        this.mapCaptionObserver.observe(this.el, {
                            childList: true
                        });
                    }
                }, 0);
            }
        }
        catch (e) {
            console.log(e);
            throw new Error('Error: ' + e);
        }
    }
    _setLocale() {
        // Priority order (matching mapml-viewer behavior):
        // 1. :lang(fr) attribute in ancestry (Canadian French context)
        // 2. :lang(en) attribute in ancestry (Canadian English context)
        // 3. <map-options> locale in document head (browser/custom locale)
        if (this.el.closest(':lang(fr)') === this.el) {
            this.locale = localeFr;
        }
        else if (this.el.closest(':lang(en)') === this.el) {
            this.locale = locale;
        }
        else {
            // Check if there's a <map-options> element in the document head
            // that was placed there by the browser extension or test harness
            const mapOptions = document.head.querySelector('map-options');
            if (mapOptions && mapOptions.textContent) {
                try {
                    const options = JSON.parse(mapOptions.textContent);
                    if (options.locale) {
                        this.locale = options.locale;
                        return;
                    }
                }
                catch (e) {
                    console.warn('Failed to parse map-options:', e);
                }
            }
            // Default to English locale if no other locale specified
            this.locale = locale;
        }
    }
    _initShadowRoot() {
        let shadowRoot = this.el.shadowRoot;
        if (shadowRoot.querySelector('[aria-label="Interactive map"]'))
            return;
        // Add default :host styles AFTER Stencil's gcds-map.css loads
        // This ensures proper cascade order and allows _changeWidth/_changeHeight to modify it
        const ensureHostStyle = () => {
            // Wait for Stencil's stylesheet to load first
            if (shadowRoot.styleSheets.length === 0) {
                requestAnimationFrame(ensureHostStyle);
                return;
            }
            // Now append our :host defaults AFTER the main gcds-map.css
            let mapDefaultCSS = document.createElement('style');
            mapDefaultCSS.innerHTML =
                `:host {` +
                    `all: initial;` +
                    `display: inline-block;` +
                    `background-color: white;` +
                    `height: 150px;` +
                    `width: 300px;` +
                    `contain: layout size;` +
                    `border-width: 2px;` +
                    `border-style: inset;` +
                    `}`;
            shadowRoot.appendChild(mapDefaultCSS);
        };
        ensureHostStyle();
        this._container = document.createElement('div');
        let output = "<output role='status' aria-live='polite' aria-atomic='true' class='mapml-screen-reader-output'></output>";
        this._container.insertAdjacentHTML('beforeend', output);
        // Make the Leaflet container element programmatically identifiable
        // (https://github.com/Leaflet/Leaflet/issues/7193).
        this._container.setAttribute('role', 'region');
        this._container.setAttribute('aria-label', 'Interactive map');
        shadowRoot.appendChild(this._container);
        // Expose _container on DOM element for test access and MapML compatibility
        this.el._container = this._container;
        // Hide all (light DOM) children of the map element (equivalent to hideElementsCSS)
        let hideElementsCSS = document.createElement('style');
        hideElementsCSS.innerHTML = `gcds-map > * { display: none!important; }`;
        this.el.appendChild(hideElementsCSS);
    }
    _createMap() {
        if (!this._map) {
            this._map = leafletSrcExports.map(this._container, {
                center: new leafletSrcExports.LatLng(this.lat, this.lon),
                minZoom: 0,
                maxZoom: window.M[this.projection].options.resolutions.length - 1,
                projection: this.projection,
                query: true,
                contextMenu: true,
                announceMovement: true,
                featureIndex: true,
                mapEl: this.el,
                crs: window.M[this.projection],
                zoom: this.zoom,
                zoomControl: false
            });
            // Make map accessible for debugging
            this.el._map = this._map;
            window._debugMap = this._map;
            // Expose component history properties on element for MapML control compatibility
            this.el._history = this._history;
            this.el._historyIndex = this._historyIndex;
            // Expose controlsList API on element for MapML control compatibility
            // Follow standard HTML DOMTokenList behavior (like video.controlsList)
            Object.defineProperty(this.el, 'controlsList', {
                get: () => this._controlsList,
                set: (value) => {
                    // Standard behavior: property assignment updates DOMTokenList value
                    // but does NOT update HTML attribute (unlike component setter)
                    if (this._controlsList && (typeof value === 'string' || value === null)) {
                        this._controlsList.value = value || '';
                        // Trigger control visibility updates without changing HTML attribute
                        if (this._map) {
                            this._toggleControls();
                        }
                    }
                },
                configurable: true,
                enumerable: true
            });
            // Expose layers getter on element for MapML control compatibility
            Object.defineProperty(this.el, 'layers', {
                get: () => this.el.getElementsByTagName('map-layer'),
                configurable: true,
                enumerable: true
            });
            // Expose locale property on element for MapML control compatibility
            Object.defineProperty(this.el, 'locale', {
                get: () => this.locale,
                configurable: true,
                enumerable: true
            });
            // Expose extent property on element for MapML compatibility
            Object.defineProperty(this.el, 'extent', {
                get: () => this.extent,
                configurable: true,
                enumerable: true
            });
            // Expose width/height getters that return computed CSS values (not attributes)
            // This allows CSS to dominate over HTML attributes, matching mapml-viewer behavior
            Object.defineProperty(this.el, 'width', {
                get: () => this.getWidth(),
                set: (val) => {
                    // Setter changes the attribute AND applies the change immediately
                    this.el.setAttribute('width', val);
                    if (this._isInitialized) {
                        this._changeWidth(val);
                    }
                },
                configurable: true,
                enumerable: true
            });
            Object.defineProperty(this.el, 'height', {
                get: () => this.getHeight(),
                set: (val) => {
                    // Setter changes the attribute AND applies the change immediately
                    this.el.setAttribute('height', val);
                    if (this._isInitialized) {
                        this._changeHeight(val);
                    }
                },
                configurable: true,
                enumerable: true
            });
            // Expose public synchronous methods on element for MapML compatibility
            Object.defineProperty(this.el, 'zoomTo', {
                value: (lat, lon, zoom) => this.zoomTo(lat, lon, zoom),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'back', {
                value: () => this.back(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'forward', {
                value: () => this.forward(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'reload', {
                value: () => this.reload(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'toggleDebug', {
                value: () => this.toggleDebug(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'viewSource', {
                value: () => this.viewSource(),
                writable: true,
                configurable: true
            });
            // Expose matchMedia method with proper 'this' binding
            // This ensures 'this' always refers to the custom element when called
            Object.defineProperty(this.el, 'matchMedia', {
                value: (...args) => matchMedia.apply(this.el, args),
                writable: true,
                configurable: true
            });
            // Expose geojson2mapml method
            Object.defineProperty(this.el, 'geojson2mapml', {
                value: (json, options) => this.geojson2mapml(json, options),
                writable: true,
                configurable: true
            });
            Object.defineProperty(this.el, 'defineCustomProjection', {
                value: (jsonTemplate) => this.defineCustomProjection(jsonTemplate),
                writable: true,
                configurable: true
            });
            // Expose internal methods needed by MapML controls and context menu items
            this.el._toggleFullScreen = () => this._toggleFullScreen();
            this.el._toggleControls = () => this._toggleControls();
            this._addToHistory();
            this._createControls();
            this._toggleControls();
            this._crosshair = crosshair().addTo(this._map);
            if (window.M.options.featureIndexOverlayOption)
                this._featureIndexOverlay = featureIndexOverlay().addTo(this._map);
            this._setUpEvents();
        }
    }
    disconnectedCallback() {
        this._removeEvents();
        // Clean up attribute observer
        if (this.el._attributeObserver) {
            this.el._attributeObserver.disconnect();
            delete this.el._attributeObserver;
        }
        delete this._map;
        this._deleteControls();
    }
    // Helper methods that mirror the original
    async _ensureControlsLoaded() {
        // Force MapML control modules to load and register their init hooks
        // This ensures attribution and other controls work properly
        try {
            // needed because attributionButton is auto-added via Map.addInitHook and
            // if it's not referenced by code, the bundler will omit it automatically
            await import('./AttributionButton-D9016F2_.js');
            // Load ContextMenu handler to register init hooks
            await import('./index-PZrWUcjo.js').then(function (n) { return n.C; });
            await import('./index-PZrWUcjo.js').then(function (n) { return n.A; });
            await import('./index-PZrWUcjo.js').then(function (n) { return n.k; });
            // Load FeatureIndex handler to register init hooks for keyboard navigation
            await import('./index-PZrWUcjo.js').then(function (n) { return n.j; });
            // TODO: other controls if needed
        }
        catch (error) {
            console.error('Failed to load MapML controls:', error);
        }
    }
    // Creates All map controls and adds them to the map, when created.
    _createControls() {
        let mapSize = this._map.getSize().y, totalSize = 0;
        this._layerControl = layerControl(null, {
            collapsed: true,
            mapEl: this.el
        }).addTo(this._map);
        this._map.on('movestart', this._layerControl.collapse, this._layerControl);
        // Expose on element for MapML compatibility
        this.el._layerControl = this._layerControl;
        let scaleValue = window.M.options.announceScale;
        if (scaleValue === 'metric') {
            scaleValue = { metric: true, imperial: false };
        }
        if (scaleValue === 'imperial') {
            scaleValue = { metric: false, imperial: true };
        }
        if (!this._scaleBar) {
            this._scaleBar = scaleBar(scaleValue).addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._scaleBar = this._scaleBar;
        }
        // Only add controls if there is enough top left vertical space
        if (!this._zoomControl && totalSize + 93 <= mapSize) {
            totalSize += 93;
            this._zoomControl = leafletSrcExports.control
                .zoom({
                zoomInTitle: this.locale.btnZoomIn,
                zoomOutTitle: this.locale.btnZoomOut
            })
                .addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._zoomControl = this._zoomControl;
        }
        if (!this._reloadButton && totalSize + 49 <= mapSize) {
            totalSize += 49;
            this._reloadButton = reloadButton().addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._reloadButton = this._reloadButton;
        }
        if (!this._fullScreenControl && totalSize + 49 <= mapSize) {
            totalSize += 49;
            this._fullScreenControl = fullscreenButton().addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._fullScreenControl = this._fullScreenControl;
        }
        if (!this._geolocationButton) {
            this._geolocationButton = geolocationButton().addTo(this._map);
            // Expose on element for MapML compatibility
            this.el._geolocationButton = this._geolocationButton;
        }
        // Expose locate method on element for MapML compatibility
        this.el.locate = this.locate.bind(this);
    }
    // Sets controls by hiding/unhiding them based on the map attribute
    _toggleControls() {
        if (this.controls === false) {
            this._hideControls();
            this._map.contextMenu.toggleContextMenuItem('Controls', 'disabled');
        }
        else {
            this._showControls();
            this._map.contextMenu.toggleContextMenuItem('Controls', 'enabled');
        }
    }
    _hideControls() {
        this._setControlsVisibility('fullscreen', true);
        this._setControlsVisibility('layercontrol', true);
        this._setControlsVisibility('reload', true);
        this._setControlsVisibility('zoom', true);
        this._setControlsVisibility('geolocation', true);
        this._setControlsVisibility('scale', true);
    }
    _showControls() {
        this._setControlsVisibility('fullscreen', false);
        this._setControlsVisibility('layercontrol', false);
        this._setControlsVisibility('reload', false);
        this._setControlsVisibility('zoom', false);
        this._setControlsVisibility('geolocation', true);
        this._setControlsVisibility('scale', false);
        // prune the controls shown if necessary
        // this logic could be embedded in _showControls
        // but would require being able to iterate the domain of supported tokens
        // for the controlslist
        if (this._controlsList) {
            this._controlsList.forEach((value) => {
                switch (value.toLowerCase()) {
                    case 'nofullscreen':
                        this._setControlsVisibility('fullscreen', true);
                        break;
                    case 'nolayer':
                        this._setControlsVisibility('layercontrol', true);
                        break;
                    case 'noreload':
                        this._setControlsVisibility('reload', true);
                        break;
                    case 'nozoom':
                        this._setControlsVisibility('zoom', true);
                        break;
                    case 'geolocation':
                        this._setControlsVisibility('geolocation', false);
                        break;
                    case 'noscale':
                        this._setControlsVisibility('scale', true);
                        break;
                }
            });
        }
        // Hide layer control if no layers (will be uncommented when layer control is implemented)
        if (this._layerControl && this._layerControl._layers.length === 0) {
            this._layerControl._container.setAttribute('hidden', '');
        }
    }
    // delete the map controls that are private properties of this custom element
    _deleteControls() {
        delete this._layerControl;
        delete this._zoomControl;
        delete this._reloadButton;
        delete this._fullScreenControl;
        delete this._geolocationButton;
        delete this._scaleBar;
    }
    // Sets the control's visibility AND all its childrens visibility,
    // for the control element based on the Boolean hide parameter
    _setControlsVisibility(control, hide) {
        let container;
        switch (control) {
            case 'zoom':
                if (this._zoomControl) {
                    container = this._zoomControl._container;
                }
                break;
            case 'reload':
                if (this._reloadButton) {
                    container = this._reloadButton._container;
                }
                break;
            case 'fullscreen':
                if (this._fullScreenControl) {
                    container = this._fullScreenControl._container;
                }
                break;
            case 'layercontrol':
                if (this._layerControl) {
                    container = this._layerControl._container;
                }
                break;
            case 'geolocation':
                if (this._geolocationButton) {
                    container = this._geolocationButton._container;
                }
                break;
            case 'scale':
                if (this._scaleBar) {
                    container = this._scaleBar._container;
                }
                break;
        }
        if (container) {
            if (hide) {
                // setting the visibility for all the children of the element
                [...container.children].forEach((childEl) => {
                    childEl.setAttribute('hidden', '');
                });
                container.setAttribute('hidden', '');
            }
            else {
                // setting the visibility for all the children of the element
                [...container.children].forEach((childEl) => {
                    childEl.removeAttribute('hidden');
                });
                container.removeAttribute('hidden');
            }
        }
    }
    _toggleStatic() {
        // Mirror the original mapml-viewer _toggleStatic behavior
        if (this._map) {
            if (this.static) {
                this._map.dragging.disable();
                this._map.touchZoom.disable();
                this._map.doubleClickZoom.disable();
                this._map.scrollWheelZoom.disable();
                this._map.boxZoom.disable();
                this._map.keyboard.disable();
                this._zoomControl.disable();
            }
            else {
                this._map.dragging.enable();
                this._map.touchZoom.enable();
                this._map.doubleClickZoom.enable();
                this._map.scrollWheelZoom.enable();
                this._map.boxZoom.enable();
                this._map.keyboard.enable();
                this._zoomControl.enable();
            }
        }
    }
    _removeEvents() {
        if (this._map) {
            this._map.off();
        }
        if (this._boundDropHandler) {
            this.el.removeEventListener('drop', this._boundDropHandler, false);
        }
        if (this._boundDragoverHandler) {
            this.el.removeEventListener('dragover', this._boundDragoverHandler, false);
        }
    }
    _setUpEvents() {
        // Store bound handlers for cleanup
        this._boundDropHandler = this._dropHandler.bind(this);
        this._boundDragoverHandler = this._dragoverHandler.bind(this);
        // Set up drag and drop handlers for layers, geojson, and mapml URLs
        this.el.addEventListener('drop', this._boundDropHandler, false);
        this.el.addEventListener('dragover', this._boundDragoverHandler, false);
        // Set up map event handlers to sync with component props
        this._map.on('moveend', function () {
            this._updateMapCenter();
            this._addToHistory();
            this.el.dispatchEvent(new CustomEvent('map-moveend', { detail: { target: this } }));
        }, this);
        this._map.on('zoom', function () {
            this.el.dispatchEvent(new CustomEvent('map-zoom', { detail: { target: this } }));
        }, this);
        this._map.on('zoomend', function () {
            this._updateMapCenter();
            this.el.dispatchEvent(new CustomEvent('zoomend', { detail: { target: this } }));
        }, this);
        // Forward geolocation events from Leaflet to custom events
        this._map.on('locationfound', function (e) {
            this.el.dispatchEvent(new CustomEvent('maplocationfound', {
                detail: { latlng: e.latlng, accuracy: e.accuracy }
            }));
        }, this);
        this._map.on('locationerror', function (e) {
            this.el.dispatchEvent(new CustomEvent('maplocationerror', {
                detail: { message: e.message, code: e.code }
            }));
        }, this);
        // Set up zoom bounds management based on layer extents
        const setMapMinAndMaxZoom = ((e) => {
            this.whenLayersReady().then(() => {
                if (e && e.layer._layerEl) {
                    this._map.setMaxZoom(this.extent.zoom.maxZoom);
                    this._map.setMinZoom(this.extent.zoom.minZoom);
                }
            });
        }).bind(this);
        this.whenLayersReady().then(() => {
            this._map.setMaxZoom(this.extent.zoom.maxZoom);
            this._map.setMinZoom(this.extent.zoom.minZoom);
            this._map.on('layeradd layerremove', setMapMinAndMaxZoom, this);
        });
        // Handle Ctrl+V paste for layers, links and geojson
        this.el.addEventListener('keydown', (e) => {
            if (e.keyCode === 86 && e.ctrlKey) {
                navigator.clipboard.readText().then((layer) => {
                    Util._pasteLayer(this.el, layer);
                });
            }
            else if (e.keyCode === 32 &&
                this.el.shadowRoot.activeElement?.nodeName !== 'INPUT') {
                // Prevent default spacebar event on map
                e.preventDefault();
                this._map.fire('keypress', { originalEvent: e });
            }
        });
    }
    _dropHandler(event) {
        event.preventDefault();
        let text = event.dataTransfer.getData('text');
        Util._pasteLayer(this.el, text);
    }
    _dragoverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
    /**
     * Toggle debug overlay on the map
     */
    toggleDebug() {
        if (this._debug) {
            this._debug.remove();
            this._debug = undefined;
        }
        else {
            this._debug = debugOverlay().addTo(this._map);
        }
    }
    locate(options) {
        //options: https://leafletjs.com/reference.html#locate-options
        if (this._geolocationButton) {
            this._geolocationButton.stop();
        }
        if (options) {
            if (options.zoomTo) {
                options.setView = options.zoomTo;
                delete options.zoomTo;
            }
            this._map.locate(options);
        }
        else {
            this._map.locate({ setView: true, maxZoom: 16 });
        }
    }
    _changeWidth(width) {
        // Match mapml-viewer: modify the :host CSS rule, not inline styles
        // This allows light DOM CSS to override the shadow DOM default
        if (this._container) {
            this._container.style.width = width + 'px';
            // Modify the :host rule (always LAST stylesheet, first rule)
            const sheets = this.el.shadowRoot.styleSheets;
            if (sheets.length > 0) {
                sheets[sheets.length - 1].cssRules[0].style.width = width + 'px';
            }
        }
        if (this._map) {
            this._map.invalidateSize(false);
        }
    }
    _changeHeight(height) {
        // Match mapml-viewer: modify the :host CSS rule, not inline styles
        // This allows light DOM CSS to override the shadow DOM default
        if (this._container) {
            this._container.style.height = height + 'px';
            // Modify the :host rule (always LAST stylesheet, first rule)
            const sheets = this.el.shadowRoot.styleSheets;
            if (sheets.length > 0) {
                sheets[sheets.length - 1].cssRules[0].style.height = height + 'px';
            }
        }
        if (this._map) {
            this._map.invalidateSize(false);
        }
    }
    _updateMapCenter() {
        // Update component props to match map state and sync to DOM attributes
        // Note: Stencil mutable props don't automatically reflect changes back to DOM attributes
        if (this._map) {
            const center = this._map.getCenter();
            this.lat = center.lat;
            this.lon = center.lng;
            this.zoom = this._map.getZoom();
            // Manually sync the props back to DOM attributes
            this.el.setAttribute('lat', this.lat.toString());
            this.el.setAttribute('lon', this.lon.toString());
            this.el.setAttribute('zoom', this.zoom.toString());
        }
    }
    _resetHistory() {
        this._history = [];
        this._historyIndex = -1;
        this._traversalCall = false;
        // weird but ok (original comment)
        this._addToHistory();
    }
    _addToHistory() {
        // this._traversalCall tracks how many consecutive moveends to ignore from history
        // Check if we should ignore this moveend event due to programmatic navigation
        if (this._traversalCall && this._traversalCall > 0) {
            this._traversalCall--;
            return; // Don't add to history during back/forward/reload operations
        }
        let mapLocation = this._map.getPixelBounds().getCenter();
        let location = {
            zoom: this._map.getZoom(),
            x: mapLocation.x,
            y: mapLocation.y
        };
        this._historyIndex++;
        this._history.splice(this._historyIndex, 0, location);
        // Remove future history when adding new location while in middle of history
        if (this._historyIndex + 1 !== this._history.length) {
            this._history.length = this._historyIndex + 1;
        }
        // Update context menu button states based on history position
        this._updateNavigationControls();
        // Sync updated history properties to element for MapML controls
        this.el._history = this._history;
        this.el._historyIndex = this._historyIndex;
    }
    _updateNavigationControls() {
        // Centralize navigation control state management
        const canGoBack = this._historyIndex > 0;
        const canGoForward = this._historyIndex < this._history.length - 1;
        const canReload = this._historyIndex > 0;
        // Update context menu items
        this._map.contextMenu.toggleContextMenuItem('Back', canGoBack ? 'enabled' : 'disabled');
        this._map.contextMenu.toggleContextMenuItem('Forward', canGoForward ? 'enabled' : 'disabled');
        this._map.contextMenu.toggleContextMenuItem('Reload', canReload ? 'enabled' : 'disabled');
        // Update reload button
        if (canReload) {
            this._reloadButton?.enable();
        }
        else {
            this._reloadButton?.disable();
        }
    }
    /**
     * Navigate back in map history
     */
    back() {
        if (this._historyIndex <= 0)
            return;
        let curr = this._history[this._historyIndex];
        this._historyIndex--;
        let prev = this._history[this._historyIndex];
        // Set traversal call count based on operations needed
        if (prev.zoom !== curr.zoom) {
            this._traversalCall = 2; // panBy + setZoom
            let currScale = this._map.options.crs.scale(curr.zoom);
            let prevScale = this._map.options.crs.scale(prev.zoom);
            let scale = currScale / prevScale;
            this._map.panBy([prev.x * scale - curr.x, prev.y * scale - curr.y], { animate: false });
            this._map.setZoom(prev.zoom);
        }
        else {
            this._traversalCall = 1; // panBy only
            this._map.panBy([prev.x - curr.x, prev.y - curr.y]);
        }
        // Update controls immediately (don't wait for moveend)
        this._updateNavigationControls();
        // Sync to element
        this.el._historyIndex = this._historyIndex;
    }
    /**
     * Allows user to move forward in history
     */
    forward() {
        let history = this._history;
        let curr = history[this._historyIndex];
        if (this._historyIndex < history.length - 1) {
            this._map.contextMenu.toggleContextMenuItem('Back', 'enabled');
            this._historyIndex++;
            let next = history[this._historyIndex];
            // Disable forward contextmenu item when at the end of history
            if (this._historyIndex === history.length - 1) {
                this._map.contextMenu.toggleContextMenuItem('Forward', 'disabled');
            }
            if (next.zoom !== curr.zoom) {
                this._traversalCall = 2;
                let currScale = this._map.options.crs.scale(curr.zoom);
                let nextScale = this._map.options.crs.scale(next.zoom);
                let scale = currScale / nextScale;
                this._map.panBy([next.x * scale - curr.x, next.y * scale - curr.y], { animate: false });
                this._map.setZoom(next.zoom);
            }
            else {
                this._traversalCall = 1;
                this._map.panBy([next.x - curr.x, next.y - curr.y]);
            }
            // Update controls immediately (don't wait for moveend)
            this._updateNavigationControls();
            // Sync to element
            this.el._historyIndex = this._historyIndex;
        }
    }
    /**
     * Allows the user to reload/reset the map's location to its initial location
     * and reset the history to the initial state
     */
    reload() {
        if (this._history.length === 0)
            return;
        let initialLocation = this._history[0]; // Get initial location
        let curr = {
            zoom: this._map.getZoom(),
            x: this._map.getPixelBounds().getCenter().x,
            y: this._map.getPixelBounds().getCenter().y
        };
        // Reset history completely - this is the key change
        this._history = [initialLocation]; // Keep only the initial location
        this._historyIndex = 0; // Set to the only remaining entry
        // Set traversal call count based on operations needed
        if (initialLocation.zoom !== curr.zoom) {
            this._traversalCall = 2; // panBy + setZoom
            let currScale = this._map.options.crs.scale(curr.zoom);
            let initScale = this._map.options.crs.scale(initialLocation.zoom);
            let scale = currScale / initScale;
            this._map.panBy([initialLocation.x * scale - curr.x, initialLocation.y * scale - curr.y], { animate: false });
            this._map.setZoom(initialLocation.zoom);
        }
        else {
            this._traversalCall = 1; // panBy only
            this._map.panBy([initialLocation.x - curr.x, initialLocation.y - curr.y]);
        }
        // Update controls immediately - now with reset history state
        this._updateNavigationControls();
        // Sync reset history to element
        this.el._history = this._history;
        this.el._historyIndex = this._historyIndex;
        this._map.getContainer().focus();
    }
    /**
     * Internal method to toggle fullscreen (used by MapML context menu)
     */
    _toggleFullScreen() {
        this._map.toggleFullscreen();
    }
    /**
     * Open the map source in a new window
     */
    viewSource() {
        let blob = new Blob([this._source], { type: 'text/plain' }), url = URL.createObjectURL(blob);
        window.open(url);
        URL.revokeObjectURL(url);
    }
    /**
     * Zoom the map to a specific location and zoom level
     * @param lat - Latitude coordinate
     * @param lon - Longitude coordinate
     * @param zoom - Zoom level (optional, defaults to current zoom)
     */
    zoomTo(lat, lon, zoom) {
        // Ensure map is initialized before attempting to zoom
        if (!this._map) {
            console.warn('Map is not initialized. Cannot zoom to location.');
            return;
        }
        // Convert zoom to number if provided, otherwise use current zoom
        const targetZoom = (zoom !== undefined && Number.isInteger(+zoom)) ? +zoom : this.zoom;
        // Create LatLng object for the target location
        const location = new leafletSrcExports.LatLng(+lat, +lon);
        // Set the map view to the new location and zoom
        this._map.setView(location, targetZoom);
        // Update the component properties to reflect the new state
        // This matches the behavior in the original mapml-viewer.js
        // this.zoom = targetZoom;
        // this.lat = location.lat;
        // this.lon = location.lng;
        // The moveend event will fire automatically and:
        // 1. Call _updateMapCenter() to sync lat/lon/zoom props
        // 2. Call _addToHistory() to update the history stack
        // 3. Update context menu button states
    }
    async whenProjectionDefined(projection) {
        // Mirror the original whenProjectionDefined logic
        return new Promise((resolve, reject) => {
            if (window.M[projection]) {
                resolve(window.M[projection]);
            }
            else {
                reject(new Error('Projection ' + projection + ' is not defined'));
            }
        });
    }
    defineCustomProjection(jsonTemplate) {
        // Delegate to the global M.defineCustomProjection API
        if (window.M && window.M.defineCustomProjection) {
            window.M.defineCustomProjection(jsonTemplate);
            const t = JSON.parse(jsonTemplate);
            return t.projection;
        }
        else {
            throw new Error('MapML API not loaded');
        }
    }
    /**
     * Promise-based method to wait until map is ready
     * Returns a promise that resolves when the map is fully initialized
     */
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this.el._map) {
                resolve();
            }
            else {
                let viewer = this.el;
                interval = setInterval(testForMap, 200, viewer);
                failureTimer = setTimeout(mapNotDefined, 5000);
            }
            function testForMap(viewer) {
                if (viewer._map) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
            }
            function mapNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for map to be ready');
            }
        });
    }
    /**
     * Promise-based method to wait until all layers are ready
     * Returns a promise that resolves when all child layers are fully initialized
     */
    async whenLayersReady() {
        let layersReady = [];
        // Get all map-layer child elements
        const layers = this.el.querySelectorAll('map-layer');
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (layer.whenReady) {
                layersReady.push(layer.whenReady());
            }
        }
        return Promise.allSettled(layersReady);
    }
    /**
     * Convert GeoJSON to MapML and append as a layer
     * @param json - GeoJSON object (FeatureCollection, Feature, or Geometry)
     * @param options - Conversion options:
     *   - label: Layer label (defaults to json.name, json.title, or locale default)
     *   - projection: Target projection (defaults to map's projection)
     *   - caption: Feature caption property name or function
     *   - properties: Custom properties handling (function, string, or HTMLElement)
     *   - geometryFunction: Custom geometry processing function
     * @returns The created map-layer element
     */
    geojson2mapml(json, options = {}) {
        // Use current map projection if not specified
        if (options.projection === undefined) {
            options.projection = this.projection;
        }
        // Call Util.geojson2mapml to create the layer element
        let geojsonLayer = Util.geojson2mapml(json, options);
        // Append the layer to the map
        this.el.appendChild(geojsonLayer);
        return geojsonLayer;
    }
    render() {
        return null;
    }
    static get watchers() { return {
        "controls": ["controlsChanged"],
        "_controlslist": ["controlsListChanged"],
        "projection": ["projectionChanged"],
        "static": ["staticChanged"]
    }; }
};
GcdsMap.style = gcdsMapCss;

var MapLayer = leafletSrcExports.LayerGroup.extend({
  options: {
    zIndex: 0,
    opacity: '1.0'
  },
  // initialize is executed before the layer is added to a map
  initialize: function (href, layerEl, options) {
    // in the custom element, the attribute is actually 'src'
    // the _href version is the URL received from map-layer@src
    leafletSrcExports.LayerGroup.prototype.initialize.call(this, null, options);
    if (href) {
      this._href = href;
    }
    this._layerEl = layerEl;
    this._content = layerEl.src ? layerEl.shadowRoot : layerEl;
    leafletSrcExports.setOptions(this, options);
    this._container = leafletSrcExports.DomUtil.create('div', 'leaflet-layer');
    this.changeOpacity(this.options.opacity);
    leafletSrcExports.DomUtil.addClass(this._container, 'mapml-layer');

    // hit the service to determine what its extent might be
    // OR use the extent of the content provided

    this._initialize(this._content);
  },
  getContainer: function () {
    return this._container;
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();

    return this;
  },
  getHref: function () {
    return this._href ?? '';
  },
  _updateZIndex: function () {
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
  },
  changeOpacity: function (opacity) {
    this._container.style.opacity = opacity;
    this._layerEl._opacity = opacity;
    if (this._layerEl._opacitySlider)
      this._layerEl._opacitySlider.value = opacity;
  },
  titleIsReadOnly() {
    return !!this._titleIsReadOnly;
  },
  setName(newName) {
    // a layer's accessible name is set by the <map-title>, if present
    // if it's not available the <map-layer label="accessible-name"> attribute
    // can be used
    if (!this.titleIsReadOnly()) {
      this._title = newName;
      this._layerEl._layerControlHTML.querySelector(
        '.mapml-layer-item-name'
      ).innerHTML = newName;
    }
  },
  getName() {
    return this._title;
  },

  onAdd: function (map) {
    this.getPane().appendChild(this._container);
    leafletSrcExports.LayerGroup.prototype.onAdd.call(this, map);

    this.setZIndex(this.options.zIndex);
    map.on('popupopen', this._attachSkipButtons, this);
  },

  _calculateBounds: function () {
    delete this.bounds;
    delete this.zoomBounds;
    let bnds, zoomBounds;
    let layerTypes = ['_staticTileLayer', '_mapmlvectors', '_extentLayer'];
    bnds =
      this._layerEl.src &&
      this._layerEl.shadowRoot.querySelector(
        ':host > map-meta[name=extent][content]'
      )
        ? Util.getBoundsFromMeta(this._layerEl.shadowRoot)
        : this._layerEl.querySelector(':scope > map-meta[name=extent][content]')
        ? Util.getBoundsFromMeta(this._layerEl)
        : undefined;
    zoomBounds =
      this._layerEl.src &&
      this._layerEl.shadowRoot.querySelector(
        ':host > map-meta[name=zoom][content]'
      )
        ? Util.getZoomBoundsFromMeta(this._layerEl.shadowRoot)
        : this._layerEl.querySelector(':scope > map-meta[name=zoom][content]')
        ? Util.getZoomBoundsFromMeta(this._layerEl)
        : undefined;
    const mapExtents = this._layerEl.src
      ? this._layerEl.shadowRoot.querySelectorAll('map-extent')
      : this._layerEl.querySelectorAll('map-extent');
    layerTypes.forEach((type) => {
      let zoomMax, zoomMin, minNativeZoom, maxNativeZoom;
      if (zoomBounds) {
        zoomMax = zoomBounds.maxZoom;
        zoomMin = zoomBounds.minZoom;
        maxNativeZoom = zoomBounds.maxNativeZoom
          ? zoomBounds.maxNativeZoom
          : -Infinity;
        minNativeZoom = zoomBounds.minNativeZoom
          ? zoomBounds.minNativeZoom
          : Infinity;
      }
      if (type === '_extentLayer' && mapExtents.length) {
        for (let i = 0; i < mapExtents.length; i++) {
          if (mapExtents[i]._extentLayer?.bounds) {
            let mapExtentLayer = mapExtents[i]._extentLayer;
            if (!bnds) {
              bnds = leafletSrcExports.bounds(
                mapExtentLayer.bounds.min,
                mapExtentLayer.bounds.max
              );
            } else {
              bnds.extend(mapExtentLayer.bounds);
            }
            if (mapExtentLayer.zoomBounds) {
              if (!zoomBounds) {
                zoomBounds = mapExtentLayer.zoomBounds;
              } else {
                // Extend layer zoombounds
                zoomMax = Math.max(zoomMax, mapExtentLayer.zoomBounds.maxZoom);
                zoomMin = Math.min(zoomMin, mapExtentLayer.zoomBounds.minZoom);
                maxNativeZoom = Math.max(
                  maxNativeZoom,
                  mapExtentLayer.zoomBounds.maxNativeZoom
                );
                minNativeZoom = Math.min(
                  minNativeZoom,
                  mapExtentLayer.zoomBounds.minNativeZoom
                );
                zoomBounds.minZoom = zoomMin;
                zoomBounds.maxZoom = zoomMax;
                zoomBounds.minNativeZoom = minNativeZoom;
                zoomBounds.maxNativeZoom = maxNativeZoom;
              }
            }
          }
        }
      } else if (type === '_mapmlvectors') {
        // Iterate through individual MapFeatureLayer instances in the LayerGroup
        this.eachLayer(function (layer) {
          // Check if this is a MapFeatureLayer
          if (layer instanceof MapFeatureLayer && layer.layerBounds) {
            if (!bnds) {
              bnds = layer.layerBounds;
            } else {
              bnds.extend(layer.layerBounds);
            }
          }
          if (layer instanceof MapFeatureLayer && layer.zoomBounds) {
            if (!zoomBounds) {
              zoomBounds = layer.zoomBounds;
            } else {
              // Extend layer zoombounds
              zoomMax = Math.max(zoomMax, layer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, layer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                layer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                layer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        });
      } else {
        // inline tiles
        this.eachLayer((layer) => {
          if (layer instanceof MapTileLayer) {
            if (layer.layerBounds) {
              if (!bnds) {
                bnds = layer.layerBounds;
              } else {
                bnds.extend(layer.layerBounds);
              }
            }

            if (layer.zoomBounds) {
              // Extend zoomBounds with layer zoomBounds
              zoomMax = Math.max(zoomMax, layer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, layer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                layer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                layer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        });
      }
    });
    if (bnds) {
      this.bounds = bnds;
    } else {
      let projectionBounds = M[this.options.projection].options.bounds;
      this.bounds = leafletSrcExports.bounds(projectionBounds.min, projectionBounds.max);
    }
    // we could get here and zoomBounds might still not be defined (empty layer)
    if (!zoomBounds) zoomBounds = {};
    if (!zoomBounds.minZoom) {
      zoomBounds.minZoom = 0;
    }
    if (!zoomBounds.maxZoom) {
      zoomBounds.maxZoom =
        M[this.options.projection].options.resolutions.length - 1;
    }
    if (zoomBounds.minNativeZoom === Infinity) {
      zoomBounds.minNativeZoom = zoomBounds.minZoom;
    }
    if (zoomBounds.maxNativeZoom === -Infinity) {
      zoomBounds.maxNativeZoom = zoomBounds.maxZoom;
    }
    this.zoomBounds = zoomBounds;
  },

  onRemove: function (map) {
    leafletSrcExports.LayerGroup.prototype.onRemove.call(this, map);
    leafletSrcExports.DomUtil.remove(this._container);
    map.off('popupopen', this._attachSkipButtons);
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  getBase: function () {
    return new URL(
      this._content.querySelector('map-base')
        ? this._content.querySelector('map-base').getAttribute('href')
        : this._content.nodeName === 'MAP-LAYER' ||
          this._content.nodeName === 'LAYER-'
        ? this._content.baseURI
        : this._href,
      this._href
    ).href;
  },
  renderStyles,
  _initialize: function () {
    var layer = this;
    layer.getBase();
      var mapml = this._content;
    parseLicenseAndLegend();
    setLayerTitle();
    // update controls if needed based on mapml-viewer controls/controlslist attribute
    if (layer._layerEl.parentElement) {
      // if layer does not have a parent Element, do not need to set Controls
      layer._layerEl.parentElement._toggleControls();
    }
    // local functions
    function setLayerTitle() {
      if (mapml.querySelector('map-title')) {
        layer._title = mapml.querySelector('map-title').textContent.trim();
        layer._titleIsReadOnly = true;
      } else if (layer._layerEl && layer._layerEl.hasAttribute('label')) {
        layer._title = layer._layerEl.getAttribute('label').trim();
      }
    }
    function parseLicenseAndLegend() {
      var licenseLink = mapml.querySelector('map-link[rel=license]'),
        licenseTitle,
        licenseUrl,
        attText;
      if (licenseLink) {
        licenseTitle = licenseLink.getAttribute('title');
        licenseUrl = licenseLink.getAttribute('href');
        attText =
          '<a href="' +
          licenseUrl +
          '" title="' +
          licenseTitle +
          '">' +
          licenseTitle +
          '</a>';
      }
      leafletSrcExports.setOptions(layer, { attribution: attText });
      var legendLink = mapml.querySelector('map-link[rel=legend]');
      if (legendLink) {
        layer._legendUrl = legendLink.getAttribute('href');
      }
      if (layer._map) {
        // if the layer is checked in the layer control, force the addition
        // of the attribution just received
        if (layer._map.hasLayer(layer)) {
          layer._map.attributionControl.addAttribution(layer.getAttribution());
        }
      }
    }
  },
  getQueryTemplates: function (location, zoom) {
    const queryLinks = this._layerEl.querySelectorAll(
      'map-extent[checked] map-link[rel=query]'
    ).length
      ? this._layerEl.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        )
      : this._layerEl.shadowRoot.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        ).length
      ? this._layerEl.shadowRoot.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        )
      : null;
    if (queryLinks) {
      var templates = [];
      for (let i = 0; i < queryLinks.length; i++) {
        const minZoom = queryLinks[i].extent.zoom.minZoom,
          maxZoom = queryLinks[i].extent.zoom.maxZoom,
          withinZoomBounds = (z) => {
            return minZoom <= z && z <= maxZoom;
          },
          bounds = queryLinks[i].getBounds();

        if (bounds.contains(location) && withinZoomBounds(zoom)) {
          templates.push(queryLinks[i]._templateVars);
        }
      }
      return templates;
    }
  },
  _attachSkipButtons: function (e) {
    let popup = e.popup,
      map = e.target,
      layer,
      group,
      content = popup._container.getElementsByClassName(
        'mapml-popup-content'
      )[0];

    popup._container.setAttribute('role', 'dialog');
    content.setAttribute('tabindex', '-1');
    // https://github.com/Maps4HTML/MapML.js/pull/467#issuecomment-844307818
    content.setAttribute('role', 'document');
    popup._count = 0; // used for feature pagination

    if (popup._source._eventParents) {
      // check if the popup is for a feature or query
      layer =
        popup._source._eventParents[
          Object.keys(popup._source._eventParents)[0]
        ]; // get first parent of feature, there should only be one
      group = popup._source.group;
      // if the popup is for a static / templated feature, the "zoom to here" link can be attached once the popup opens
      attachZoomLink.call(popup);
    } else {
      // getting access to the first map-extent to get access to _extentLayer to use it's (possibly) generic _previousFeature + _nextFeature methods.
      const mapExtent =
        popup._source._layerEl.querySelector('map-extent') ||
        popup._source._layerEl.shadowRoot.querySelector('map-extent');
      layer = mapExtent._extentLayer;
      // if the popup is for a query, the "zoom to here" link should be re-attached every time new pagination features are displayed
      map.on('attachZoomLink', attachZoomLink, popup);
    }

    if (popup._container.querySelector('nav[class="mapml-focus-buttons"]')) {
      leafletSrcExports.DomUtil.remove(
        popup._container.querySelector('nav[class="mapml-focus-buttons"]')
      );
      leafletSrcExports.DomUtil.remove(popup._container.querySelector('hr'));
    }
    //add when popopen event happens instead
    let div = leafletSrcExports.DomUtil.create('nav', 'mapml-focus-buttons');
    // creates |< button, focuses map
    let mapFocusButton = leafletSrcExports.DomUtil.create('button', 'mapml-popup-button', div);
    mapFocusButton.type = 'button';
    mapFocusButton.title = map.options.mapEl.locale.kbdFocusMap;
    mapFocusButton.innerHTML = "<span aria-hidden='true'>|&#10094;</span>";
    leafletSrcExports.DomEvent.on(
      mapFocusButton,
      'click',
      (e) => {
        leafletSrcExports.DomEvent.stop(e);
        map.featureIndex._sortIndex();
        map.closePopup();
        map._container.focus();
      },
      popup
    );

    // creates < button, focuses previous feature, if none exists focuses the current feature
    let previousButton = leafletSrcExports.DomUtil.create('button', 'mapml-popup-button', div);
    previousButton.type = 'button';
    previousButton.title = map.options.mapEl.locale.kbdPrevFeature;
    previousButton.innerHTML = "<span aria-hidden='true'>&#10094;</span>";
    leafletSrcExports.DomEvent.on(previousButton, 'click', layer._previousFeature, popup);

    // static feature counter that 1/1
    let featureCount = leafletSrcExports.DomUtil.create('p', 'mapml-feature-count', div),
      totalFeatures = this._totalFeatureCount ? this._totalFeatureCount : 1;
    featureCount.innerText = popup._count + 1 + '/' + totalFeatures;

    // creates > button, focuses next feature, if none exists focuses the current feature
    let nextButton = leafletSrcExports.DomUtil.create('button', 'mapml-popup-button', div);
    nextButton.type = 'button';
    nextButton.title = map.options.mapEl.locale.kbdNextFeature;
    nextButton.innerHTML = "<span aria-hidden='true'>&#10095;</span>";
    leafletSrcExports.DomEvent.on(nextButton, 'click', layer._nextFeature, popup);

    // creates >| button, focuses map controls
    let controlFocusButton = leafletSrcExports.DomUtil.create(
      'button',
      'mapml-popup-button',
      div
    );
    controlFocusButton.type = 'button';
    controlFocusButton.title = map.options.mapEl.locale.kbdFocusControls;
    controlFocusButton.innerHTML = "<span aria-hidden='true'>&#10095;|</span>";
    leafletSrcExports.DomEvent.on(
      controlFocusButton,
      'click',
      (e) => {
        map.featureIndex._sortIndex();
        map.featureIndex.currentIndex =
          map.featureIndex.inBoundFeatures.length - 1;
        map.featureIndex.inBoundFeatures[0]?.path.setAttribute('tabindex', -1);
        map.featureIndex.inBoundFeatures[
          map.featureIndex.currentIndex
        ]?.path.setAttribute('tabindex', 0);
        leafletSrcExports.DomEvent.stop(e);
        map.closePopup();
        map._controlContainer.querySelector('A:not([hidden])').focus();
      },
      popup
    );

    let divider = leafletSrcExports.DomUtil.create('hr', 'mapml-popup-divider');

    popup._navigationBar = div;
    popup._content.parentElement.parentElement.appendChild(divider);
    popup._content.parentElement.parentElement.appendChild(div);

    content.focus();

    if (group && !M.options.featureIndexOverlayOption) {
      // e.target = this._map
      // Looks for keydown, more specifically tab and shift tab
      group.setAttribute('aria-expanded', 'true');
      map.on('keydown', focusFeature);
    } else {
      map.on('keydown', focusMap);
    }
    // When popup is open, what gets focused with tab needs to be done using JS as the DOM order is not in an accessibility friendly manner
    function focusFeature(focusEvent) {
      let path =
        focusEvent.originalEvent.path ||
        focusEvent.originalEvent.composedPath();
      let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;
      if (
        (path[0].classList.contains('leaflet-popup-close-button') &&
          isTab &&
          !shiftPressed) ||
        focusEvent.originalEvent.keyCode === 27 ||
        (path[0].classList.contains('leaflet-popup-close-button') &&
          focusEvent.originalEvent.keyCode === 13)
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          leafletSrcExports.DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0].classList.contains('mapml-popup-content') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          //timeout needed so focus of the feature is done even after the keypressup event occurs
          map.closePopup(popup);
          group.focus();
          leafletSrcExports.DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          leafletSrcExports.DomEvent.stop(focusEvent);
        }, 0);
      }
    }

    function focusMap(focusEvent) {
      let path =
        focusEvent.originalEvent.path ||
        focusEvent.originalEvent.composedPath();
      let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;

      if (
        (focusEvent.originalEvent.keyCode === 13 &&
          path[0].classList.contains('leaflet-popup-close-button')) ||
        focusEvent.originalEvent.keyCode === 27
      ) {
        leafletSrcExports.DomEvent.stopPropagation(focusEvent);
        map.closePopup(popup);
        map._container.focus();
        if (focusEvent.originalEvent.keyCode !== 27) map._popupClosed = true;
      } else if (
        isTab &&
        path[0].classList.contains('leaflet-popup-close-button')
      ) {
        map.closePopup(popup);
      } else if (
        path[0].classList.contains('mapml-popup-content') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          //timeout needed so focus of the feature is done even after the keypressup event occurs
          leafletSrcExports.DomEvent.stop(focusEvent);
          map._container.focus();
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          leafletSrcExports.DomEvent.stop(focusEvent);
          map.getContainer.focus();
        }, 0);
      }
    }

    function attachZoomLink(e) {
      // this === popup
      let popupWrapper = this._wrapper,
        featureEl = e ? e.currFeature : this._source._groupLayer._featureEl;
      if (popupWrapper.querySelector('a.mapml-zoom-link')) {
        popupWrapper.querySelector('a.mapml-zoom-link').remove();
      }

      // return early if feature doesn't have map-geometry
      if (!featureEl.querySelector('map-geometry')) return;

      // calculate zoom parameters
      let tL = featureEl.extent.topLeft.gcrs,
        bR = featureEl.extent.bottomRight.gcrs,
        center = leafletSrcExports.latLngBounds(
          leafletSrcExports.latLng(tL.horizontal, tL.vertical),
          leafletSrcExports.latLng(bR.horizontal, bR.vertical)
        ).getCenter(true);

      // construct zoom link
      let zoomLink = document.createElement('a');
      zoomLink.href = `#${featureEl.getZoomToZoom()},${center.lng},${
        center.lat
      }`;
      zoomLink.innerHTML = `${map.options.mapEl.locale.popupZoom}`;
      zoomLink.className = 'mapml-zoom-link';

      // handle zoom link interactions
      zoomLink.onclick = zoomLink.onkeydown = function (e) {
        if (!(e instanceof MouseEvent) && e.keyCode !== 13) return;
        e.preventDefault();
        featureEl.zoomTo();
        map.closePopup();
        map.getContainer().focus();
      };

      // we found that the popupopen event is fired as many times as there
      // are layers on the map (<map-layer> elements / MapLayers that is).
      // In each case the target layer is always this layer, so we can't
      // detect and conditionally add the zoomLink if the target is not this.
      // so, like Ahmad, we are taking a 'delete everyting each time'
      // approach (see _attachSkipButtons for this approach taken with
      // feature navigation buttons); obviously he dealt with this leaflet bug
      // this way some time ago, and we can't figure out how to get around it
      // apart from this slightly non-optimal method. Revisit sometime!
      let link = popupWrapper.querySelector('.mapml-zoom-link');
      if (link) link.remove();

      // attach link to popup
      popupWrapper.insertBefore(
        zoomLink,
        popupWrapper.querySelector('hr.mapml-popup-divider')
      );
    }

    // if popup closes then the focusFeature handler can be removed
    map.on('popupclose', removeHandlers);
    function removeHandlers(removeEvent) {
      if (removeEvent.popup === popup) {
        map.off('keydown', focusFeature);
        map.off('keydown', focusMap);
        map.off('popupopen', attachZoomLink);
        map.off('popupclose', removeHandlers);
        if (group) group.setAttribute('aria-expanded', 'false');
      }
    }
  }
});
var mapLayer = function (url, node, options) {
  if (!url && !node) return null;
  return new MapLayer(url, node, options);
};

var createLayerControlHTML = async function () {
  var fieldset = leafletSrcExports.DomUtil.create('fieldset', 'mapml-layer-item'),
    input = leafletSrcExports.DomUtil.create('input'),
    layerItemName = leafletSrcExports.DomUtil.create('span', 'mapml-layer-item-name'),
    settingsButtonNameIcon = leafletSrcExports.DomUtil.create('span'),
    layerItemProperty = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-layer-item-properties',
      fieldset
    ),
    layerItemSettings = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-layer-item-settings',
      fieldset
    ),
    itemToggleLabel = leafletSrcExports.DomUtil.create(
      'label',
      'mapml-layer-item-toggle',
      layerItemProperty
    ),
    layerItemControls = leafletSrcExports.DomUtil.create(
      'div',
      'mapml-layer-item-controls',
      layerItemProperty
    ),
    opacityControl = leafletSrcExports.DomUtil.create(
      'details',
      'mapml-layer-item-opacity mapml-control-layers',
      layerItemSettings
    ),
    opacity = leafletSrcExports.DomUtil.create('input'),
    opacityControlSummary = leafletSrcExports.DomUtil.create('summary'),
    svgSettingsControlIcon = leafletSrcExports.SVG.create('svg'),
    settingsControlPath1 = leafletSrcExports.SVG.create('path'),
    settingsControlPath2 = leafletSrcExports.SVG.create('path'),
    extentsFieldset = leafletSrcExports.DomUtil.create('fieldset', 'mapml-layer-grouped-extents'),
    mapEl = this.parentNode;
    opacity.setAttribute('data-testid', 'layer-item-opacity');

  // append the paths in svg for the remove layer and toggle icons
  svgSettingsControlIcon.setAttribute('viewBox', '0 0 24 24');
  svgSettingsControlIcon.setAttribute('height', '22');
  svgSettingsControlIcon.setAttribute('width', '22');
  svgSettingsControlIcon.setAttribute('fill', 'currentColor');
  settingsControlPath1.setAttribute('d', 'M0 0h24v24H0z');
  settingsControlPath1.setAttribute('fill', 'none');
  settingsControlPath2.setAttribute(
    'd',
    'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
  );
  svgSettingsControlIcon.appendChild(settingsControlPath1);
  svgSettingsControlIcon.appendChild(settingsControlPath2);

  layerItemSettings.hidden = true;
  settingsButtonNameIcon.setAttribute('aria-hidden', true);

  let removeControlButton = leafletSrcExports.DomUtil.create(
    'button',
    'mapml-layer-item-remove-control',
    layerItemControls
  );
  removeControlButton.type = 'button';
  removeControlButton.title = mapEl.locale.lmRemoveLayer;
  removeControlButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
  removeControlButton.classList.add('mapml-button');
  leafletSrcExports.DomEvent.on(removeControlButton, 'click', leafletSrcExports.DomEvent.stop);
  leafletSrcExports.DomEvent.on(
    removeControlButton,
    'click',
    (e) => {
      let fieldset = 0,
        elem,
        root;
      root =
        mapEl.tagName === 'GCDS-MAP'
          ? mapEl.shadowRoot
          : mapEl.querySelector('.mapml-web-map').shadowRoot;
      if (
        e.target.closest('fieldset').nextElementSibling &&
        !e.target.closest('fieldset').nextElementSibling.disbaled
      ) {
        elem = e.target.closest('fieldset').previousElementSibling;
        while (elem) {
          fieldset += 2; // find the next layer menu item
          elem = elem.previousElementSibling;
        }
      } else {
        // focus on the link
        elem = 'link';
      }
      mapEl.removeChild(
        e.target.closest('fieldset').querySelector('span').layer._layerEl
      );
      elem = elem
        ? root.querySelector('.leaflet-control-attribution').firstElementChild
        : (elem = root.querySelectorAll('input')[fieldset]);
      elem.focus();
    },
    this._layer
  );

  let itemSettingControlButton = leafletSrcExports.DomUtil.create(
    'button',
    'mapml-layer-item-settings-control',
    layerItemControls
  );
  itemSettingControlButton.type = 'button';
  itemSettingControlButton.title = mapEl.locale.lmLayerSettings;
  itemSettingControlButton.setAttribute('aria-expanded', false);
  itemSettingControlButton.classList.add('mapml-button');
  leafletSrcExports.DomEvent.on(
    itemSettingControlButton,
    'click',
    (e) => {
      let layerControl = this._layer._layerEl._layerControl._container;
      if (!layerControl._isExpanded && e.pointerType === 'touch') {
        layerControl._isExpanded = true;
        return;
      }
      if (layerItemSettings.hidden === true) {
        itemSettingControlButton.setAttribute('aria-expanded', true);
        layerItemSettings.hidden = false;
      } else {
        itemSettingControlButton.setAttribute('aria-expanded', false);
        layerItemSettings.hidden = true;
      }
    },
    this._layer
  );

  input.defaultChecked = this.checked;
  input.type = 'checkbox';
  input.setAttribute('class', 'leaflet-control-layers-selector');
  input.setAttribute('data-testid', 'layer-item-checkbox');
  layerItemName.layer = this._layer;
  const changeCheck = function () {
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('map-change'));
    this._layerControlCheckbox.focus();
  };
  input.addEventListener('change', changeCheck.bind(this));
  if (this._layer._legendUrl) {
    var legendLink = document.createElement('a');
    legendLink.text = ' ' + this._layer._title;
    legendLink.href = this._layer._legendUrl;
    legendLink.target = '_blank';
    legendLink.draggable = false;
    layerItemName.appendChild(legendLink);
  } else {
    layerItemName.innerHTML = this._layer._title;
  }
  layerItemName.id = 'mapml-layer-item-name-{' + leafletSrcExports.stamp(layerItemName) + '}';
  opacityControlSummary.innerText = mapEl.locale.lcOpacity;
  opacityControlSummary.id =
    'mapml-layer-item-opacity-' + leafletSrcExports.stamp(opacityControlSummary);
  opacityControl.appendChild(opacityControlSummary);
  opacityControl.appendChild(opacity);
  opacity.setAttribute('type', 'range');
  opacity.setAttribute('min', '0');
  opacity.setAttribute('max', '1.0');
  opacity.setAttribute('value', this._opacity || '1.0');
  opacity.setAttribute('step', '0.1');
  opacity.setAttribute(
    'aria-labelledby',
    'mapml-layer-item-opacity-' + leafletSrcExports.stamp(opacityControlSummary)
  );

  const changeOpacity = function (e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this._layer.changeOpacity(e.target.value);
    }
  };
  opacity.value = this._opacity || '1.0';
  opacity.addEventListener('change', changeOpacity.bind(this));

  fieldset.setAttribute('aria-grabbed', 'false');
  fieldset.setAttribute('aria-labelledby', layerItemName.id);

  fieldset.ontouchstart = fieldset.onmousedown = (downEvent) => {
    if (
      (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
        downEvent.target.tagName.toLowerCase() !== 'input') ||
      downEvent.target.tagName.toLowerCase() === 'label'
    ) {
      downEvent =
        downEvent instanceof TouchEvent ? downEvent.touches[0] : downEvent;
      let control = fieldset,
        controls = fieldset.parentNode,
        moving = false,
        yPos = downEvent.clientY,
        originalPosition = Array.from(
          controls.querySelectorAll('fieldset')
        ).indexOf(fieldset);

      document.body.ontouchmove = document.body.onmousemove = (moveEvent) => {
        moveEvent.preventDefault();
        moveEvent =
          moveEvent instanceof TouchEvent ? moveEvent.touches[0] : moveEvent;

        // Fixes flickering by only moving element when there is enough space
        let offset = moveEvent.clientY - yPos;
        moving = Math.abs(offset) > 15 || moving;
        if (
          (controls && !moving) ||
          (controls && controls.childElementCount <= 1) ||
          controls.getBoundingClientRect().top >
            control.getBoundingClientRect().bottom ||
          controls.getBoundingClientRect().bottom <
            control.getBoundingClientRect().top
        ) {
          return;
        }

        controls.classList.add('mapml-draggable');
        control.style.transform = 'translateY(' + offset + 'px)';
        control.style.pointerEvents = 'none';

        let x = moveEvent.clientX,
          y = moveEvent.clientY,
          root =
            mapEl.tagName === 'GCDS-MAP'
              ? mapEl.shadowRoot
              : mapEl.querySelector('.mapml-web-map').shadowRoot,
          elementAt = root.elementFromPoint(x, y),
          swapControl =
            !elementAt || !elementAt.closest('fieldset')
              ? control
              : elementAt.closest('fieldset');

        swapControl =
          Math.abs(offset) <= swapControl.offsetHeight ? control : swapControl;

        control.setAttribute('aria-grabbed', 'true');
        control.setAttribute('aria-dropeffect', 'move');
        if (swapControl && controls === swapControl.parentNode) {
          swapControl =
            swapControl !== control.nextSibling
              ? swapControl
              : swapControl.nextSibling;
          if (control !== swapControl) {
            yPos = moveEvent.clientY;
            control.style.transform = null;
          }
          controls.insertBefore(control, swapControl);
        }
      };

      document.body.ontouchend = document.body.onmouseup = () => {
        let newPosition = Array.from(
          controls.querySelectorAll('fieldset')
        ).indexOf(fieldset);
        control.setAttribute('aria-grabbed', 'false');
        control.removeAttribute('aria-dropeffect');
        control.style.pointerEvents = null;
        control.style.transform = null;
        if (originalPosition !== newPosition) {
          let controlsElems = controls.children,
            zIndex = 1;
          // re-order layer elements DOM order
          for (let c of controlsElems) {
            let layerEl = c.querySelector('span').layer._layerEl;
            layerEl.setAttribute('data-moving', '');
            mapEl.insertAdjacentElement('beforeend', layerEl);
            layerEl.removeAttribute('data-moving');
          }
          // update zIndex of all map-layer elements
          let layers = mapEl.querySelectorAll('map-layer,layer-');
          for (let i = 0; i < layers.length; i++) {
            let layer = layers[i]._layer;
            if (layer.options.zIndex !== zIndex) {
              layer.setZIndex(zIndex);
            }
            zIndex++;
          }
        }
        controls.classList.remove('mapml-draggable');
        document.body.ontouchmove =
          document.body.onmousemove =
          document.body.onmouseup =
            null;
      };
    }
  };

  itemToggleLabel.appendChild(input);
  itemToggleLabel.appendChild(layerItemName);
  itemSettingControlButton.appendChild(settingsButtonNameIcon);
  settingsButtonNameIcon.appendChild(svgSettingsControlIcon);

  let mapml = this.src ? this.shadowRoot : this;
  var styleLinks = mapml.querySelectorAll(
    'map-link[rel=style],map-link[rel="self style"],map-link[rel="style self"]'
  );
  let styles;
  if (styleLinks) {
    styles = this.getAlternateStyles(styleLinks);
    if (styles) {
      layerItemSettings.appendChild(styles);
    }
  }

  this._layerControlCheckbox = input;
  this._layerControlLabel = itemToggleLabel;
  this._opacityControl = opacityControl;
  this._opacitySlider = opacity;
  this._layerControlHTML = fieldset;
  this._layerItemSettingsHTML = layerItemSettings;
  this._propertiesGroupAnatomy = extentsFieldset;
  this._styles = styles;
  extentsFieldset.setAttribute('aria-label', 'Sublayers');
  extentsFieldset.setAttribute('hidden', '');
  let mapExtents = mapml.querySelectorAll('map-extent:not([hidden])');
  let mapExtentLayerControls = [];
  for (let i = 0; i < mapExtents.length; i++) {
    mapExtentLayerControls.push(mapExtents[i].whenReady());
    // if any map-extent is not hidden, the parent fieldset should not be hidden
    extentsFieldset.removeAttribute('hidden');
  }
  await Promise.all(mapExtentLayerControls);
  for (let i = 0; i < mapExtents.length; i++) {
    extentsFieldset.appendChild(mapExtents[i].getLayerControlHTML());
  }
  layerItemSettings.appendChild(extentsFieldset);
  return this._layerControlHTML;
};

const GcdsMapLayer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
    // Core properties matching BaseLayerElement observedAttributes
    src;
    checked;
    hidden = false;
    opacity = 1;
    _opacity;
    media;
    get opacityValue() {
        return this._opacity ?? this.opacity ?? 1.0;
    }
    _layer;
    _layerControl;
    _layerControlHTML;
    _layerItemSettingsHTML;
    _propertiesGroupAnatomy;
    disabled = false;
    _fetchError = false;
    // the layer registry is a semi-private Map stored on each map-link and map-layer element
    // structured as follows: position -> {layer: layerInstance, count: number}
    // where layer is either a MapTileLayer or a MapFeatureLayer, 
    // and count is the number of tiles or features in that layer
    _layerRegistry = new Map();
    // Watchers for attribute changes - these automatically don't fire during initial load
    srcChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            this._onRemove();
            if (this.el.isConnected) {
                this._onAdd();
            }
        }
    }
    checkedChanged(newValue) {
        if (this._layer) {
            // Get the parent map element
            const mapEl = this.getMapEl();
            if (mapEl && mapEl._map) {
                const leafletMap = mapEl._map;
                if (newValue) {
                    // If checked is true, add the layer to the map
                    leafletMap.addLayer(this._layer);
                }
                else {
                    // If checked is false, remove the layer from the map
                    leafletMap.removeLayer(this._layer);
                }
            }
            // Update the layer control checkbox to match the checked state
            if (this._layerControlCheckbox) {
                this._layerControlCheckbox.checked = newValue;
            }
        }
    }
    opacityChanged(newValue, oldValue) {
        // This watcher handles programmatic changes to the opacity property
        if (oldValue !== newValue && this._layer) {
            this._opacity = newValue;
            this._layer.changeOpacity(newValue);
            // reflect to map-layer opacity attribute when opacity property changes
            // this.el.setAttribute('opacity', newValue.toString());
            // Update opacity slider if it exists
            if (this._opacitySlider) {
                this._opacitySlider.value = newValue.toString();
            }
        }
    }
    mediaChanged(newValue, oldValue) {
        if (oldValue !== newValue) {
            this._registerMediaQuery(newValue);
        }
    }
    hiddenChanged(newValue, oldValue) {
        // Only process hidden changes after the layer is fully initialized
        // During initial load, this will be handled in _attachedToMap()
        if (oldValue !== newValue && this._layer && this._layerControl) {
            this._applyHiddenState(newValue);
        }
    }
    _applyHiddenState(isHidden) {
        if (!this._layer || !this._layerControl)
            return;
        if (isHidden) {
            // Hidden was set to true - remove from layer control
            this._layerControl.removeLayer(this._layer);
        }
        else {
            // Hidden was set to false - add back to layer control and validate
            this._layerControl.addOrUpdateOverlay(this._layer, this.label);
            this._validateDisabled();
        }
    }
    loggedMessages;
    _observer;
    _mql;
    _changeHandler;
    _boundCreateLayerControlHTML;
    // Layer control element references (synced from DOM element properties)
    _layerControlCheckbox;
    _layerControlLabel;
    _opacityControl;
    _opacitySlider;
    // private _layerItemSettingsHTML?: HTMLElement; 
    // private _propertiesGroupAnatomy?: HTMLElement; 
    _styles;
    get label() {
        if (this._layer)
            return this._layer.getName();
        else
            return this.el.hasAttribute('label') ? this.el.getAttribute('label') : '';
    }
    set label(val) {
        if (val) {
            this.el.setAttribute('label', val);
            if (this._layer)
                this._layer.setName(val);
        }
    }
    get extent() {
        // calculate the bounds of all content, return it.
        if (this._layer) {
            this._layer._calculateBounds();
        }
        return this._layer
            ? Object.assign(Util._convertAndFormatPCRS(this._layer.bounds, window.M[this.getProjection()], this.getProjection()), { zoom: this._layer.zoomBounds })
            : null;
    }
    _registerMediaQuery(mq) {
        if (!this._changeHandler) {
            this._changeHandler = () => {
                this._onRemove();
                if (this._mql.matches) {
                    this._onAdd();
                }
                // set the disabled 'read-only' attribute indirectly, via _validateDisabled
                this._validateDisabled();
            };
        }
        if (mq) {
            // a new media query is being established
            let map = this.getMapEl();
            if (!map)
                return;
            // Remove listener from the old media query (if it exists)
            if (this._mql) {
                this._mql.removeEventListener('change', this._changeHandler);
            }
            this._mql = map.matchMedia(mq);
            this._changeHandler();
            this._mql.addEventListener('change', this._changeHandler);
        }
        else if (this._mql) {
            // the media attribute removed or query set to ''
            this._mql.removeEventListener('change', this._changeHandler);
            delete this._mql;
            // effectively, no / empty media attribute matches, do what changeHandler does
            this._onRemove();
            this._onAdd();
            this._validateDisabled();
        }
    }
    getMapEl() {
        return Util.getClosest(this.el, 'gcds-map');
    }
    // Note: Stencil handles constructor automatically, but we can use componentWillLoad for initialization
    componentWillLoad() {
        // Mirror the original constructor logic
        // by keeping track of console.log, we can avoid overwhelming the console
        this.loggedMessages = new Set();
        // Publish queryable() early so it's available even before connectedCallback
        // This is needed for dynamically added layers (e.g., via inplace links)
        Object.defineProperty(this.el, 'queryable', {
            value: () => this.queryable(),
            writable: true,
            configurable: true
        });
    }
    disconnectedCallback() {
        // if the map-layer node is removed from the dom, the layer should be
        // removed from the map and the layer control
        if (this.el.hasAttribute('data-moving'))
            return;
        this._onRemove();
        if (this._mql) {
            if (this._changeHandler) {
                this._mql.removeEventListener('change', this._changeHandler);
            }
            delete this._mql;
        }
    }
    _onRemove() {
        if (this._observer) {
            this._observer.disconnect();
        }
        let l = this._layer, lc = this._layerControl;
        if (l) {
            l.off();
        }
        // if this layer has never been connected, it will not have a _layer
        if (l && l._map) {
            l._map.removeLayer(l);
        }
        if (lc && !this.el.hasAttribute('hidden')) {
            // lc.removeLayer depends on this._layerControlHTML, can't delete it until after
            lc.removeLayer(l);
        }
        // remove properties of layer involved in whenReady() logic
        delete this._layer;
        delete this._layerControl;
        delete this._layerControlHTML;
        delete this._fetchError;
        // Clean up DOM element properties exposed for MapML compatibility
        delete this.el._layer;
        delete this.el._layerControl;
        delete this.el._layerControlHTML;
        delete this.el._fetchError;
        // Clean up layer control element references
        this._layerControlCheckbox = undefined;
        this._layerControlLabel = undefined;
        this._opacityControl = undefined;
        this._opacitySlider = undefined;
        // this._layerItemSettingsHTML = undefined;
        // this._propertiesGroupAnatomy = undefined;
        this._styles = undefined;
        this.el.shadowRoot.innerHTML = '';
        if (this.src)
            this.el.innerHTML = '';
        this._layerRegistry.clear();
    }
    connectedCallback() {
        if (this.el.hasAttribute('data-moving'))
            return;
        this._boundCreateLayerControlHTML = createLayerControlHTML.bind(this.el);
        // Publish _validateDisabled on element for MapML compatibility
        this.el._validateDisabled = this._validateDisabled.bind(this);
        // Expose disabled property on DOM element
        Object.defineProperty(this.el, 'disabled', {
            get: () => this.disabled,
            set: (val) => {
                this.disabled = val;
            },
            configurable: true,
            enumerable: true
        });
        // Expose _opacity property on DOM element (internal opacity state)
        Object.defineProperty(this.el, '_opacity', {
            get: () => this._opacity,
            set: (val) => {
                if (val !== this._opacity) {
                    this._opacity = val;
                }
            },
            configurable: true,
            enumerable: true
        });
        // Expose opacity getter/setter on DOM element using the component's opacityValue
        Object.defineProperty(this.el, 'opacity', {
            get: () => {
                return this.opacityValue;
            },
            set: (val) => {
                if (+val > 1 || +val < 0)
                    return;
                this._opacity = val;
                this._layer?.changeOpacity(val);
            },
            configurable: true,
            enumerable: true
        });
        Object.defineProperty(this.el, 'whenElemsReady', {
            value: () => this.whenElemsReady(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'zoomTo', {
            value: () => this.zoomTo(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'mapml2geojson', {
            value: (options = {}) => this.mapml2geojson(options),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'pasteFeature', {
            value: (feature) => this.pasteFeature(feature),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getAlternateStyles', {
            value: (styleLinks) => this.getAlternateStyles(styleLinks),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getOuterHTML', {
            value: () => this.getOuterHTML(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getMapEl', {
            value: () => this.getMapEl(),
            writable: true,
            configurable: true
        });
        Object.defineProperty(this.el, 'getProjection', {
            value: () => this.getProjection(),
            writable: true,
            configurable: true
        });
        // Expose label property on DOM element for MapML compatibility
        Object.defineProperty(this.el, 'label', {
            get: () => this.label,
            set: (val) => this.label = val,
            configurable: true,
            enumerable: true
        });
        // Expose hidden property on DOM element for MapML compatibility
        // The @Watch('hidden') decorator handles the side effects
        Object.defineProperty(this.el, 'hidden', {
            get: () => this.el.hasAttribute('hidden'),
            set: (val) => {
                if (val) {
                    this.el.setAttribute('hidden', '');
                }
                else {
                    this.el.removeAttribute('hidden');
                }
            },
            configurable: true,
            enumerable: true
        });
        // Expose extent property on DOM element for MapML compatibility
        Object.defineProperty(this.el, 'extent', {
            get: () => this.extent,
            configurable: true,
            enumerable: true
        });
        this.el._layerRegistry = this._layerRegistry;
        const doConnected = this._onAdd.bind(this);
        const doRemove = this._onRemove.bind(this);
        const registerMediaQuery = this._registerMediaQuery.bind(this);
        let mq = this.media;
        this.getMapEl()
            .whenReady()
            .then(() => {
            doRemove();
            if (mq) {
                registerMediaQuery(mq);
            }
            else {
                doConnected();
            }
        })
            .catch((error) => {
            throw new Error('Map never became ready: ' + error);
        });
    }
    _onAdd() {
        new Promise((resolve, reject) => {
            this.el.addEventListener('changestyle', (e) => {
                e.stopPropagation();
                // if user changes the style in layer control
                if (e.detail) {
                    this.src = e.detail.src;
                }
            }, { once: true });
            let base = this.el.baseURI ? this.el.baseURI : document.baseURI;
            const headers = new Headers();
            headers.append('Accept', 'text/mapml');
            if (this.src) {
                fetch(this.src, { headers: headers })
                    .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    // Save the response URL to use as base for resolving relative URLs
                    const responseUrl = response.url;
                    return response.text().then(text => ({ text, url: responseUrl }));
                })
                    .then(({ text, url: sourceUrl }) => {
                    let content = new DOMParser().parseFromString(text, 'text/xml');
                    if (content.querySelector('parsererror') ||
                        !content.querySelector('mapml-')) {
                        // cut short whenReady with the _fetchError property
                        this._fetchError = true;
                        // Expose _fetchError on DOM element for MapML compatibility
                        this.el._fetchError = this._fetchError;
                        console.log('Error fetching layer content:\n\n' + text + '\n');
                        throw new Error('Parser error');
                    }
                    // Attach the source URL to the content for later use
                    content._sourceUrl = sourceUrl;
                    return content;
                })
                    .then((content) => {
                    this._copyRemoteContentToShadowRoot(content.querySelector('mapml-'), content._sourceUrl);
                    this._copyRemoteContentToShadowRoot(content.querySelector('mapml-'));
                    let elements = this.el.shadowRoot.querySelectorAll('*');
                    let elementsReady = [];
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].whenReady) {
                            elementsReady.push(elements[i].whenReady().catch(error => {
                                console.warn(`Element ${elements[i].tagName} failed to become ready:`, error);
                                return null; // Convert rejection to resolution so layer can still proceed
                            }));
                        }
                    }
                    return Promise.allSettled(elementsReady);
                })
                    .then(() => {
                    // may throw:
                    this._selectAlternateOrChangeProjection();
                })
                    .then(() => {
                    this._layer = mapLayer(new URL(this.src, base).href, this.el, {
                        projection: this.getProjection(),
                        opacity: this.opacityValue
                    });
                    // Expose _layer on DOM element for MapML compatibility
                    this.el._layer = this._layer;
                    this._createLayerControlHTML();
                    this._setLocalizedDefaultLabel();
                    this._attachedToMap();
                    // Process any elements that were created before layer was ready
                    this._runMutationObserver(this.el.shadowRoot.children);
                    this._bindMutationObserver();
                    this._validateDisabled();
                    // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
                    // to MapML extent as metadata
                    // Should always be fired at the end of initialization process
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
                    // https://maps4html.org/web-map-doc/docs/api/layer-api#events
                    this.el.dispatchEvent(new CustomEvent('loadedmetadata', { detail: { target: this.el } }));
                    resolve(undefined);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else {
                let elements = this.el.querySelectorAll('*');
                let elementsReady = [];
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].whenReady)
                        elementsReady.push(elements[i].whenReady());
                }
                Promise.allSettled(elementsReady)
                    .then(() => {
                    // may throw:
                    this._selectAlternateOrChangeProjection();
                })
                    .then(() => {
                    this._layer = mapLayer(null, this.el, {
                        projection: this.getProjection(),
                        opacity: this.opacityValue
                    });
                    // Expose _layer on DOM element for MapML compatibility
                    this.el._layer = this._layer;
                    this._createLayerControlHTML();
                    this._setLocalizedDefaultLabel();
                    this._attachedToMap();
                    // Process any elements that were created before layer was ready
                    this._runMutationObserver(this.el.children);
                    this._bindMutationObserver();
                    this._validateDisabled();
                    // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
                    // to MapML extent as metadata
                    // Should always be fired at the end of initialization process
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
                    // https://maps4html.org/web-map-doc/docs/api/layer-api#events
                    this.el.dispatchEvent(new CustomEvent('loadedmetadata', { detail: { target: this.el } }));
                    resolve(undefined);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
        }).catch((e) => {
            if (e.message === 'changeprojection') {
                if (e.cause.href) {
                    console.log('Changing layer src to: ' + e.cause.href);
                    this.src = e.cause.href;
                }
                else if (e.cause.mapprojection) {
                    console.log('Changing map projection to match layer: ' + e.cause.mapprojection);
                    const mapEl = this.getMapEl();
                    if (mapEl) {
                        mapEl.projection = e.cause.mapprojection;
                    }
                }
            }
            else if (e.message === 'Failed to fetch') {
                // cut short whenReady with the _fetchError property
                this._fetchError = true;
                // Expose _fetchError on DOM element for MapML compatibility
                this.el._fetchError = this._fetchError;
            }
            else {
                console.log(e);
                this.el.dispatchEvent(new CustomEvent('error', { detail: { target: this.el } }));
            }
        });
    }
    _setLocalizedDefaultLabel() {
        if (!this._layer?._titleIsReadOnly && !this._layer?._title) {
            const mapEl = this.getMapEl();
            if (mapEl && mapEl.locale?.dfLayer) {
                this.label = mapEl.locale.dfLayer;
            }
        }
    }
    _selectAlternateOrChangeProjection() {
        const mapml = this.src ? this.el.shadowRoot : this.el;
        const mapEl = this.getMapEl();
        if (!mapml || !mapEl)
            return;
        const selectedAlternate = this.getProjection() !== mapEl.projection &&
            mapml.querySelector('map-link[rel=alternate][projection=' +
                mapEl.projection +
                '][href]');
        if (selectedAlternate) {
            // Use the same base resolution logic as map-link.getBase()
            // Check for map-base element first, then fall back to layer src
            let baseUrl;
            const mapBase = mapml.querySelector('map-base[href]');
            if (mapBase) {
                baseUrl = mapBase.getAttribute('href');
            }
            else if (this.src) {
                // Fallback to resolving layer's src against document base
                baseUrl = new URL(this.src, this.el.baseURI || document.baseURI).href;
            }
            else {
                baseUrl = this.el.baseURI || document.baseURI;
            }
            const url = new URL(selectedAlternate.getAttribute('href'), baseUrl).href;
            throw new Error('changeprojection', {
                cause: { href: url }
            });
        }
        const contentProjection = this.getProjection();
        if (contentProjection !== mapEl.projection &&
            mapEl.layers?.length === 1) {
            throw new Error('changeprojection', {
                cause: { mapprojection: contentProjection }
            });
        }
    }
    _copyRemoteContentToShadowRoot(mapml, sourceUrl) {
        const shadowRoot = this.el.shadowRoot;
        if (!shadowRoot || !mapml)
            return;
        const frag = document.createDocumentFragment();
        const elements = mapml.querySelectorAll('map-head > *, map-body > *');
        // Find or create a map-base element to store the source document's base URL
        let mapBase = Array.from(elements).find(el => el.nodeName === 'MAP-BASE');
        if (!mapBase && sourceUrl) {
            // Create a synthetic map-base element if none exists
            mapBase = document.createElement('map-base');
            mapBase.setAttribute('href', sourceUrl);
            frag.appendChild(mapBase);
        }
        else if (mapBase && sourceUrl) {
            // Resolve existing map-base href against the source URL
            const resolvedHref = new URL(mapBase.getAttribute('href') || '', sourceUrl).href;
            mapBase.setAttribute('href', resolvedHref);
        }
        for (let i = 0; i < elements.length; i++) {
            frag.appendChild(elements[i]);
        }
        shadowRoot.appendChild(frag);
    }
    /**
     * For "local" content, getProjection will use content of "this"
     * For "remote" content, you need to pass the shadowRoot to search through
     */
    getProjection() {
        let mapml = this.src ? this.el.shadowRoot : this.el;
        let projection = this.getMapEl().projection;
        if (mapml.querySelector('map-meta[name=projection][content]')) {
            projection =
                Util._metaContentToObject(mapml
                    .querySelector('map-meta[name=projection]')
                    .getAttribute('content')).content || projection;
        }
        else if (mapml.querySelector('map-extent[units]')) {
            const getProjectionFrom = (extents) => {
                let extentProj = extents[0].attributes.units.value;
                let isMatch = true;
                for (let i = 0; i < extents.length; i++) {
                    if (extentProj !== extents[i].attributes.units.value) {
                        isMatch = false;
                    }
                }
                return isMatch ? extentProj : null;
            };
            projection =
                getProjectionFrom(Array.from(mapml.querySelectorAll('map-extent[units]'))) || projection;
        }
        else {
            const titleElement = this.el.querySelector('map-title');
            const layerLabel = this.label || (titleElement ? titleElement.textContent : 'Unnamed');
            const message = `A projection was not assigned to the '${layerLabel}' Layer. \nPlease specify a projection for that layer using a map-meta element. \nSee more here - https://maps4html.org/web-map-doc/docs/elements/meta/`;
            if (!this.loggedMessages.has(message)) {
                console.log(message);
                this.loggedMessages.add(message);
            }
        }
        return projection;
    }
    _attachedToMap() {
        // Refactored from layer.js _attachedToMap()
        // Set i to the position of this layer element in the set of layers
        const mapEl = this.getMapEl();
        if (!mapEl || !this._layer)
            return;
        let i = 0;
        let position = 1;
        const nodes = mapEl.children;
        for (i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName === 'MAP-LAYER' ||
                nodes[i].nodeName === 'LAYER-') {
                if (nodes[i] === this.el) {
                    position = i + 1;
                }
                else if (nodes[i]._layer) {
                    nodes[i]._layer.setZIndex(i + 1);
                }
            }
        }
        const proj = mapEl.projection ? mapEl.projection : 'OSMTILE';
        leafletSrcExports.setOptions(this._layer, {
            zIndex: position,
            mapprojection: proj,
            opacity: window.getComputedStyle(this.el).opacity
        });
        if (this.checked) {
            this._layer.addTo(mapEl._map);
            // Toggle the this.disabled attribute depending on whether the layer
            // is: same prj as map, within view/zoom of map
        }
        mapEl._map.on('moveend layeradd', this._validateDisabled, this);
        this._layer.on('add remove', this._validateDisabled, this);
        if (mapEl._layerControl) {
            this._layerControl = mapEl._layerControl;
            // Expose _layerControl on DOM element for MapML compatibility
            this.el._layerControl = this._layerControl;
        }
        // If controls option is enabled, insert the layer into the overlays array
        if (mapEl._layerControl && !this.hidden) {
            this._layerControl.addOrUpdateOverlay(this._layer, this.label);
        }
        // The mapml document associated to this layer can in theory contain many
        // link[@rel=legend] elements with different @type or other attributes;
        // currently only support a single link, don't care about type, lang etc.
        // TODO: add support for full LayerLegend object, and > one link.
        if (this._layer._legendUrl) {
            this.el.legendLinks = [
                {
                    type: 'application/octet-stream',
                    href: this._layer._legendUrl,
                    rel: 'legend',
                    lang: null,
                    hreflang: null,
                    sizes: null
                }
            ];
        }
    }
    _runMutationObserver(elementsGroup) {
        const _addStylesheetLink = (mapLink) => {
            this.whenReady().then(() => {
                this._layer.renderStyles(mapLink);
            });
        };
        const _addStyleElement = (mapStyle) => {
            this.whenReady().then(() => {
                this._layer.renderStyles(mapStyle);
            });
        };
        const _addExtentElement = (mapExtent) => {
            this.whenReady().then(() => {
                // Wait for the extent itself to be ready before recalculating bounds
                if (typeof mapExtent.whenReady === 'function') {
                    mapExtent.whenReady().then(() => {
                        // Force complete recalculation by deleting cached bounds
                        delete this._layer.bounds;
                        this._layer._calculateBounds();
                        this._validateDisabled();
                    });
                }
                else {
                    delete this._layer.bounds;
                    this._layer._calculateBounds();
                    this._validateDisabled();
                }
            });
        };
        const root = this.src ? this.el.shadowRoot : this.el;
        const pseudo = root instanceof ShadowRoot ? ':host' : ':scope';
        const _addMetaElement = (_mapMeta) => {
            this.whenReady().then(() => {
                this._layer._calculateBounds();
                this._validateDisabled();
            });
        };
        for (let i = 0; i < elementsGroup.length; ++i) {
            const element = elementsGroup[i];
            switch (element.nodeName) {
                case 'MAP-LINK':
                    if (element.link && !element.link.isConnected)
                        _addStylesheetLink(element);
                    break;
                case 'MAP-STYLE':
                    if (element.styleElement && !element.styleElement.isConnected) {
                        _addStyleElement(element);
                    }
                    break;
                case 'MAP-EXTENT':
                    _addExtentElement(element);
                    break;
                case 'MAP-META':
                    const name = element.hasAttribute('name') &&
                        (element.getAttribute('name').toLowerCase() === 'zoom' ||
                            element.getAttribute('name').toLowerCase() === 'extent');
                    if (name &&
                        element ===
                            root.querySelector(`${pseudo} > [name=${element.getAttribute('name')}]`) &&
                        element.hasAttribute('content')) {
                        _addMetaElement();
                    }
                    break;
            }
        }
    }
    /**
     * Set up a function to watch additions of child elements of map-layer or
     * map-layer.shadowRoot and invoke desired side effects via _runMutationObserver
     */
    _bindMutationObserver() {
        this._observer = new MutationObserver((mutationList) => {
            for (let mutation of mutationList) {
                if (mutation.type === 'childList') {
                    this._runMutationObserver(mutation.addedNodes);
                }
            }
        });
        this._observer.observe(this.src ? this.el.shadowRoot : this.el, {
            childList: true
        });
    }
    _validateDisabled() {
        const countTileLayers = () => {
            let totalCount = 0;
            let disabledCount = 0;
            this._layer.eachLayer((layer) => {
                if (layer instanceof MapTileLayer) {
                    totalCount++;
                    if (!layer.isVisible())
                        disabledCount++;
                }
            });
            return { totalCount, disabledCount };
        };
        const countFeatureLayers = () => {
            let totalCount = 0;
            let disabledCount = 0;
            this._layer.eachLayer((layer) => {
                if (layer instanceof MapFeatureLayer) {
                    totalCount++;
                    if (!layer.isVisible())
                        disabledCount++;
                }
            });
            return { totalCount, disabledCount };
        };
        // setTimeout is necessary to make the validateDisabled happen later than the moveend operations etc.,
        // to ensure that the validated result is correct
        setTimeout(() => {
            let layer = this._layer, map = layer?._map;
            // if there's a media query in play, check it early
            if (this._mql && !this._mql.matches) {
                this.el.setAttribute('disabled', '');
                this.disabled = true;
                return;
            }
            if (map) {
                // prerequisite: no inline and remote mapml elements exists at the same time
                const mapExtents = this.src
                    ? this.el.shadowRoot?.querySelectorAll('map-extent')
                    : this.el.querySelectorAll('map-extent');
                let extentLinksReady = [];
                if (mapExtents) {
                    for (let i = 0; i < mapExtents.length; i++) {
                        if (mapExtents[i].whenLinksReady) {
                            extentLinksReady.push(mapExtents[i].whenLinksReady());
                        }
                    }
                }
                Promise.allSettled(extentLinksReady)
                    .then(() => {
                    let disabledExtentCount = 0, totalExtentCount = 0, layerTypes = [
                        '_staticTileLayer',
                        '_mapmlvectors',
                        '_extentLayer'
                    ];
                    for (let j = 0; j < layerTypes.length; j++) {
                        let type = layerTypes[j];
                        if (this.checked) {
                            if (type === '_extentLayer' && mapExtents && mapExtents.length > 0) {
                                for (let i = 0; i < mapExtents.length; i++) {
                                    totalExtentCount++;
                                    if (mapExtents[i]._validateDisabled && mapExtents[i]._validateDisabled())
                                        disabledExtentCount++;
                                }
                            }
                            else if (type === '_mapmlvectors') {
                                // inline / static features
                                const featureLayerCounts = countFeatureLayers();
                                totalExtentCount += featureLayerCounts.totalCount;
                                disabledExtentCount += featureLayerCounts.disabledCount;
                            }
                            else {
                                // inline tiles
                                const tileLayerCounts = countTileLayers();
                                totalExtentCount += tileLayerCounts.totalCount;
                                disabledExtentCount += tileLayerCounts.disabledCount;
                            }
                        }
                    }
                    // if all extents are not visible / disabled, set layer to disabled
                    if (disabledExtentCount === totalExtentCount &&
                        disabledExtentCount !== 0) {
                        this.el.setAttribute('disabled', '');
                        this.disabled = true;
                    }
                    else {
                        this.el.removeAttribute('disabled');
                        this.disabled = false;
                    }
                    this.toggleLayerControlDisabled();
                })
                    .catch((e) => {
                    console.log(e);
                });
            }
        }, 0);
    }
    // disable/italicize layer control elements based on the map-layer.disabled property
    toggleLayerControlDisabled() {
        let input = this._layerControlCheckbox, label = this._layerControlLabel, opacityControl = this._opacityControl, opacitySlider = this._opacitySlider, styleControl = this._styles;
        if (this.disabled) {
            if (input)
                input.disabled = true;
            if (opacitySlider)
                opacitySlider.disabled = true;
            if (label)
                label.style.fontStyle = 'italic';
            if (opacityControl)
                opacityControl.style.fontStyle = 'italic';
            if (styleControl) {
                styleControl.style.fontStyle = 'italic';
                styleControl.querySelectorAll('input').forEach((i) => {
                    i.disabled = true;
                });
            }
        }
        else {
            if (input)
                input.disabled = false;
            if (opacitySlider)
                opacitySlider.disabled = false;
            if (label)
                label.style.fontStyle = 'normal';
            if (opacityControl)
                opacityControl.style.fontStyle = 'normal';
            if (styleControl) {
                styleControl.style.fontStyle = 'normal';
                styleControl.querySelectorAll('input').forEach((i) => {
                    i.disabled = false;
                });
            }
        }
    }
    queryable() {
        let content = this.src ? this.el.shadowRoot : this.el;
        return !!(content?.querySelector('map-extent[checked] > map-link[rel=query]:not([disabled])') &&
            this.checked &&
            this._layer &&
            !this.el.hasAttribute('hidden'));
    }
    getAlternateStyles(styleLinks) {
        if (styleLinks.length > 1) {
            const stylesControl = document.createElement('details');
            const stylesControlSummary = document.createElement('summary');
            const mapEl = this.getMapEl();
            stylesControlSummary.innerText = mapEl?.locale?.lmStyle || 'Style';
            stylesControl.appendChild(stylesControlSummary);
            for (let j = 0; j < styleLinks.length; j++) {
                stylesControl.appendChild(styleLinks[j].getLayerControlOption());
                leafletSrcExports.DomUtil.addClass(stylesControl, 'mapml-layer-item-style mapml-control-layers');
            }
            return stylesControl;
        }
        return null;
    }
    getOuterHTML() {
        let tempElement = this.el.cloneNode(true);
        if (this.el.hasAttribute('src')) {
            let newSrc = this._layer.getHref();
            tempElement.setAttribute('src', newSrc);
        }
        if (this.el.querySelector('map-link')) {
            let mapLinks = tempElement.querySelectorAll('map-link');
            mapLinks.forEach((mapLink) => {
                if (mapLink.hasAttribute('href')) {
                    mapLink.setAttribute('href', decodeURI(new URL(mapLink.getAttribute('href'), this.el.baseURI ? this.el.baseURI : document.baseURI).href));
                }
                else if (mapLink.hasAttribute('tref')) {
                    mapLink.setAttribute('tref', decodeURI(new URL(mapLink.getAttribute('tref'), this.el.baseURI ? this.el.baseURI : document.baseURI).href));
                }
            });
        }
        let outerLayer = tempElement.outerHTML;
        tempElement.remove();
        return outerLayer;
    }
    zoomTo() {
        this.whenReady().then(() => {
            let map = this.getMapEl()?._map, extent = this.extent, tL = extent.topLeft.pcrs, bR = extent.bottomRight.pcrs, layerBounds = leafletSrcExports.bounds(leafletSrcExports.point(tL.horizontal, tL.vertical), leafletSrcExports.point(bR.horizontal, bR.vertical)), center = map.options.crs.unproject(layerBounds.getCenter(true));
            let maxZoom = extent.zoom.maxZoom, minZoom = extent.zoom.minZoom;
            map.setView(center, Util.getMaxZoom(layerBounds, map, minZoom, maxZoom), {
                animate: false
            });
        });
    }
    pasteFeature(feature) {
        switch (typeof feature) {
            case 'string':
                feature.trim();
                if (feature.slice(0, 12) === '<map-feature' &&
                    feature.slice(-14) === '</map-feature>') {
                    this.el.insertAdjacentHTML('beforeend', feature);
                }
                break;
            case 'object':
                if (feature.nodeName?.toUpperCase() === 'MAP-FEATURE') {
                    this.el.appendChild(feature);
                }
        }
    }
    _createLayerControlHTML() {
        // Use the bound function that was set up in connectedCallback  
        // The createLayerControlHTML function was bound to this.el in connectedCallback
        if (this._boundCreateLayerControlHTML) {
            // Call the async function but don't await it (matches original layer.js behavior)
            this._boundCreateLayerControlHTML().then((result) => {
                this._layerControlHTML = result;
                // Expose _layerControlHTML on DOM element for MapML compatibility
                this.el._layerControlHTML = this._layerControlHTML;
                // Sync all layer control properties created by createLayerControlForLayer
                // These properties are set on the DOM element by the bound function and need to be
                // available on both the element and the component for future refactoring
                this._layerControlCheckbox = this.el._layerControlCheckbox;
                this._layerControlLabel = this.el._layerControlLabel;
                this._opacityControl = this.el._opacityControl;
                this._opacitySlider = this.el._opacitySlider;
                this._layerItemSettingsHTML = this.el._layerItemSettingsHTML;
                this._propertiesGroupAnatomy = this.el._propertiesGroupAnatomy;
                this._styles = this.el._styles;
                // Ensure opacity slider is synced with current opacity value
                if (this._opacitySlider && this._opacity !== undefined) {
                    this._opacitySlider.value = this._opacity.toString();
                }
            });
        }
    }
    async whenReady() {
        return new Promise((resolve, reject) => {
            let interval, failureTimer;
            if (this.el._layer &&
                this._layerControlHTML &&
                (!this.src || this.el.shadowRoot?.childNodes.length)) {
                resolve();
            }
            else {
                const layerElement = this.el;
                interval = setInterval(testForLayer, 200, layerElement);
                failureTimer = setTimeout(layerNotDefined, 5000);
            }
            function testForLayer(layerElement) {
                if (layerElement._layer &&
                    layerElement._layerControlHTML &&
                    (!layerElement.src || layerElement.shadowRoot?.childNodes.length)) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    resolve();
                }
                else if (layerElement._fetchError) {
                    clearInterval(interval);
                    clearTimeout(failureTimer);
                    reject('Error fetching layer content');
                }
            }
            function layerNotDefined() {
                clearInterval(interval);
                clearTimeout(failureTimer);
                reject('Timeout reached waiting for layer to be ready');
            }
        });
    }
    /**
     * Wait for all map-extent and map-feature elements to be ready.
     * Returns a promise that resolves when all are settled.
     */
    async whenElemsReady() {
        let elemsReady = [];
        // Use shadowRoot if src is set, otherwise use this.el
        let target = this.src ? this.el.shadowRoot : this.el;
        if (!target)
            return [];
        const extents = Array.from(target.querySelectorAll('map-extent'));
        const features = Array.from(target.querySelectorAll('map-feature'));
        for (let elem of [...extents, ...features]) {
            if (typeof elem.whenReady === 'function') {
                elemsReady.push(elem.whenReady());
            }
        }
        return Promise.allSettled(elemsReady);
    }
    /**
     * Convert this MapML layer to GeoJSON FeatureCollection
     * @param options - Conversion options:
     *   - propertyFunction: Function to map <map-properties> to GeoJSON properties
     *   - transform: Whether to transform coordinates to GCRS (EPSG:4326), defaults to true
     * @returns GeoJSON FeatureCollection object
     */
    mapml2geojson(options = {}) {
        return Util.mapml2geojson(this.el, options);
    }
    render() {
        return null;
    }
    static get watchers() { return {
        "src": ["srcChanged"],
        "checked": ["checkedChanged"],
        "_opacity": ["opacityChanged"],
        "media": ["mediaChanged"],
        "hidden": ["hiddenChanged"]
    }; }
};

export { GcdsMap as gcds_map, GcdsMapLayer as map_layer };
//# sourceMappingURL=gcds-map.map-layer.entry.js.map
