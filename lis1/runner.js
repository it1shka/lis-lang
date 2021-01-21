//CODE AREA
const codeArea = document.getElementById('codeArea');

codeArea.onkeydown = function(e){
    if(e.keyCode==9 || e.which==9){
        e.preventDefault();
        let s = this.selectionStart;
        this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
        this.selectionEnd = s+1; 
    }
}
let runCounter = 0;
function runCode(){
    runCounter++;
    console.log(`ЗАПУСК #${runCounter}`);
    const source = codeArea.value;
    const result = run(source);
    console.log('');

    if(result){
        console.warn(result);
    }
}

//CONSOLE
const myConsole = document.getElementById('console');

function readlineToConsole(text){
    myConsole.value += text += '\r\n';
    myConsole.scrollTop = myConsole.scrollHeight;
}

console.log = readlineToConsole;

//LOAD FILE
const invisibleInput = document.getElementById('file-input');

invisibleInput.onchange = e => {
    let file = invisibleInput.files[0];
    if(file && file.type == ''){
        console.log(`ФАЙЛ ${file.name} ЗАГРУЖЕН`);
        let fr = new FileReader();
        fr.onload = () => {
            codeArea.value = fr.result;
        }

        fr.readAsText(file);
    }
    else{
        console.log('ФАЙЛ НЕ ВЫБРАН');
    }
    console.log('');
};

function loadFile(){
    invisibleInput.click();
}

//SAVE FILE
const invisibleA = document.getElementById('save-file');
let counter = 1;
function saveFile(){
    const code = codeArea.value;
    let file = new Blob([code], {type: ''});
    const url = URL.createObjectURL(file);
    const fileName = `Task${counter}`;
    invisibleA.href = url;
    invisibleA.download = fileName + '.лис';
    invisibleA.click();
    console.log(`ФАЙЛ ${fileName} СКАЧАН`);
    console.log('');
    counter++;
}