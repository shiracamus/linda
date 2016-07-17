import {toTuple} from './tuple'

export default class TupleSpace {

  constructor (name) {
    this.name = name
    this.tuples = []
  }

  get size () {
    return this.tuples.length
  }

  write (tuple) {
    this.tuples.push(toTuple(tuple))
  }

  async read (tuple) {
    tuple = toTuple(tuple)
    for (let i = this.tuples.length - 1; i >= 0; i--) {
      let _tuple = this.tuples[i]
      if (tuple.match(_tuple)) {
        return _tuple
      }
    }
  }

  async take (tuple) {
    tuple = toTuple(tuple)
    for (let i = this.tuples.length - 1; i >= 0; i--) {
      let _tuple = this.tuples[i]
      if (tuple.match(_tuple)) {
        this.tuples = [...this.tuples.slice(0, i), ...this.tuples.slice(i + 1)]
        return _tuple
      }
    }
  }
}
