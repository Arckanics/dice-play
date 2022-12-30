
class DicePlayer {
  constructor(name) {
    this.name = name
    this.current = 0
    this.glob = 0
    this.active = false
  }

  getName() {
    return this.name;
  }

  getCurrentScore() {
    return this.current
  }

  setCurrentScore(score) {
    this.root.querySelector('.current-score').innerText = score
    this.current = score
    return this
  }

  getGlobalScore() {
    return this.glob
  }

  setGlobalScore(score) {
    this.root.querySelector('.global-score').innerText = score
    this.glob = score
    return this
  }

  getState() {
    return this.active
  }

  setState() {
    this.root.classList.toggle('active')
    this.active = !this.active
    return this
  }

  setRootHTML(root) {
    this.root = document.getElementById(root)
    return this
  }

  isWinner() {
    this.root.querySelector('.global-score').innerText = "you won"
  }

}

class DiceGame {
  #root;
  #p1;
  #p2;
  constructor(root, p1, p2, assets) {
    this.#root = root
    this.#p1 = p1
    this.#p2 = p2
    this.assets = { ...assets }
    this.activePlayer = () => {
      return this.#p1.getState() ? this.#p1 : this.#p2
    }
    this.profiler = {
      "1": "transform: rotateY(  0deg)",
      "2": "transform: rotateY(-90deg)",
      "3": "transform: rotateX(-90deg)",
      "4": "transform: rotateY( 90deg)",
      "5": "transform: rotateX( 90deg)",
      "6": "transform: rotateY(180deg)"
    }
  }

  init() {
    const root = this.#root
    const p1 = this.#p1
    const p2 = this.#p2
    root.innerHTML = this.assets.root
    const players = [p1, p2]
    let num = 1
    players.map(p => {
      p.setRootHTML('player' + num)
      p.root.innerHTML = `
        <div class="mb-32 ">
          <div class="text-4xl player-name">${p.getName()}</div>
          <div class="text-6xl font-thin text-rose-500 global-score"></div>
        </div>
        <div class="bg-rose-500 w-1/4 p-3 px-9 mx-auto min-w-fit">
          <div class="text-sm font-normal text-gray-700 pb-1">current</div>
          <div class="text-3xl font-light text-white current-score"></div>
        </div>
      `
      p.setCurrentScore(0)
      p.setGlobalScore(0)
      num++
    })
    p1.setState()
    let cmd = document.getElementById('game-cmd')
    cmd.innerHTML = this.assets.cmd

    let faces = [...root.querySelectorAll('.dice__face')]
    faces.map(e => {
      let f = e.getAttribute('d-face')
      fetch(`./images/dice/face-${f}.svg`)
        .then(res => {
          return res.text()
        })
        .then(data => {
          e.innerHTML = data
        })
    })

    let icons = [
      {name: ".new-game", url: "./images/icons/new.svg", text: "new game"},
      {name: ".roll-dice", url: "./images/icons/roll.svg", text: "roll dice"},
      {name: ".hold", url: "./images/icons/hold.svg", text: "hold"}
    ]

    icons.map(i => {
      fetch(i.url).then((response) => {
        return response.text()
      })
      .then(data => {
        document.querySelector(i.name).classList.add('icon-text')
        document.querySelector(i.name).innerHTML = `<span class="icon">${data}</span><span>${i.text}</span>`
      })
    })

    this.attatchEvent()
    return this
  }

  swapActivePlayer() {
    this.#p1.setState()
    this.#p2.setState()
    return this
  }

  resetDice() {
    let profiler = this.profiler
    document.querySelector('.dice').setAttribute('style', profiler["1"])
    return this
  }

  rollDice() {
    const randNum = () => Math.floor(Math.random() * 6) + 1
    let profiler = this.profiler
    let rand = randNum()
    let player = this.activePlayer()
    const diceHtml = document.querySelector('.dice')
    diceHtml.setAttribute('style', profiler[rand.toString()])
    diceHtml.setAttribute('face', rand)
    
    if (rand > 1) {
      player.setCurrentScore(player.getCurrentScore() + rand)
      if (player.getGlobalScore() + player.getCurrentScore() >= 100) {
        this.resetDice().destroyEvent()
        player.isWinner()
        console.log(`${player.getName()} has won the game`)
      } else {
        console.log(`${player.getName()} launch dice and got ${rand}`)
      }
    } else {
      console.log(`${player.setCurrentScore(0).getName()} leave the hand`)
      this.resetDice().swapActivePlayer()
    }
    return this
  }

  holdScore() {
    let player = this.activePlayer()
    player
      .setGlobalScore(player.getCurrentScore() + player.getGlobalScore())
      .setCurrentScore(0)
    console.log(`${player.getName()} is holding ${player.getCurrentScore()} points`)
    this.swapActivePlayer().resetDice()
    return this
  }

  attatchEvent() {
    this.#root.querySelector('.new-game').addEventListener('click', () => {
      this.init()
    })

    let dice = this.#root.querySelector('.roll-dice')
    dice.addEventListener('click', this.rollDice.bind(this))

    let hold = this.#root.querySelector('.hold')
    hold.addEventListener('click', this.holdScore.bind(this))
    return this
  }

  destroyEvent() {
    let dice = this.#root.querySelector('.roll-dice')
    let hold = this.#root.querySelector('.hold')
    dice.remove()
    hold.remove()
    return this
  }

}

const player1 = new DicePlayer("player 1")
const player2 = new DicePlayer("player 2")

window.onload = () => {
  const game = new DiceGame(
    document.getElementById("root-dice-game"),
    player1, player2, {
    root: `
        <div id="player1" class="player"></div>
        <div id="game-cmd" class=""></div>
        <div id="player2" class="player"></div>
      `,
    cmd: `<div class="new-game mt-16 cursor-pointer">new game</div>
      <div class="dice-window"><div class="scene">
      <div class="dice">
        <div class="dice__face dice__face--front" d-face="1"></div>
        <div class="dice__face dice__face--right" d-face="2"></div>
        <div class="dice__face dice__face--top" d-face="3"></div>
        <div class="dice__face dice__face--left" d-face="4"></div>
        <div class="dice__face dice__face--bottom" d-face="5"></div>
        <div class="dice__face dice__face--back" d-face="6"></div>
      </div>
    </div></div>
      <div class="group mb-4">
        <div class="roll-dice cursor-pointer mb-8">roll dice</div>
        <div class="hold cursor-pointer">hold</div>
      </div>
      `

  }
  )
  game.init()
}