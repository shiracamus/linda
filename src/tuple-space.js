import {toTuple} from './tuple'

export default class TupleSpace {

  constructor (name) {
    this.name = name
    this.tuples = []
    this.waiters = []
  }

  get size () {
    return this.tuples.length
  }

  write (tuple) {
    tuple = toTuple(tuple)
    for (let i = this.waiters.length - 1; i >= 0; i--) {
      let waiter = this.waiters[i]
      if (waiter.tuple.match(tuple)) {
        this.waiters = [...this.waiters.slice(0, i), ...this.waiters.slice(i + 1)]
        waiter.resolve(tuple)
        if (waiter.options.delete) return
      }
    }
    this.tuples.push(tuple)
  }

  async read (tuple, options = {delete: false}) {
    tuple = toTuple(tuple)
    for (let i = this.tuples.length - 1; i >= 0; i--) {
      let _tuple = this.tuples[i]
      if (tuple.match(_tuple)) {
        if (options.delete) {
          this.tuples = [...this.tuples.slice(0, i), ...this.tuples.slice(i + 1)]
        }
        return _tuple
      }
    }
    return new Promise((resolve) => {
      this.waiters.unshift({tuple, resolve, options})
    })
  }

  take (tuple) {
    return this.read(tuple, {delete: true})
  }
}
