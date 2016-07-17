/* eslint-env mocha */

import Tuple from '../src/tuple'
import {assert} from 'chai'

describe('Tuple', function () {
  it('has data', function () {
    const name = 'shokai'
    const web = 'http://shokai.org'
    const tuple = new Tuple({name, web})
    assert.deepEqual(tuple.data, {name, web})
  })
})
