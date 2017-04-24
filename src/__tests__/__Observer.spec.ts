/**
 * Created by hyc on 17-4-24.
 */
import {Observe, BasedefiendPrimitive, SimpleObject, StructObject, asStruct} from '../Observe'

describe("Observer testing", () => {
    it('Primitives', () => {
        const b1 = Observe(true);
        const n1 = Observe(23);
        const s1 = Observe('s1');
        expect(b1.data).toBe(true);
        expect(n1.data).toBe(23);
        expect(s1.data).toBe('s1')
    })

    it('ObjectObserver', () => {
        let o1 = {age: 12, pivot: 'haah'}
        const obs1 = Observe(o1)
        expect(obs1.data.age).toEqual(o1.age)
        expect(obs1.data.pivot).toEqual(o1.pivot)
        let o2 = {
            age: 12, pivot: 'haah', firend: {
                name: 'hyc', age: 25
            }
        }
        const obs2 = Observe(o2)
        // expect(obs2.age.type).toBe(SimpleObject)
        // expect(obs2.firend.type).toBe(SimpleObject)
        expect(obs2.data.firend).toBe(o2.firend)
    })

    it("$watch", (done) => {
        // jest.useRealTimers();
        let o1 = {age: 12, sssss: 'haah', friend: {favo: "game"}}
        const obs1 = Observe(asStruct(o1))
        const property = 'age', newValue = {year: 2009}

        obs1.$watch(property, function () {
            console.log(`property ${o1.age} changed => ${obs1.data.age}`)
            expect(obs1.data.age).toBe(newValue)
        });

        obs1.data.age = newValue;


        let p2 = 'friend', newFavo = {Name: 'dota2'}
        obs1.$watch(p2, function () {
            console.log(`property ${o1.friend} changed => ${obs1.data.friend}`)
            expect(obs1.data.friend).toBe(newFavo)
            expect(obs1.data.friend.Name).toBe('dota2')
            done()
        });

        obs1.data.friend = newFavo;

    })

    it("$watch nest value", (done) => {
        let o1 = {age: 12, pivot: 'haah', friend: {favo: "game", time: 1997}}
        const obs1 = Observe(asStruct(o1))

        let p2 = 'friend', newFavo = {time: 'dota2'}

        obs1.$watch(p2, function () {
            expect(obs1.data.friend).toEqual({...o1.friend, time: newFavo.time});
            expect(obs1.data.friend.time).toBe('dota2');
            if (obs1.data.friend.favo == 'porn') {

                done()
            }
        });

        obs1.data.friend.time = 'dota2'
        obs1.data.friend.favo = 'porn'
    })


});