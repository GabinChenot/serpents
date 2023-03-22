let canvas = document.getElementById("terrain");
let ctx = canvas.getContext("2d");

let proportion = 5; // proportion de rochers en %
let taille = 20;
let longueur = 50 * taille;
let hauteur = 25 * taille;
let score = 0;
// let d = 0;
let nbSerpent = 7;
let TailleSerpent = 5;
let nbRochers = ((longueur/taille) * (hauteur/taille)) * (proportion/100);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max + 1));
}

// document.addEventListener("keydown", function (event) {
//   if (d == 1 || d == 3) {
//     if (event.keyCode === 38) {
//       // Flèche haut
//       d = 0;
//     } else if (event.keyCode === 40) {
//       // Flèche bas
//       d = 2;
//     }
//   } else {
//     if (event.keyCode === 37) {
//       // Flèche gauche
//       d = 3;
//     } else if (event.keyCode === 39) {
//       // Flèche droite
//       d = 1;
//     }
//   }
// });

class Terrain {
  constructor(l, h, ctx) {
    this.longueur = l;
    this.hauteur = h;
    longueur = l;
    hauteur = h;
    this.ctx = ctx;
    let sol = new Array(l/taille);
    this.sol = sol;
    for (let i = 0; i < l/taille; i++) {
      sol[i] = new Array(h/taille);
    }
    ctx.canvas.width = l;
    ctx.canvas.height = h;

    
    // On place la bordure
    for (let i = 0; i < l/taille; i++) {
      sol[i][0] = 2;
      sol[i][h/taille - 1] = 2;
    }
    for (let i = 0; i < h/taille; i++) {
      sol[0][i] = 2;
      sol[l/taille - 1][i] = 2;
    }
    
    // On place des rochers
    for (let i = 1; i < (l/taille)-1; i++) {
      for (let j = 1; j < (h/taille)-1; j++) {
        let x = getRandomInt(100);
        if (x < proportion) {
          sol[i][j] = 1;
        }
        else {
          sol[i][j] = 0;
        }
      }
    }
  }

  draw() {
    for (let i = 0; i < (longueur/taille); i++) {
      for (let j = 0; j < (hauteur/taille); j++) {
        switch (this.sol[i][j]) {
          case 1:
            ctx.fillStyle = "gray";
            ctx.fillRect(i*taille, j*taille, taille, taille);
            break;
          case 2:
            ctx.fillStyle = "black";
            ctx.fillRect(i*taille, j*taille, taille, taille);
          default:
            
            break;
        }
      }
    }
  }

  read(i, j) {
    return this.sol[i][j];
  }

  write(i, j, val) {
    this.sol[i][j] = val;
    this.draw();
  }

}

const terrain = new Terrain(longueur, hauteur, ctx);
terrain.draw();


class Anneau {
  constructor(i, j, color, ctx) {
    this.ctx = ctx;
    this.i = i;
    this.j = j;
    this.color = color;
  }

  clear() {
    ctx.clearRect(this.i, this.j, taille, taille);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.i, this.j, taille, taille);
  }
  move(d) {
    // this.clear();
    switch (d) {
      case 3: // Gauche
        this.i -= taille;
        if (this.i < 0) {
          this.i += longueur;
        }
        break;
      case 2: // Bas
        this.j = (this.j + taille) % hauteur; 
        break;
      case 1: // Droite
        this.i = (this.i + taille) % longueur; 
        break;
      case 0: // Haut
        this.j -= taille;
        if (this.j < 0) {
          this.j += hauteur;
        }
        break;
    }
    this.draw();
  }
  copy(a) {
    this.i = a.i;
    this.j = a.j;
  }

  read(d) {
    // console.log(d);
    switch (d) {
      case 0:
        if (this.j/taille - 1 < 0) {
          return 2; // On est face à une bordure
        }
        else {
          return terrain.read(this.i/taille,this.j/taille - 1);
        }
      case 1:
        return terrain.read((this.i/taille + 1)%(longueur/taille),this.j/taille);
      case 2:
        return terrain.read(this.i/taille,(this.j/taille + 1)%(hauteur/taille));
      case 3:
        if (this.i/taille - 1 < 0) {
          return 2; // On est face à une bordure
        }
        else {
          return terrain.read((this.i/taille - 1),this.j/taille);
        }
      default:
        return 2;
        break;
    }
  }

  getX() {
    return this.i;
  }
  getY() {
    return this.j;
  }
}

