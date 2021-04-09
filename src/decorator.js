const { eventOrder } = require("./constants")

class Decorator {
  static #decorate = ({ fn, when }, oldFn) => async (...args) => {
    const [first, second] = when === eventOrder.afterOriginalCall ?
      [oldFn, fn] :
      [fn, oldFn]


    /**
     * Executa a função que tem que ser executada oldFn(original) ou fn(A minha criada) 
     * args => é o argumento das função
     */
    const result = await first.apply(this, args)

    /**
     * Verifica se o retorno é array ou não, para pasar pro apply, que só aceita os args como array
     * 
     * 
     */
    const defaultFormat = Array.isArray(result) ? result : [result]

    /**
     * Retorna a função que vais ser chamada posteriormente
     */
    return second.apply(this, defaultFormat)

  }

  static decorateModule(overridenMethods, target) {
    //Cria uma cópia do objeto ou class a ser interceptada
    const moduleClone = Object.assign({}, target)
    const finalFunctions = new Map()
    //Pega o nome da função que vai ser executada "key", e pega as configurações para chamar a função "value"
    for (const [key, value] of overridenMethods) {
      /**
       * Pega(por reflexão) a função dentro do clone do target (Que é exatamente a função que vai ser interceptada),com a key(nome)
       * 
       * 
       */
      const oldFn = Reflect.get(moduleClone, key)

      finalFunctions.set(key, this.#decorate(value, oldFn))
    }

    //Transforma Map em objeto
    const newFunctions = Object.fromEntries(finalFunctions)

    //Injeta as funções no objeto
    Object.assign(target, newFunctions)
  }
}

module.exports = Decorator