/* eslint-env mocha */

import {assert} from 'chai'
import TupleSpace from '../src/tuple-space'

describe('TupleSpace', function () {

  const name = 'shokai'
  const web = 'http://shokai.org'

  describe('synchronous case', function () {
    let ts = new TupleSpace()
    ts.write({name, web})
    describe('write', function () {
      it('write', function () {
        assert.equal(ts.size, 1)
      })
    })

    describe('read', function () {
      it('read', async function () {
        let tuple = await ts.read({name})
        assert.deepEqual(tuple.data, {name, web})
        assert.equal(ts.size, 1)
      })
    })

    describe('take', function () {
      it('take', async function () {
        ts.write({name: 'kazusuke'})
        assert.equal(ts.size, 2)
        let tuple = await ts.take({name})
        assert.deepEqual(tuple.data, {name, web})
        assert.equal(ts.size, 1)
        tuple = await ts.take({name: 'kazusuke'})
        assert.deepEqual(tuple.data, {name: 'kazusuke'})
        assert.equal(ts.size, 0)
      })
    })
  })

  describe('asynchronous case', function () {
    it('read', async function () {
      let ts = new TupleSpace()
      setTimeout(() => ts.write({name, web}), 1000)
      let tuple = await ts.read({name})
      assert.deepEqual(tuple.data, {name, web})
      assert.equal(ts.size, 1)
    })

    it('take', async function () {
      let ts = new TupleSpace()
      setTimeout(() => ts.write({name, web}, 1000))
      let tuple = await ts.take({name})
      assert.deepEqual(tuple.data, {name, web})
      assert.equal(ts.size, 0)
    })

    it('read then take', async function () {
      let ts = new TupleSpace()
      setTimeout(() => ts.write({name, web}, 1000))
      let [readTuple, takeTuple] = await Promise.all([
        ts.read({name}), ts.take({name})
      ])
      assert.deepEqual(readTuple.data, {name, web})
      assert.deepEqual(takeTuple.data, {name, web})
      assert.equal(ts.size, 0)
    })
  })
})
