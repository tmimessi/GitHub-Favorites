import { GithubUser } from "./githubUser.js"


// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  // o constructor vai possuir uma entrada chamada root, que é a div app
  constructor(root) {
    // procurar qual é o root
    this.root = document.querySelector(root)
    // carregando os dados do usuário
    this.load()
  }

  load() {
    // o json é um tipo de dado que tem no JS que tem várias propriedades e funcionalidades e o parse serve para pegar o objeto no json e atribuir um valor e se ele for vazio, para não retornar uma string, vai retornar um array do mesmo  jeito
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  // função para salvar os dados no localStorage 
  save() {
    // o JSON.stringify transforma o objeto (this.entries) que está no JS para um objeto string para salvar no localStorage
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  // função assíncrona
  async add(username) {
   try { 
     // aqui, ele vai verificar se o usuário adicionado já não está na tabela antes de ir procurar no gitHub
     const userExists =  this.entries.find(entry => entry.login === username)
     if (userExists) {
       throw new Error('Usuário já cadastrado')
     }
     
    // aqui, ele vai aguardar a promessa se cumprir para continuar nas próximas linhas 
    // procurando o nome do usuário no gitHub
    const user = await GithubUser.search(username) 

    if (user.login === undefined) {
      throw new Error('Usuário não encontrado!')
    }
    // adicionando o usuário novo e usando o spread operator para colocar abaixo desse novo usuário os que já estavam adicionados antes
    this.entries = [user, ...this.entries]
    this.update()
    this.save()

  } catch(error) {
    alert(error.message)
  }
  }

  delete(user) {
    // higher-order functions (map, filter, find, reduce)
    // o filter vai rodar uma função para cada entrada e remover aquela que foi retirada
    //  a ideia não é substituir o array de antes e sim criar um novo com as atualizações 
    // aqui então está vendo se o login do usuário da lista é o mesmo, senão, é pq foi deletado, então vai exibir o array atualizado 
    const filteredEntries = this.entries.filter(entry =>
      entry.login !== user.login)
      // então o entries antigo vai receber o novo entries
      this.entries = filteredEntries
      this.update()
      this.save()
  }
}

// classe que vai criar a visualização e eventos do html
// criando uma nova classe e puxando tudo o que tem na classe Favorites acima
export class FavoritesView extends Favorites {
  constructor(root) {
    // essa linha vai chamar o constructor da Favorites
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onadd()
  }

  // função para quando clicar no botão de adicionar 
  onadd (){
    // pegando o botão 
    const addButton = this.root.querySelector('.search button')
    // quando der um click no botão:
    addButton.onclick = () => {
      // pegando o valor que tem na caixinha input
      const {value} = this.root.querySelector('.search input')
      this.add(value)
    }
  }

  // função para atualizar a tabela e uma das atualizações é remover linhas, chamando então essa função
  update() {
    this.removeAllTr()

    // pra cada usuário do entries
    this.entries.forEach(user => {
      // colocando o objeto em cada row
      const row = this.createRow()
      // mudando o user image
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      // se eu preciso colocar nesse  botão remove mais de um evento de click, então usar o addEventListener, se nunca mais no evento da aplicação vai precisar colocar o evento de click, usar o onclick
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if (isOk) {
          this.delete(user)
        }
      }
      // depois de criar a row de imagem, ela vai para o tbody:
      this.tbody.append(row)
    })
  }

  // vai usar essa estrutura de row para cada elemento que tiver os meus dados
  createRow() {
    const tr = document.createElement('tr') //dom
    // peguei o conteúdo da tr lá do html (apaguei lá)
    tr.innerHTML = `
    <td class="user">
      <img
        src="https://github.com/maykbrito.png"
        alt="Imagem de Mayk Brito"
      />
      <a href="github.com/maykbrito" target="_blank">
        <p>Mayk Brito</p>
        <span>maykbrito</span>
      </a>
    </td>
    <td class="repositories">76</td>
    <td class="followers">9589</td>
    <td>
      <button class="remove">&times;</button>
    </td>
    `
    return tr
  }

  // função para pegar cada linha da tabela no html e remover
  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}
