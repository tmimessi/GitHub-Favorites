export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`
    // o fetch (promessa) vai procurar na internet qualquer coisa que colocar e dpeois vai transformar esse dado encontrado em json e depois retorne esse mesmo dado em objeto {}
    return fetch (endpoint)
    .then(data => data.json())
    .then(({login, name, public_repos, followers}) => ({
      login,
      name,
      public_repos,
      followers
    }))
  }
}