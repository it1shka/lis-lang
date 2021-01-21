function Execute(code){
    try{
    return Function(
        'print, getnum, getstr, set_color, set_pixel, rect', 
    code)(
        console.log, 
        str => Number(prompt(str)),
        str => String(prompt(str)),
        set_color, 
        set_pixel,
        rect
    );
    }
    catch(e){
        throw e;
        //throw 'JS Error: ' + e.message;
    }
}

if(typeof module !== 'undefined')
    module.exports = Execute;