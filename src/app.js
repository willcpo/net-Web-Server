// app.js
const webby = require('./webby.js');
const app = new webby.App();
const path = require('path');


function returnHTMLShell(title,header,content){

    return `<!DOCTYPE html>
     <html lang="en">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <meta http-equiv="X-UA-Compatible" content="ie=edge">
         <title>${title}</title>
         <link rel="stylesheet" href="../css/styles.css">
     </head>
     <body>
         <div class="title">
         <span class="tack"></span>
         <h1>${header}</h1>
         <span class="tack"></span>
         </div>
         ${content}
     </body>`;

 }


app.get("/",function(req,res){

    const title = "Main";
    const header= "Come see the most beautiful Llamas in the ENITRE WORLD";
    const body = `<div class="link">
                <span class="tack"></span>
                <a href="/gallery"class="linktext">YES PLEASE </a>
                <a href="/gallery" class="line">---</a>
                <a href="/gallery" class="arrow">></a>
                <span class="tack"></span>
            </div>`;

    res.send(returnHTMLShell(title,header,body));
});

app.get("/gallery",function(req,res){

    const picNums = [];
    const picHTML = [];
    const randomAmt = Math.floor(Math.random()*4)+1;
    for (let i=0;i<randomAmt;i++){
        let randomPic = Math.floor(Math.random()*4)+1;
        while(picNums.includes(randomPic)){
            randomPic = Math.floor(Math.random()*4)+1;
        }
        picNums.push(randomPic);
        const randomDegree = Math.round(Math.random()*10)-5;
        picHTML.push('<img src="/img/animal'+randomPic+'.jpg" style="transform: rotate('+randomDegree+'deg)">');
    }
    let bodypics = "";
    for (let i=0;i<randomAmt;i++){
        bodypics += picHTML.pop();
    }

    let plural = "";
    if(picNums.length>1) {plural ="s";}

    const title = "Gallery";
    const header= `You are currently looking at ${picNums.length} Llama${plural}`;
    const body = `<div class="images">
                ${bodypics}
            <div>`;
    res.send(returnHTMLShell(title,header,body));

});

app.get("/pics",function(req,res){

    res.status(308);
    res.set("Location","/gallery");
    res.sock.write(res.statusLineToString()+res.headersToString());
    res.end();

});

app.use(webby.static(path.join(__dirname, '..', 'public')));
app.listen(3000, '127.0.0.1');
