import {isNullOrUndefined} from "util";

/**
 * 获取形如 `o1.o2.o3`的值
 * @param expr
 * @param target
 * @returns {any}
 */
function $expr(expr,target){

    const p = expr.split(".");
    const root = p.reduce((t,c)=>{
        // console.log(t[c])
        return t[c];
    },target);
    // console.log(root,expr,p,target)
    return root
}


/**
 * 观察指定的数据,这里的 data.d1 肯定不能直接添加callback方法
 *   所以在 对象的 get 和 set 方法中做文章
 *
 * @param expr eg:'data.d1'
 * @param callback
 * @param imme 如果true 直接调用一次callback
 * @return 返回的是一个 ObservableView 对象
 */
 // export  function $watch(expr:string,callback:()=>{},imme?:boolean);

function $watch( expr: string, callback: () => void, imme?: boolean): ObservableView {
    let target=this.data
    function activeNestObject(property){
        const parent = property;
        ;(typeof parent == 'object') &&  Object.keys(parent).filter(key=>parent.hasOwnProperty(key)).forEach(key=>{
            activeNestObject(parent[key])
        })
    }

    let returned = new ObservableView(()=>{
        const root = $expr(expr,target);
        activeNestObject(root)
    }, callback);
    returned.data;
    return returned
}


function makeObserveable<P>(target,child?:boolean): any {
    /**
     *返回的对象
     *     这个对象属性都是可观察的
     *     只暴露 data属性
     */
    function extendObj(obj) {
        let newObj: any
        if(!child){
            newObj = { data : Object.is(obj.type,BasedefiendPrimitive)?obj.data:obj};
            // console.log(newObj)
            newObj.$watch=$watch.bind(newObj)
            newObj.$expr=$expr.bind(newObj);
        }else{
            // console.log(obj)
            newObj = obj
        }
        return newObj
    }

    let def;
    if (!!target === false) {

    } else if (typeof target != 'object') {
        def = defiendPrimitive(target,BasedefiendPrimitive)
    }
    else if (Array.isArray(target)) {
        // 需要劫持数组所有的方法
    } else {
        def = definedObject(target);
    }
    def = extendObj(def);
    return def
}

export {makeObserveable as Observe};

export class BasedefiendPrimitive {

}
export class SimpleObject {
}
export class StructObject {
}

export class ComputeObject {

}

function asStruct(obj) {
    Object.defineProperty(obj, 'type', {
        writable: false,
        enumerable: true,
        configurable: true,
        value: StructObject
    });
    return obj
}

export {
    asStruct
}
/**
 * 观察和发送订阅事件,
 */
class SimpleEventEmiiter {

    listeners: ((any) => void)[] = [];

    sub(listener) {
        this.listeners.push(listener);
    }

    unSub(listener) {
        this.listeners = this.listeners.filter(l => l == listener)
    };

    emit(cur, prev?) {
        console.log(this.listeners.length,'listeners  ')
        this.listeners.forEach(lis => lis.call(null, cur, prev))

    };

}
/**
 * 栈结构的数组
 *  [] : 当前的栈的级别,如果一个对象观测的有多个 ObservableView嵌套使用,这里会和嵌套的层级数一致
 *  [][]: 保存当前的级别中的Atom
 */
let ObserveAtomStack: Atom[][] = [];
/**
 * 原子,数据改变的主要联系者
 *  持有
 *     观察的对象原子集合
 *     被观察的对象原子集合
 *  在数据改变时按需遍历通知这些集合
 *
 */
class Atom {
    observerings: Atom[] = []; // 本原子正在观测的对象原子
    observers: Atom[] = [];// 正在观测本原子的对象原子
    prevObserverings: Atom[] = []
    prevObservers: Atom[] = []
    value: any // 当前的值
    obs: Observable

    constructor(obs: Observable) {
        this.obs = obs
    }

    changeValue(value) {
        const prevValue = this.value;
        this.value = value;
        this.activeObservers();
        this.actualChange(prevValue !== value);

    }

    actualChange(changed: boolean) {
        if (changed) {
            console.log('changed = ' +changed,this.observers.length)
            this.observers.forEach((o => {
                o.obs.reactive();
            }))

        }
    }

