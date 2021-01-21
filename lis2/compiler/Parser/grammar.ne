#grammar of my language
@{%
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

%}
@lexer custom

prog -> 
    stmt:* {% ([list]) => (list.join('')) %}

stmt ->
    "beg" prog "end" {% ([, prog, ]) => (`${prog}`) %}
    | func_decl_stmt {% id %}
    | func_call ";" {% ([call, ]) => (`${call};`) %}
    | ident ":=" expr ";" {% ([id, , expr, ]) => `${id}=${expr};` %}
    | "while" expr "do" stmt {% ([, expr, , stmt]) => (`while(${expr}){${stmt}}`) %}
    | "if" expr "do" stmt "else" stmt {% ([, expr, , stmt1, , stmt2]) => (`if(${expr}){${stmt1}}else{${stmt2}}`)%}
    | "if" expr "do" stmt {% ([, expr, , stmt]) => (`if(${expr}){${stmt}}`) %}
    | "continue" ";" {% () => ('continue;') %}
    | "break" ";" {% () => ('break;') %}
    | "return" expr ";" {% ([, expr, ]) => (`return ${expr};`) %}
    | "=>" expr ";" {% ([, expr, ]) => (`return ${expr};`)  %}
    | "pass" {% () => (';') %}

func_decl_stmt -> "fun" ident call_arg_list stmt {% function_ %}

expr -> 
    expr1 {% id %}

expr1 ->
    expr1 "or" expr2 {% bin %}
    | expr2 {% id %}

expr2 ->
    expr2 "and" expr3 {% bin %}
    | expr3 {% id %}

expr3 ->
    expr3 "=" expr4 {% bin %}
    | expr3 "<>" expr4 {% bin %}
    | expr4 {% id %}

expr4 ->
    expr4 ">=" expr5 {% bin %}
    | expr4 ">" expr5 {% bin %}
    | expr4 "<=" expr5 {% bin %}
    | expr4 "<" expr5 {% bin %}
    | expr5 {% id %}

expr5 ->
    expr5 "+" expr6 {% bin %}
    | expr5 "-" expr6 {% bin %}
    | expr6 {% id %}

expr6 ->
    expr6 "*" expr7 {% bin %}
    | expr6 "/" expr7 {% bin %}
    | expr6 "%" expr7 {% bin %}
    | expr7 {% id %}

expr7 -> primary {% id %}

primary -> func_call {% id %}
    | ident {% id %}
    | num {% id %}
    | string_ {% ([str]) => (`"${str}"`) %}
    | "true" {% () => ('true') %}
    | "false" {% () => ('false') %}
    | "(" expr1 ")" {% ([, expr, ]) => (`(${expr})`) %}

func_call -> ident call_arg_list {% func_call %}

call_arg_list -> "!" {% () => ('') %}
    | call_args {% id %}

call_args -> expr "," call_args {% ([expr, , exprs]) => (`${expr},${exprs}`) %}
    | expr {% ([expr]) => (`${expr}`) %}

num -> floating {% ([floating]) => (floating) %}
    | integer {% ([integer]) => (integer) %}

#atoms
ident -> %ident {% ([ident]) => (ident.value) %}
integer -> %int {%([num]) => (num.value)%}
floating -> %float {% ([num]) => (num.value) %}
string_ -> %string_ {% ([str]) => (str.value) %}