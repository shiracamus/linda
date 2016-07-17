/* eslint-env mocha */

import Tuple from '../src/tuple'
import {assert} from 'chai'

describe('Tuple', function () {
  const name = 'shokai'
  const web = 'http://shokai.org'
  const tuple = new Tuple({name, web})
  it('has data', function () {
    assert.deepEqual(tuple.data, {name, web})
  })

  describe('match', function () {
    it('match', function () {
      assert.ok(tuple.match(new Tuple({name, web})))
    })

    it('not match', function () {
      assert.ok(!tuple.match(new Tuple({name})))
    })

    it('partial match', function () {
      assert.ok(tuple.match(new Tuple({name, web, age: 100})))
    })

    it('deep match', function () {
      let tuple = new Tuple({arr: [1, 2]})
      assert.ok(tuple.match(new Tuple({arr: [1, 2], name, web})))
    })
  })
})
