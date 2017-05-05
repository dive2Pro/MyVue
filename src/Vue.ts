import {asStruct, Observe} from './Observe'


function bindVon(node,name){

}


/**
 * 检查是否有 v-on 事件观察
 *
 * @param node
 */
let reg_V_on = /^(v-on)/g;
let reg_V_model = /^v-model/g;
let __Vmodels = {};
let __Vons = {};

let __TextNodes = {};

function inspectV(node:HTMLElement){
    const attrs = [].slice.call(node.attributes);

    for (let v in attrs) {
        /** http://www.w3school.com.cn/jsref/dom_obj_attributes.asp */
        const {name,value} = attrs[v];

        if(reg_V_on.test(name)){
            let ens = __Vons[value];
            __Vons[name] = ens ? ens:[];
            __Vons[name].push({node,value});

        }else if(reg_V_model.test(name)){
            let vm = __Vmodels[value];
            __Vmodels[value] = vm ? vm : [];
            __Vmodels[value].push(node);

        }

    }
}




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
         */
        if (node.nodeType === 3&&node.textContent!="") {
            let ary,content =node.textContent;
            while(true) {
                const vueReg = /{{(.*?)}}/g;
                ary = vueReg.exec(content)
                if(!ary)return
                const [bathness , name] = ary;
                node.splitText(node.textContent.indexOf(bathness));
                let next = node.nextSibling;
                next.splitText(next.textContent.indexOf("}}")+2);
                node = next.nextSibling
                content = next.nextSibling.textContent;
                __TextNodes[name]=__TextNodes[name]?__TextNodes[name]:[]
                __TextNodes[name].push(next)
            }
        } else {
            if (node.childNodes.length>0) {
                inspectNode(node);
            }
            inspectV(node);
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

function SpecHtml() {
    const that = this;

    const html = document.getElementById(that.$el);
    // 遍历文档
    if (html) {
        inspectNode(html);
    }
}


interface  IVueProps {
    el: string,
    data: object,
    methods:object// { key:func }
}

export class  Vue{
    $el:string
    $data:object
    $methods:object
    $model
    constructor(mode: IVueProps){
        const {el, data,methods} = mode
        this.$el=el
        this.$data=data

        Object.getOwnPropertyNames(data).forEach(name=>{
            Object.defineProperty(this,name,{
                enumable:false,
                configurable:true,
                writable:true,
                value:data[name]
            })
        });

        this.$methods=methods

        this.init()
    }

    init(){
        SpecHtml.call(this);
        this.bindVModel()
        this.bindVOns();
    }

    $eval(value){
        console.log(value)
    }
    bindVOns(){
        for(let name in __Vons){
            let objs = __Vons[name];
            const eventName = name.split(":").pop();
            if(eventName == null){
                continue
            }
            let expressReg = //g// 如果其
            objs.forEach(({node,value})=>{
                console.log(value)
                /**
                 * 在模板中的调用可能是这样的
                 * 没有回调参数
                 * <code>
                 * <div v-on:click="handleClick">click</div>
                 *
                 * </code>
                 * or
                 * 有回调参数,参数可能是string,或者是data中的数据,
                 * <code>
                 * <div v-on:click="handleClick('string')">click</div>
                 * <div v-on:click="handleClick( count+=1 )">click</div> ?
                 * </code>
                 * 目前能够得到的只是一串字符,目前知道的是 eval会执行这段字符串
                 * 但这时里面的 参数如果是表达式的话 如何去找到对应的值呢?
                 *
                 */

                let val,handler
                if(isSimpleMethod(value)){
                    handler = this.$methods[value].call(this);
                }else{

                    const argsReg = /(.+?)\((.+?)\)/g;
                    let ary = argsReg.exec(value)
                    if(ary){
                        let [,methodName,args]=ary
                        args =eval(args)

                        handler= this.$methods[methodName].bind(this,args);
                    }
                }

                bindEvent.call(this,node,eventName,handler)

            });

        }
    }
    bindVModel(){
        let  model  = this.$model = Observe(asStruct(this.$data));
        for (let item in __TextNodes) {
            let textNodes = __TextNodes[item];

            let v = model.$watch(item, () => {
                const d = model.$expr(item) || " ";
                textNodes.forEach(n => {
                    n.textContent = d+""
                })
            }, true)
        }

        for (let item in __Vmodels) {
            __Vmodels[item].forEach(dc => {
                dc.addEventListener('input', function (e) {
                    let obv = model.$expr(item);
                    let val = e.target.value;
                    model.$exprset(item, val);
                }, false)
            })
        }
    }
}


function isSimpleMethod(str):boolean{
    return !/\(.+?\)/.test(str)
}

function bindEvent(node,name,func){
    node.addEventListener(name,func,false)
}


