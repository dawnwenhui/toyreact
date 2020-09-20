const RENDER_TO_DOM = Symbol("render to dom");

//setstate react 旧的新的都合并
class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }
    setAttribute(name,value){
        // this.root.setAttribute(name,value)
        if(name.match(/^on([\s\S]+)$/)){
            // RegExp.$1
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()),value); //事件大小写敏感
        }else{
            if(name === "className"){
                this.root.setAttribute("class",value);
            }else{
                this.root.setAttribute(name,value);
            }
        }
    }
    appendChild(component){
        // this.root.appendChild(component.root)
        let range = document.createRange();
        range.setStart(this.root,this.root.childNodes.length);
        range.setEnd(this.root,this.root.childNodes.length);
        component[RENDER_TO_DOM](range);

    }
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root);
    }
    
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root);
    }
}

export class Component {
    constructor(){
        this.props = Object.create(null);//绝对空
        this.children = [];
        this._root = null;
        this._range = null;
    }
    setAttribute(name, value){
        // s S 所有空白 所有非空白  所有字符
        // if(name.match(/^on([\s\S]+)$/)){
        //     this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()),value); //事件大小写敏感
        // }else{
        //     this.root.setAttribute(name,value);
        // }
        this.props[name] = value;
    }
    appendChild(component){
        this.children.push(component)
    }

    // [_renderToDOM(range)]{//range api 操作 重新渲染 取元素改为渲染进range
    //     this.render()._renderToDOM(range); //_  私有变量命名
    // }
    [RENDER_TO_DOM](range){//range api 操作 重新渲染 取元素改为渲染进range
        this._range = range; //重新绘制做准备
        this.render()[RENDER_TO_DOM](range); //[] 代表是个变量
    }
    // get root(){
    //     //取root渲染相关
    //     if(!this._root){
    //         this._root = this.render().root;
    //     }
    //     return this._root;
    // }
    rerender(){
        let oldRange = this._range;          
        //cha ru range
        let range = document.createRange();
        range.setStart(oldRange.startContainer,oldRange.startOffset);
        range.setEnd(oldRange.startContainer,oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer,range.endOffset);
        oldRange.deleteContents();
        // this._range .deleteContents(); //delete range content
        // this[RENDER_TO_DOM](this._range);
    }
    setState(newState){
        //state 有可能null
        if(this.state === null || typeof this.state !== 'object'){
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = (oldState, newState) => {
            for(let p in newState) {
                if(oldState[p] === null || typeof oldState[p] !== 'object'){
                    oldState[p] = newState[p];
                }else{
                    merge(oldState[p], newState[p]); //深拷贝
                }
            }
        }
        merge(this.state,newState);
        this.rerender();
    }
}

export function createElement(type, attributes, ...children){
    let e ;
    if(typeof type === 'string'){
        e = new ElementWrapper(type);
    }else{
        e = new type;
    }

    for (let p in attributes) {
       e.setAttribute(p, attributes[p]);
    }

    let insertChildren = (children) => {
        for(let child of children){
            if (typeof child === "string") {
                child = new TextWrapper(child);
            }

            if(child === null){
                continue;
            }
    
            if((typeof child === "object") && (child instanceof Array)) {
                insertChildren(child);
            }else{
                e.appendChild(child);
            }
            
        }
    }

    insertChildren(children);


    return e;
}

export function render(component, parentElement){
    // parentElement.appendChild(component.root);
    let range = document.createRange();
    range.setStart(parentElement,0);
    range.setEnd(parentElement,parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}