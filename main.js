import  {createElement, Component, render} from "./toy-react.js"
// for(let i of [1,2,3]) {
//     console.log(i);
// }
class MyComponent extends Component{
    // render() {
    //     return <div></div>
    // }
    // constructor(){

    // }
    // setAttribute(name, value){

    // }
    // appendChild(){

    // }
    render() {
        return <div>
                <h1>my component</h1>
                {this.children}
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