    activeObservers() {
        this.prevObservers = this.observers;
        this.checkObserver();
        this.bindObservers();

    }

    /**
     * 将当前的Atom入栈
     */
    checkObserver=()=> {
        const currentStack = ObserveAtomStack[ObserveAtomStack.length-1];
        if (!isNullOrUndefined(currentStack)) {
            currentStack[currentStack.length] = this
        }
    }

    bindObservers=()=> {
        const currentStack = ObserveAtomStack[ObserveAtomStack.length-1];
        if (!isNullOrUndefined(currentStack)) {
            const observeView = currentStack[0];
            if (this.observers.indexOf(observeView) === -1) {
                this.observers.push(observeView)
            }
            observeView.checkObserings(this);
        }
        // console.log('ObserveAtomStack',this.observers.length)
    }

    checkObserings(atom: Atom) {

        if (this.observerings.indexOf(atom) > -1) {
            this.observerings.push(atom)
        }
    }

}


class Observable {
    protected type: object;
    /* 数据的结构类型*/
    protected $data: any;
    protected key: string
    /* 当前获取的值的 名字*/
    protected atom = new Atom(this);
    protected simpleEventEmiiter = new SimpleEventEmiiter();

    constructor(data, type, key = 'data') {
        this.$data = data;
        this.type = type;
        this.key = key;
        Object.defineProperty(this, 'type', {
            writable: true,
            enumerable: false,
            configurable: true,
            value: type
        });
    }

    set data(value: any) {
        const prevValue = this.data;
        // console.log(`key = ${this.key} ;value = ${value} this.type = ${Object.is(this.type, StructObject)}`);
        if (!isObservable(value) && typeof value == 'object' && Object.is(this.type, StructObject)) {
            this.$data = makeObserveable(value,true);
        } else {
            this.$data = value;
        }

        this.atom.changeValue(value)
        this.simpleEventEmiiter.emit(value, prevValue);
    }

    get data() {
        // console.log(`key --- = ${this.key}`);
        this.atom.activeObservers();
        return this.$data
    }

    addSub(lis: (cur, prev) => void, imme?: boolean) {
        this.simpleEventEmiiter.sub(lis);
        if (imme) {
            this.simpleEventEmiiter.emit(this.$data)
        }
    }

    reactive() {

    }


    toString() {
        return `type = ${this.type}    data = ${this.$data}`
    }

}

class ObservableView extends Observable {
    expr: () => void

    constructor(expr, func: () => void) {
        super(null, ComputeObject, 'compute Value');
        this.expr = expr;
        this.simpleEventEmiiter.sub(func)
    }

    set data(value) {
        throw `ObservableView can't set a new value`
    }

    /**
     *
     */
    get data() {
        ObserveAtomStack[ObserveAtomStack.length] = [this.atom];
        let value = this.expr.call(null);
        ObserveAtomStack.pop();
        return value
    }

    reactive() {
        this.simpleEventEmiiter.emit(this.data);
    }
}

/**
 * 检测是否是观察对象
 * @param target
 * @returns {boolean}
 */
function isObservable(target): boolean {
    const type = target.type;
    return Object.is(type, SimpleObject)
        || Object.is(type, BasedefiendPrimitive)
        || Object.is(type, StructObject)
        || Object.is(type, ComputeObject)
}

// 标识基本类型
function defiendPrimitive(primitive, type, key?) {
    type = type || BasedefiendPrimitive;
    const observer = new Observable(primitive, type, key);
    return observer
}

// 标识对象
function definedObject(obj: any) {
    const tag = SimpleObject;
    let parentType = obj.type ? obj.type : tag;

    Object.defineProperty(obj, 'type', {
        writable: false,
        enumerable: false,
        configurable: true,
        value: parentType
    });

    for (let key in obj) {
        // 如果是一个复杂对象
        let value = obj[key];
        const isComplicate = typeof value == 'object';
        let type = isComplicate ? value.type : "" ;
        let newObj;

        if (isComplicate && Object.is(parentType,StructObject)) {
            value.type = parentType;
            newObj = makeObserveable(value,true)
        }

        newObj = defiendPrimitive(value, parentType, key);

        // console.log(newObj,key);
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            get: function () {
                return newObj.data
            },
            set: function (value) {
                newObj.data = value
            }
        })
    }

    return obj
}
