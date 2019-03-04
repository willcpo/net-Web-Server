// webby.js
//create TCP Server from net module,
        //allowing connections from clients

//Global Objects

const HTTP_STATUS_CODES = {
    200: "OK",
    404: "Not Found",
    308: "Permanent Redirect",
    500:"Internal Server Error"
};

const MIME_TYPES = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png:"image/png",
    html: "text/html",
    css: "text/css",
    txt:"text/plain"
};

function getExtension(fileName){
    const split = fileName.split('.');
    if (split.length ===1) {return "";}
    const ext = split.pop();
    return ext.toLowerCase();
}

function getMIMEType(fileName){
    const ext = getExtension(fileName);
    const mime = MIME_TYPES[ext];
    if (mime === undefined){
        return "";
    }
    return mime;
}

class Request{

    constructor(httpRequest){
        const str = httpRequest.split(" ");
        this.path = str[1];
        this.method = str[0];
    }

}

class Response{

    constructor(socket, statusCode=200, version="HTTP/1.1"){
        this.sock=socket;
        this.statusCode=statusCode;
        this.version=version;
        this.headers={};
    }

    set(name, value){
        this.headers[name]=value;
    }

    end(){
        this.sock.end();
    }

    statusLineToString(){
        return this.version+" "+this.statusCode+" "+HTTP_STATUS_CODES[this.statusCode]+"\r\n";
    }

    headersToString(){
        let ret = "";
        const keys = Object.keys(this.headers);
        for(let i=0;i<keys.length;i++){
            ret +=keys[i] + ": "+this.headers[keys[i]]+"\r\n";
        }
        return ret;
    }

    send(body){

        this.body=body;

        let ct="";

        if(this.headers["Content-Type"]===undefined){
            ct="Content-Type: text/html\r\n";
        }

        const data=this.statusLineToString()+this.headersToString()+ct+"\r\n";
        this.sock.write(data);
        this.sock.write(body);

        this.end();
    }

    status(statusCode){
        this.statusCode=statusCode;
        return this;
    }
}

class App{

    constructor(){
        const net = require('net');
        this.server = net.createServer(sock => this.handleConnection(sock));
        this.routes={};
        this.middleware=null;
    }
    //---------------------------
    normalizePath(path){
        path = path.toLowerCase();
        path = path.split("#");
        path = path[0].split("?");
        path = path[0];
        if (path[path.length-1]==="/"){
            path = path.slice(0,path.length-1);
        }
        return path;
    }
    //---------------------------
    createRouteKey(method, path){
        method=method.toUpperCase();
        path = this.normalizePath(path);
        return method+" "+path;
    }
    //---------------------------
    get(path, cb){
        const key = this.createRouteKey("GET",this.normalizePath(path));
        this.routes[key]=cb;
    }
    //---------------------------
    use(cb){
        this.middleware=cb;
    }
    //---------------------------
    listen(port, host){
        this.server.listen(port, host);
    }
    //---------------------------
    handleConnection(sock){
        const cb =this.handleRequest.bind(this,sock);
        sock.on('data',cb);
    }
    //---------------------------
    handleRequest(sock, binaryData){
        const req = new Request(binaryData.toString());
        const res= new Response(sock);
        if (this.middleware!==null){
            this.middleware(req,res,this.processRoutes.bind(this));
        }else{
            this.processRoutes(req,res);
        }

    }
    //---------------------------
    processRoutes(req, res){
        const key = this.createRouteKey(req.method,req.path);
        if(this.routes.hasOwnProperty(key)){
            const f=this.routes[key];
            f(req,res);
        }else{
            //return this is response???
            console.log("hello");
            res.sock.write('HTTP/1.1 404 Not Found\r\n');
            res.end();
            console.log("yass");
        }
    }

}


function serveStatic(basePath){


    return function(req,res,next){
        //construct a path on the file system to attempt to read the file
            //using the path module and path.join on basePath & req's path
        const path = require('path');
        const fs = require('fs');
        const p = path.join(basePath,req.path);
        fs.readFile(p,(err,data)=>{
            if(err){
                next(req,res);
            }else{
                res.set('Content-Type',getMIMEType(req.path));
                res.send(data);
            }
        });
    };
}

module.exports={
    HTTP_STATUS_CODES,
    MIME_TYPES,
    getExtension,
    getMIMEType,
    Request,
    Response,
    App,
    static: serveStatic
};
