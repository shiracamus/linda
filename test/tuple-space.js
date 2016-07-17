/* eslint-env mocha */

import {assert} from 'chai'
import TupleSpace from '../src/tuple-space'

describe('TupleSpace', function () {

  const name = 'shokai'
  const web = 'http://shokai.org'

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
    })
  })
})