class Serpent {
  constructor(i, j, d, tableau) {
    // this.i = i;
    // this.j = j;
    this.d = d;
    this.tableau = tableau;
    this.tableau[0].color = "green";
    this.tableau[this.tableau.length - 1].color = "red";
  }

  draw() {
    this.tableau.forEach((element) => {
      element.draw();
    });
  }

  clear() {
    this.tableau.forEach((element) => {
      element.clear();
    });
  }
  move() {

    if (TailleSerpent>0) {
      TailleSerpent--;
      for (let i = 0; i < serpents.length; i++) {
        serpents[i].extend();
      }
    }
    
    // On écrit 2 et 0 sur la tete et la queue
    terrain.write(this.tableau[0].getX()/taille, this.tableau[0].getY()/taille, 2);
    terrain.write(this.tableau[this.tableau.length - 1].getX()/taille, this.tableau[this.tableau.length - 1].getY()/taille, 0);
    
    let x = getRandomInt(10);
    if (x < 1) {
      this.d = getRandomInt(3);
    }
    let caseDevant = this.tableau[0].read(this.d);
    while(caseDevant > 0) {
      // Changement spontané
      let x = getRandomInt(10);
      if (x < 3) {
        this.d = getRandomInt(3);
      }
      caseDevant = this.tableau[0].read(this.d);
    }

    
    switch (caseDevant) {
      case 2:
        this.d = getRandomInt(3);
        break;
      case 1:
        this.d = (this.d+1)%4;
        break;
      default:
          this.clear();
          const tableau2 = this.tableau.map((element) =>
          Array.isArray(element)
          ? [...element]
          : typeof element === "object"
          ? { ...element }
          : element
          );
          for (let i = 1; i < this.tableau.length; i++) {
            this.tableau[i].copy(tableau2[i - 1]);
        }
        this.tableau[0].move(this.d);
        break;
      }
    }
  changeDirection(d) {
    this.d = d;
  }
  extend() {
    const queue = this.tableau[this.tableau.length - 1];
    let queue2 = new Anneau(0, 0, "red", ctx);
    queue2.copy(queue);
    this.move();
    this.tableau.push(queue2);
    this.tableau[this.tableau.length - 2].color = "blue";
  }
}
// Identifiant du "timer"
let animationTimer = 0;
let starttime = 0;
// Fréquence d'affichage maximum
const maxfps = 10;
const interval = 1000 / maxfps;

function startRAF(timestamp = 0) {
  animationTimer = requestAnimationFrame(startRAF);
  if (starttime === 0) starttime = timestamp;
  let delta = timestamp - starttime;
  if (delta >= interval) {
    anim();
    // eatYourself();
    starttime = timestamp - (delta % interval);
  }
}

function stopRAF() {
  cancelAnimationFrame(animationTimer);
  animationTimer = 0;
}

let gameoverText = document.getElementById("gameover");

// function eatYourself() {
//   for (let i = 1; i < serpent1.tableau.length - 1; i++) {
//     // console.log(serpent1.tableau[0].i);
//     // console.log(serpent1.tableau[i].i);
//     // console.log(serpent1.tableau[0].j);
//     // console.log(serpent1.tableau[i].j);
//     if (
//       serpent1.tableau[0].i === serpent1.tableau[i].i &&
//       serpent1.tableau[0].j === serpent1.tableau[i].j
//     ) {
//       stopRAF();
//       gameoverText.style.display = "block";
//     }
//   }
// }

startRAF();

let anneau1 = new Anneau(100, 60, "blue", ctx);
let anneau2 = new Anneau(100, 80, "blue", ctx);
let anneau3 = new Anneau(100, 100, "blue", ctx);
let anneau4 = new Anneau(100, 120, "blue", ctx);
let anneau5 = new Anneau(100, 140, "blue", ctx);
let tableau = [anneau1, anneau2, anneau3, anneau4, anneau5];
let serpent1 = new Serpent(100, 100, 0, tableau);

let serpents = [];

for (let i = 0; i<nbSerpent; i++) {
  let anneau = new Anneau(getRandomInt((longueur/taille)-3)*taille + taille, getRandomInt((hauteur/taille)-3)*taille + taille, "blue", ctx);
  let tableauAnneau = [anneau];
  serpents.push(new Serpent(0, 0, getRandomInt(3), tableauAnneau));
}

serpents.push(serpent1);
function anim() {
  for (let i = 0; i < serpents.length; i++) {
    serpents[i].move();
    serpents[i].draw();
  }
}
