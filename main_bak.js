import  {createElement, Component, render} from "./toy-react-bak.js"
// for(let i of [1,2,3]) {
//     console.log(i);
// }
class MyComponent extends Component{
    // render() {
    //     return <div></div>
    // }
    constructor(){
        super();//调component构造函数
        this.state = {
            a:1,
            b:2
        }
    }
    // setAttribute(name, value){

    // }
    // appendChild(){

    // }
    render() {
        return <div>
                    <h1>my component</h1>
                    <button onclick={()=> {this.setState({a: this.state.a+1})}} >add</button>
                    <span>{this.state.a.toString()}</span>
                    <span>{this.state.b.toString()}</span>
                    {/* {this.children} */}
                </div>
    }
}


    
//let a
// window.a = <div id="a" class="c">
//         <div>abc</div>
//         <div></div>
//         <div></div>
//         <div></div>
//     </div>

// document.body.appendChild(<div id="a" class="c">
// <div>abc</div>
// <div></div>
// <div></div>
// <div></div>
// </div>)

render(<MyComponent id="a" class="c">
<div>abc</div>
<div></div>
<div></div>
<div></div>
</MyComponent>,document.body)