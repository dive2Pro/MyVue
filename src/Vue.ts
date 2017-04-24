import { asStruct, Observe} from './Observe'



let __nodes={

}
/**
 *
 * @param root
 */
function inspectNode(root:HTMLElement){
    const children = root.childNodes;
    [].forEach.call(children,function(node){
        if(node.nodeType===3){
            const vueReg = /{{(.+)?}}/g;
            const ary=vueReg.exec(node.textContent);
            if(ary){
                let name = ary[1];
                __nodes[name] = __nodes[name]?__nodes[name]:[]
                __nodes[name].push(node)
            }
        } else if(node.hasChildNodes()){
             inspectNode(node);
         }
    })
}

/**
 * 解析文档,需求
 *         1. 获取以 {{ }} 的特殊标识
 *         2. 要更新dom,所以肯定需要持有其所在的节点.
 *                -将dom换成string然后再拼接?
 *                 1. 每次都需要将字符串更改后的整个文档的string拼接到dom上,效率太低
 *                 2. dom中的多个相同引用会导致刷新效率低
 *         3. 文档的所有节点都需要遍历一遍
 * @param root
 * @returns {string[]}
 * @constructor
 */

function SpecHtml(root: string) {
    const html = document.getElementById(root);
    // 遍历文档
    if (html) {
        inspectNode(html);
    }

}


interface  IVueProps {
    el: string,
    data: object
}

export function Vue(mode: IVueProps) {
    const {el, data} = mode
    const parms = SpecHtml(el);
    const model = Observe(asStruct(data));
    for(let item in __nodes){
        const d=model.$expr(item,model.data)||" ";
        __nodes[item].forEach(n=>{
            const vueReg = /{{(.+)?}}/g;
            n.textContent=(n.textContent).replace(vueReg,d);
        })

    }

}