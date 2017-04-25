import {asStruct, Observe} from './Observe'


let __Vmodels = {}
function inspectVmodel(node: HTMLElement) {
    if (node.tagName === 'INPUT' && node.getAttribute('type') === 'text') {
        const attrModel = node.getAttribute('v-model')
        if (attrModel) {
            let vm = __Vmodels[attrModel];
            __Vmodels[attrModel] = vm ? vm : [];
            __Vmodels[attrModel].push(node);
        }
    }
}

let __TextNodes = {};
function replaceTextNode(node, content) {
    let match;
    const parent = node.parentNode
    let __tns: any = []
    let reg = /({{(.*?)}})/g;
    while (match = reg.exec(content)) {
        const nodes = content.split(reg);
        // console.log(nodes)
        if (match.length > 0) {
            // console.log(nodes)
            node.innerHTML = nodes.map((n, i) => {
                // 1,4,7,10
                const nd = document.createTextNode(n + "@");
                if ((i - 1) % 3 == 0) {
                    __tns.push(nd);
                }
                return nd
            })
        }
    }
    return __tns;
}


function inspectNode(root: HTMLElement) {
    const children = root.childNodes;
    console.log(children,root.tagName==='SPAN');
    const newChldren =[].slice.call(children);
    newChldren.forEach( function (node) {
        /**
         *
         * 注意 !  在这里面动态改变了children的DOM结构
         *
         * 所以对于嵌套的结构 比如
         * <code>
         *        <div>{{user.name}} <span>{{user.age}}</span></div>
         * </code>
         * 这种如果改变的话,会导致后面的节点不能被遍历到.
         * 所以要从后面向前面遍历
         *
         * 还有 形如
         * <code>
         * <div id='app'>
         *     <div>{{}}</div>
         *     -{{user.title}} -@@ -  {{user.year}} - -======={{user.year}}{{user.year}} - -
         *  </div>
         * <code>
         *
         */
        if (node.nodeType === 3&&node.textContent!="") {
            let ary,content =node.textContent;
            while(true) {
                const vueReg = /{{(.*?)}}/g;
                ary = vueReg.exec(content)
                if(!ary)return
                const [bathness , name] = ary;
                console.log(bathness,name)
                node.splitText(node.textContent.indexOf(bathness));
                let next = node.nextSibling;
                next.splitText(next.textContent.indexOf("}}"));
                node = next.nextSibling
                content = next.nextSibling.textContent;
                __TextNodes[name]=__TextNodes[name]?__TextNodes[name]:[]
                __TextNodes[name].push(next)
            }
        } else {
            if (node.childNodes.length>0) {
                inspectNode(node);
            }
            inspectVmodel(node)
        }
    });
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
    console.log(__TextNodes)
    for (let item in __TextNodes) {
        let textNodes = __TextNodes[item];

        let v = model.$watch(item, () => {
            const d = model.$expr(item) || " ";
            // console.log(textNodes)
            textNodes.forEach(n => {
                n.textContent = d+""
            })
        }, true)
        // console.log(v)
    }

    for (let item in __Vmodels) {
        __Vmodels[item].forEach(dc => {
            dc.addEventListener('input', function (e) {
                let obv = model.$expr(item);
                let val = e.target.value;
                model.$exprset(item, val)
                console.log(model.data)
            }, false)
        })
    }
}