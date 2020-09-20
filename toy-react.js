const RENDER_TO_DOM = Symbol("render to dom");


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
    get vdom(){
        this.vchildren = this.children.map(child=>child.vdom);
        return this.render().vdom;
    }
    // get vchildren(){
    //     this._range = range;
    //     this.render()[RENDER_TO_DOM](range);
    // }
    [RENDER_TO_DOM](range){//range api 操作 重新渲染 取元素改为渲染进range
        this._range = range; //重新绘制做准备
        this._vdom = this.vdom;
        this._vdom()[RENDER_TO_DOM](range); //[] 代表是个变量
    }
    update(){
        let isSameNode = (oldNode,newNode) => {
            if(oldNode.type  !==  newNode.type) return false;
            for(let name in newNode.type){
                if(newNode.props[name] !== oldNode.props[name]){
                    return false;
                }
            }
            if(Object.keys(oldNode.props).length !== Object.keys(newNode.props).length){
                return false;
            }

            if(newNode.type === "#text"){
                if(newNode.content !== oldNode.content){
                    return false;
                }
            }
            return true;
        }
        let update = (oldNode, newNode) => {
            //type, type不一致 完全不同·
            // props   打patch更改  根结点不一样
            // children  
            //#text content replace
            //对比根结点和children是否一致
            if(!isSameNode(oldNode, newNode)){
                newNode[RENDER_TO_DOM](oldNode._range);
                return;
            }
            newNode._range = oldNode._range;
            
            let newChildren = newNode.vchildren;
            let oldChildren = oldNode.vchildren;

            if(!newChildren || !newChildren.length){
                return;
            }

            let tailRange = oldChildren[oldChildren.length - 1]._range;
    

            for (let i = 0; i < newChildren.length; i++) {
               let newChild = newChildren[i];
               let oldChild = oldChildren[i];
               if(i<oldChildren.length){
                    update(oldChild, newChild);
               }else{
                    //插入
                    let range = document.createRange();
                    range.setStart(tailRange.endContainer, tailRange.endOffset);
                    range.setEnd(tailRange.endContainer, tailRange.endOffset);
                    newChild[RENDER_TO_DOM](range);
                    tailRange = range;
                }
                
            }

        }

        let vdom = this.vdom;
        update(this._vdom,this.vdom)
        this._vdom = vdom;
    }
    // get root(){
    //     //取root渲染相关
    //     if(!this._root){
    //         this._root = this.render().root;
    //     }
    //     return this._root;
    // }
    // rerender(){
    //     let oldRange = this._range;          
    //     //cha ru range
    //     let range = document.createRange();
    //     range.setStart(oldRange.startContainer,oldRange.startOffset);
    //     range.setEnd(oldRange.startContainer,oldRange.startOffset);
    //     this[RENDER_TO_DOM](range);

    //     oldRange.setStart(range.endContainer,range.endOffset);
    //     oldRange.deleteContents();
    //     // this._range .deleteContents(); //delete range content
    //     // this[RENDER_TO_DOM](this._range);
    // }

 
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

//setstate react 旧的新的都合并
class ElementWrapper extends Component{
    constructor(type) {
        super(type);
        this.type = type;
        this.root = document.createElement(type);
    }
    // setAttribute(name,value){
    //     // this.root.setAttribute(name,value) 存 attribute
    //     if(name.match(/^on([\s\S]+)$/)){
    //         // RegExp.$1
    //         this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()),value); //事件大小写敏感
    //     }else{
    //         if(name === "className"){
    //             this.root.setAttribute("class",value);
    //         }else{
    //             this.root.setAttribute(name,value);
    //         }
    //     }
    // }
    // appendChild(component){
    //     // this.root.appendChild(component.root) 存children
    //     let range = document.createRange();
    //     range.setStart(this.root,this.root.childNodes.length);
    //     range.setEnd(this.root,this.root.childNodes.length);
    //     component[RENDER_TO_DOM](range);

    // }
    get vdom () {
        return this;
        // {
        //     type: this.type,
        //     props: this.props,
        //     children: this.children.map(child => child.vdom)
        // }
    }

    [RENDER_TO_DOM](range){
        this._range = range;
        range.deleteContents();
        // range.insertNode(this.root);
        let root = document.createElement(this.type);

        for(let name in this.props) {
            let value = this.props[name];
            if(name.match(/^on([\s\S]+)$/)) {
                   root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()),value);
            } else {
                if(name === "className"){
                    root.setAttribute("class",value);
                }else{
                    root.setAttribute(name,value);
                }
            }   
        }

        if(this.vchildren){
            this.vchildren = this.children.map(child => child.vdom)
        }
        for (let child of this.children ) {
            let childRange = document.createRange();
            childRange.setStart(root,root.childNodes.length);
            childRange.setEnd(root,root.childNodes.length);
            component[RENDER_TO_DOM](childRange);
        }

        replaceContent(range, this.root);
        range.insertNode(root);
    }
    
}

class TextWrapper  extends Component{
    constructor(content) {
        super(content);
        this.content = content;
        this.type = "#text";
        // this.root = document.createTextNode(content);
    }
    get vdom(){
        return this;
        // {
        //     type: "#text",
        //     content: this.content
        // }
    }
    [RENDER_TO_DOM](range){
        this._range = range;
        // range.deleteContents();
        // range.insertNode(this.root);
        let root = document.createTextNode(this.content);
        replaceContent(range, this.root);
    }
}


function replaceContent(range, node){
    range.insertNode(node);
    range.setStartAfter(node);
    range.deleteContents();

    range.setStartBefore(node);
    range.setEndAfter(node);
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