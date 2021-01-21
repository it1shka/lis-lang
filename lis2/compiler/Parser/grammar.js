// Generated automatically by nearley, version 2.19.8
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

let moo;
if(typeof require !== 'undefined')
    moo = require('moo');
else
    moo = window.moo;

const {compile} = moo;

class Wrapped {
    constructor(rules){
        this.lexer = compile(rules);
    }

    next(){
        let token;
        while((token = this.lexer.next()) && (
            token.type === 'ws' || token.type === 'comment'
        )){}
        return token;
    }

    has(tokenType){
        return this.lexer.has(tokenType);
    }

    formatError(token, message){
        return this.lexer.formatError(token, message);
    }

    reset(chunk, info){
        return this.lexer.reset(chunk, info);
    }

    save(){
        return this.lexer.save();
    }

}

const custom = new Wrapped({
    'break' : 'break',
    'continue':'continue',
    'return':'return',
    //
    'pass': 'pass',
    'beg': 'beg',
    'end': 'end',
    'while': 'while',
    'do': 'do',
    'if': 'if',
    'else': 'else',
    'true': 'true',
    'false': 'false',
    //f_decl sect
    'fun': 'fun',
    //f_call sect
    "!": "!",
    ",": ",",
    //
    '(': '(',
    ')': ')',
    ';': ';',
    //operators
    '+':'+',
    '-':'-',
    '*':'*',
    '/':'/',
    '%':'%',
    ':=':':=',
    '<>':'<>',
    '>=':'>=',
    '<=':'<=',
    '>':'>',
    '<':'<',
    'and':'and',
    'or':'or',
    '=>':'=>',
    '=':'=',

    ws: { match: /[ \t\r\n\f\v]+/, lineBreaks: true },
    comment: { match: /#[^\n]*/, lineBreaks: true },
    float: /\d+\.\d+/,
    int: /\d+/,
    ident: /[_a-zA-Z][_a-zA-Z0-9]*/,
    string_: {match: /(?:"[^"]*"|'[^']*')/, value: s => s.slice(1, -1)},
});

const transl = {
    '+':'+',
    '-':'-',
    '*':'*',
    '/':'/',
    '%':'%',
    ':=':'=',
    '<>':'!==',
    '>':'>',
    '<':'<',
    '>=':'>=',
    '<=':'<=',
    'and':'&&',
    'or':'||',
    '=':'==='
}

function bin([left, type, right]){
    return `${left}${transl[type]}${right}`;
}

function func_call([ident, args]){
    return `${ident}(${args})`;
}

function function_([, ident, args, stmt]){
    return `function ${ident}(${args}){${stmt}}`;
}

var grammar = {
    Lexer: custom,
    ParserRules: [
    {"name": "prog$ebnf$1", "symbols": []},
    {"name": "prog$ebnf$1", "symbols": ["prog$ebnf$1", "stmt"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "prog", "symbols": ["prog$ebnf$1"], "postprocess": ([list]) => (list.join(''))},
    {"name": "stmt", "symbols": [{"literal":"beg"}, "prog", {"literal":"end"}], "postprocess": ([, prog, ]) => (`${prog}`)},
    {"name": "stmt", "symbols": ["func_decl_stmt"], "postprocess": id},
    {"name": "stmt", "symbols": ["func_call", {"literal":";"}], "postprocess": ([call, ]) => (`${call};`)},
    {"name": "stmt", "symbols": ["ident", {"literal":":="}, "expr", {"literal":";"}], "postprocess": ([id, , expr, ]) => `${id}=${expr};`},
    {"name": "stmt", "symbols": [{"literal":"while"}, "expr", {"literal":"do"}, "stmt"], "postprocess": ([, expr, , stmt]) => (`while(${expr}){${stmt}}`)},
    {"name": "stmt", "symbols": [{"literal":"if"}, "expr", {"literal":"do"}, "stmt", {"literal":"else"}, "stmt"], "postprocess": ([, expr, , stmt1, , stmt2]) => (`if(${expr}){${stmt1}}else{${stmt2}}`)},
    {"name": "stmt", "symbols": [{"literal":"if"}, "expr", {"literal":"do"}, "stmt"], "postprocess": ([, expr, , stmt]) => (`if(${expr}){${stmt}}`)},
    {"name": "stmt", "symbols": [{"literal":"continue"}, {"literal":";"}], "postprocess": () => ('continue;')},
    {"name": "stmt", "symbols": [{"literal":"break"}, {"literal":";"}], "postprocess": () => ('break;')},
    {"name": "stmt", "symbols": [{"literal":"return"}, "expr", {"literal":";"}], "postprocess": ([, expr, ]) => (`return ${expr};`)},
    {"name": "stmt", "symbols": [{"literal":"=>"}, "expr", {"literal":";"}], "postprocess": ([, expr, ]) => (`return ${expr};`)},
    {"name": "stmt", "symbols": [{"literal":"pass"}], "postprocess": () => (';')},
    {"name": "func_decl_stmt", "symbols": [{"literal":"fun"}, "ident", "call_arg_list", "stmt"], "postprocess": function_},
    {"name": "expr", "symbols": ["expr1"], "postprocess": id},
    {"name": "expr1", "symbols": ["expr1", {"literal":"or"}, "expr2"], "postprocess": bin},
    {"name": "expr1", "symbols": ["expr2"], "postprocess": id},
    {"name": "expr2", "symbols": ["expr2", {"literal":"and"}, "expr3"], "postprocess": bin},
    {"name": "expr2", "symbols": ["expr3"], "postprocess": id},
    {"name": "expr3", "symbols": ["expr3", {"literal":"="}, "expr4"], "postprocess": bin},
    {"name": "expr3", "symbols": ["expr3", {"literal":"<>"}, "expr4"], "postprocess": bin},
    {"name": "expr3", "symbols": ["expr4"], "postprocess": id},
    {"name": "expr4", "symbols": ["expr4", {"literal":">="}, "expr5"], "postprocess": bin},
    {"name": "expr4", "symbols": ["expr4", {"literal":">"}, "expr5"], "postprocess": bin},
    {"name": "expr4", "symbols": ["expr4", {"literal":"<="}, "expr5"], "postprocess": bin},
    {"name": "expr4", "symbols": ["expr4", {"literal":"<"}, "expr5"], "postprocess": bin},
    {"name": "expr4", "symbols": ["expr5"], "postprocess": id},
    {"name": "expr5", "symbols": ["expr5", {"literal":"+"}, "expr6"], "postprocess": bin},
    {"name": "expr5", "symbols": ["expr5", {"literal":"-"}, "expr6"], "postprocess": bin},
    {"name": "expr5", "symbols": ["expr6"], "postprocess": id},
    {"name": "expr6", "symbols": ["expr6", {"literal":"*"}, "expr7"], "postprocess": bin},
    {"name": "expr6", "symbols": ["expr6", {"literal":"/"}, "expr7"], "postprocess": bin},
    {"name": "expr6", "symbols": ["expr6", {"literal":"%"}, "expr7"], "postprocess": bin},
    {"name": "expr6", "symbols": ["expr7"], "postprocess": id},
    {"name": "expr7", "symbols": ["primary"], "postprocess": id},
    {"name": "primary", "symbols": ["func_call"], "postprocess": id},
    {"name": "primary", "symbols": ["ident"], "postprocess": id},
    {"name": "primary", "symbols": ["num"], "postprocess": id},
    {"name": "primary", "symbols": ["string_"], "postprocess": ([str]) => (`"${str}"`)},
    {"name": "primary", "symbols": [{"literal":"true"}], "postprocess": () => ('true')},
    {"name": "primary", "symbols": [{"literal":"false"}], "postprocess": () => ('false')},
    {"name": "primary", "symbols": [{"literal":"("}, "expr1", {"literal":")"}], "postprocess": ([, expr, ]) => (`(${expr})`)},
    {"name": "func_call", "symbols": ["ident", "call_arg_list"], "postprocess": func_call},
    {"name": "call_arg_list", "symbols": [{"literal":"!"}], "postprocess": () => ('')},
    {"name": "call_arg_list", "symbols": ["call_args"], "postprocess": id},
    {"name": "call_args", "symbols": ["expr", {"literal":","}, "call_args"], "postprocess": ([expr, , exprs]) => (`${expr},${exprs}`)},
    {"name": "call_args", "symbols": ["expr"], "postprocess": ([expr]) => (`${expr}`)},
    {"name": "num", "symbols": ["floating"], "postprocess": ([floating]) => (floating)},
    {"name": "num", "symbols": ["integer"], "postprocess": ([integer]) => (integer)},
    {"name": "ident", "symbols": [(custom.has("ident") ? {type: "ident"} : ident)], "postprocess": ([ident]) => (ident.value)},
    {"name": "integer", "symbols": [(custom.has("int") ? {type: "int"} : int)], "postprocess": ([num]) => (num.value)},
    {"name": "floating", "symbols": [(custom.has("float") ? {type: "float"} : float)], "postprocess": ([num]) => (num.value)},
    {"name": "string_", "symbols": [(custom.has("string_") ? {type: "string_"} : string_)], "postprocess": ([str]) => (str.value)}
]
  , ParserStart: "prog"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
