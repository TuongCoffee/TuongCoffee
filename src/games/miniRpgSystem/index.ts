//===== importing stuffs =====//
import Player from "./Player.ts";
import Enemy from "./Enemy.ts";

//===== testing time =====//
const hero = new Player("Hero", 120, 20);
const enemy = new Enemy(2);

hero.attack(enemy);
hero.heal();
hero.attack(enemy);

console.log(hero.getHp());
console.log(enemy.getHp());
console.log(enemy.isAlive());
