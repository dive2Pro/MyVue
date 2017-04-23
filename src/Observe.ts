
/**
 * 原子,用来扩展一个对象
 *
 */
class Atom {}



/**
 * 传入一个对象,将其改造成Atom
 *
 */
function makeObserveable<P>(target): any {
  /**
   *返回的对象
   *     这个对象属性都是可观察的
   *     所以需要劫持其所有属性的 get set方法
   *
   */

  let def;

  // 如果传入的为空
  console.log(typeof target, '---');
  if (!!target === false) {
  }
  // 如果只是 基本类型 返回一个
  else if (typeof target != 'object') {
    def = defiendPrimitive(target)
  } else if (Array.isArray(target)) {
  } else {
    // 如果是一个对象
    def = definedObject(target);
  }

  return def
}

export {makeObserveable as Observe};

class BasedefiendPrimitive {
  constructor(data: any) {}
}


/**
 * 观察和发送订阅事件,
 */
class SimpleEventEmiiter {
  sub() {}

  unSub() {}
  emit(prev, cur) {}
}

class Observale {
  tpye: object;
  public $data: any
  simpleEventEmiiter = new SimpleEventEmiiter()
  constructor(data){this.data = data}

  set data(value: any) {
    console.log('set');
    const prevValue = this.data;
    this.$data = value;
    // 发送事件
    this.simpleEventEmiiter.emit(prevValue, value)
  }

  get data() {
    console.log('get');
    return this.$data + '--'
  }
}

// 标识基本类型
function defiendPrimitive(primitive) {
  const type = new BasedefiendPrimitive(primitive);
  const observer = new Observale(primitive);
  return observer
}


function definedObject(obj: {}) {
  for (let key in obj) {
    const primitiveObj = defiendPrimitive(obj[key])
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      // writable: true,
      get: function() {
        return primitiveObj.data
      },
      set: function(value) {
        console.log(value)
        primitiveObj.data = value
      }
    })
  }

  return obj
}
