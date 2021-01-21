function lexer(code){
    const regex = {
        //number: /^\d+\b/,
        number: /^[+-]?\d+(\.\d+)?\b/, 
        string: /^"([^"]*)"/,
        ident:  /^[а-яА-Я0-9_]+/,
        //ident:   /^[а-яА-Я_][а-яА-Я0-9_]*/,
        
        //skip:   /^\s*(![^!]*!)?\s*/,
        skip:   /^(\s|![^!]*!)*/,
        parens: /^[()]/,

        errorShow:  /^\S*(\b)?/
    };

    const tokens = [];

    while(true){
        code = code.replace(regex.skip, '');
        if(code.length == 0)break;
        let match;
        if(match = regex.number.exec(code)){
            tokens.push({type: 'number', value: Number(match[0])});
        }
        else if(match = regex.string.exec(code)){
            tokens.push({type: 'string', value: match[1]});
        }
        else if(match = regex.ident.exec(code)){
            tokens.push({type: 'id', value: match[0]});
        }
        else if(match = regex.parens.exec(code)){
            tokens.push({type: 'paren', value: match[0]})
        }
        else{
            return {code: `Ошибка синтаксиса: ${regex.errorShow.exec(code)[0]}`, tokenList: []};
        }

        code = code.slice(match[0].length);
    }

    return {code: 'Успех', tokenList: tokens};
}

function parser(tokens){
    let position = 0;
    
    function parseFunction(){
        const ast = Object.create(null);
        position++;
        const name = tokens[position];
        if(!name || name.type != 'id'){
            ast.error = 'Функция должна иметь имя';
            return ast
        }
        ast.type = 'func';
        ast.name = name.value;
        ast.args = [];

        while(true){
            if(++position >= tokens.length){
                ast.error = 'Функция должна быть закрыта ")"';
                return ast;
            }

            const cur = tokens[position];
            if(cur.type == 'paren'){
                if(cur.value == '('){
                    ast.args.push(parseFunction());
                }
                else if(cur.value == ')'){
                    break;
                }
            }
            else{
                ast.args.push(cur);
                //ast.args.push(cur.value);
            }
        }

        return ast;
    }

    const beg = tokens[position];

    let ast;

    if(beg.value == '('){
        ast = parseFunction();
        if(position < tokens.length - 1){
            ast.warning = `Помимо главного тела программы, функции <<${ast.name}>>, присутствует лишний код`;
        }
    }
    else {
        ast = Object.create(null);
        ast.error = 'Программа должна быть представлена функцией';
    }

    return ast;
}

function generate(ast){

    const specForms = Object.create(null);

    function getArg(arg){
        function writeFunc(func){
            let code = `${func.name}(`;
            for(let a of func.args){
                code += `${getArg(a)},`;
            }
            code += ')';
            return code;
        }

        if(arg.type == 'number' || arg.type == 'id')
            return String(arg.value);
        else if(arg.type == 'string')
            return `"${arg.value}"`;
        else if(arg.type == 'func'){
            if(arg.name in specForms){
                return specForms[arg.name](...arg.args.map(elem => getArg(elem)));
            }
            else {
                return writeFunc(arg);
            }

        }
    }

    //specForms reg...
    specForms['Блок'] = (...args) => {
        let code = '';
        for(let arg of args){
            code += arg + ';';
        }
        return code;
    }

    specForms['ОбособленныйБлок'] = (...args) => {
        let code = 'void function __BLOCK__(){';
        for(let arg of args){
            code += arg + ';';
        }
        code += '}();';
        return code;
    }

    specForms['Список'] = (...args) => {
        let code = '[';
        for(let arg of args){
            code += arg + ',';
        }
        code += ']';
        return code;
    }
    specForms['Функция'] = (...args) => {
        let code = 'function(';
        for(let i=0; i<args.length-1; i++){
            code += args[i] + ',';
        }
        code += `){${args[args.length - 1]}}`;
        return code;
    }

    specForms['Вернуть']     = expr => `return ${expr}`;
    specForms['Продолжить']  = ()   => `continue`;
    specForms['Выйти']       = ()   => `break`;

    specForms['Сложить']               = (a, b) => `(${a}) + (${b})`;
    specForms['Отнять']                = (a, b) => `(${a}) - (${b})`;
    specForms['Умножить']              = (a, b) => `(${a}) * (${b})`;
    specForms['Разделить']             = (a, b) => `(${a}) / (${b})`;
    specForms['Остаток']               = (a, b) => `(${a}) % (${b})`;
    specForms['Определить']            = (a, b) => `${a} = ${b}`;
    specForms['Степень']               = (a, b) => `(${a}) ** (${b})`

    specForms['Равно']                 = (a, b) => `(${a}) === (${b})`;
    specForms['НеРавно']               = (a, b) => `(${a}) !== (${b})`;
    specForms['Больше']                = (a, b) => `(${a}) > (${b})`;
    specForms['БольшеЛибоРавно']       = (a, b) => `(${a}) >= (${b})`;
    specForms['Меньше']                = (a, b) => `(${a}) < (${b})`;
    specForms['МеньшеЛибоРавно']       = (a, b) => `(${a}) <= (${b})`;

    specForms['И']                     = (a, b) => `(${a}) && (${b})`;
    specForms['Или']                   = (a, b) => `(${a}) || (${b})`;
    specForms['Не']                    = a => `!(${a})`;

    specForms['Пока']                  = (cond, block) => `while(${cond}){${block}}`;
    specForms['Если']                  = (cond, block1, block2) => `if(${cond}){${block1}}else{${block2}}`;
    
    //list funcs
    specForms['СписокИзвлечь']         = (list, pos) => `${list}[${pos}]`;
    specForms['СписокДобавитьКонец']   = (list, elem) => `${list}.push(${elem})`;
    specForms['СписокДобавитьНачало']  = (list, elem) => `${list}.unshift(${elem})`;
    specForms['СписокУдалитьКонец']    = list => `${list}.pop()`;
    specForms['СписокУдалитьНачало']   = list => `${list}.shift()`;
    specForms['СписокИндекс']          = (list, elem) => `${list}.indexOf(${elem})`;
    specForms['СписокУдалить']         = (list, index) => `${list}.splice(${index}, 1)`;
    specForms['СписокКопировать']      = list => `${list}.slice()`;
    specForms['СписокДлина']           = list => `${list}.length`;


    const preCode = `

const Вывод     = console.log;
const Правда    = true;
const Ложь      = false;
const Ввод      = prompt;
const Число     = Number;
const Строка    = String;
`;

    return preCode + getArg(ast);
    
}

function run(code){
    const tokens = lexer(code);
    if(tokens.code !== 'Успех'){
        console.log(tokens.code);
        return;
    }
    if(tokens.tokenList.length == 0){
        console.log('Пустая программа');
        return;
    }

    const ast = parser(tokens.tokenList);
    if(ast.warning){
        console.log(ast.warning);
    }

    const astErrors = []
    function catchAstErrors(ast){
        if(ast.error){
            astErrors.push(ast.error);
        }
        for(let each of (ast.args||[])){
            catchAstErrors(each);
        }
    }
    catchAstErrors(ast);

    if(astErrors.length > 0){
        astErrors.forEach(elem => console.log(elem));
        return;
    }

    const result = generate(ast);
    //console.log('...Начало вывода...');
    try{
        const __MAIN__ = Function('', result);
        __MAIN__();
        return result;
    }
    catch(e){
        console.log('Ошибка выполнения');
    }
    /*finally{
        console.log('...Конец вывода...');
    }*/
}

//module.exports = run;