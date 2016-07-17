import deepEqual from 'deep-equal'

export default class Tuple {

  constructor (data) {
    this.data = data
  }

  match (target) {
    if (!target.data) return false
    for (let key of Object.keys(this.data)) {
      if (!deepEqual(target.data[key], this.data[key])) return false
    }
    return true
  }

}
