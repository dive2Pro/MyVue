/**
 * Created by hyc on 17-4-24.
 */
import {Observe, BasedefiendPrimitive, SimpleObject, StructObject, asStruct, $watch} from '../Observe'

describe("Observer testing",()=>{
    it('Primitives',()=>{
        const b1=Observe(true);
        const n1 = Observe(23);
        const s1 = Observe('s1');
        expect(b1.data).toBe(true);
        expect(n1.data).toBe(23);
        expect(s1.data).toBe('s1')
    })

    it('ObjectObserver',()=>{
        let o1 = {age:12,pivot:'haah'}
        const obs1=Observe(o1)
        expect(obs1.age).toEqual(o1.age)
        expect(obs1.pivot).toEqual(o1.pivot)
        let o2 ={
            age:12,pivot:'haah',firend:{
                name:'hyc',age:25
            }
        }
        const obs2 = Observe(o2)
        // expect(obs2.age.type).toBe(SimpleObject)
        // expect(obs2.firend.type).toBe(SimpleObject)
        expect(obs2.firend).toBe(o2.firend)
    })

    it("$watch",()=>{
        let o1 = {age:12,pivot:'haah',friend:{favo:"game"}}
        const obs1=Observe(asStruct(o1))
        const property = 'age',newValue = { year:2009 }

        $watch(obs1,property,function(){
            console.log(`property ${o1.age} changed => ${obs1.age}`)
            expect(obs1.age).toBe(newValue)
        });

        obs1.age = newValue;


        let p2='friend',newFavo = {Name:'dota2'}
        $watch(obs1,p2,function(){
            console.log(`property ${o1.friend} changed => ${obs1.friend}`)
            expect(obs1.friend).toBe(newFavo)
            expect(obs1.friend.Name).toBe('dota2')
        });

        obs1.friend = newFavo;

        let o2 ={
            age:12,pivot:'haah',firend:{
                name:'hyc',age:25
            }
        }
        // const obs2 = Observe(o2)

    })


});