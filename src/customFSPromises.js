const { eventOrder } = require("./constants")



class CustomFSPromises {
  constructor({ cryptoHelper }) {
    this.cryptoHelper = cryptoHelper
  }

  //função que vai interceptar o comportamento padrão do writeFIle do fs/promises
  async writeFile(filename, data, enconding = '') {
    const encryptedText = await this.cryptoHelper.encrypt(data)

    return Object.values({
      filename,
      encryptedText,
      enconding
    })
  }

  //função que vai interceptar o comportamento padrão do readFile do fs/promises
  async readFile(data) {
    const decrypted = await this.cryptoHelper.decrypt(data)
    return decrypted
  }


  configure() {
    const configuration = new Map()

    const writeFileOptions = {
      when: eventOrder.beforeOriginalCall,//Diz se essa função vai ser chamada antes ou depois da função original
      fn: this.writeFile.bind(this)//função que vai ser executada na interceptação
    }

    configuration.set(this.writeFile.name, writeFileOptions)

    const readFileOptions = {
      when: eventOrder.afterOriginalCall,//Diz se essa função vai ser chamada antes ou depois da função original
      fn: this.readFile.bind(this)//função que vai ser executada na interceptação
    }


    //Guarda no nome da função no "key" do Map, e guarda opções de configuração da chamada dela
    configuration.set(this.readFile.name, readFileOptions)

    return configuration

  }

}

module.exports = CustomFSPromises