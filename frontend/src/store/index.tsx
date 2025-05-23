import { reactive, readonly } from 'vue'

export abstract class Store<T extends Object> {
  protected state: T

  constructor() {
    let data = this.loadLocalData()
    if (!data) {
      data = this.data()
    }
    this.state = reactive(data) as T
  }

  protected abstract data(): T

  protected abstract key(): string

  public updateState(): void {    
    console.log('%%%%%', this.state)
    localStorage.setItem(this.key(), JSON.stringify(this.state))
  }

  public removeState(): void {
    localStorage.removeItem(this.key())
  }

  private loadLocalData(): T | null {
    const localStore = localStorage.getItem(this.key())
    if (localStore) {
      return JSON.parse(localStore)
    }
    return null
  }

  public getState(): T {
    return readonly(this.state) as T
  }
}