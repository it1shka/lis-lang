function transpilateCode(input){
    let parser;
    if(typeof require !== 'undefined'){
        const nearley = require('nearley');
        const grammar = require('./grammar');
        parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    }
    else{
        const grammar = window.grammar;
        parser = new window.nearley.Parser(window.nearley.Grammar.fromCompiled(grammar));
    }
    try{
        parser.feed(input);
        const res = String(parser.results);
        return res;
    }
    catch(e){
        const t = e.token;
        if(!t) throw e;
        throw `Unexpected token ${typeof t.type !== 'undefined'  ? `${t.value} of type ${t.type}` : `${t.value}`}\n<at line ${t.line}, at column ${t.col}>`;
    }
}
if (typeof module !== 'undefined')
    module.exports = transpilateCode;