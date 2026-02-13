// importing class Character
import Character from "./Character.ts";

//===== class enemy =====//
class Enemy extends Character {
    
    constructor(level: number) {
        super("Enemy", level * 50, level * 12);
    }
    
    //===== overriding method =====//
    takeDamage(amount: number): void {
        this.hp -= amount * 0.8;
    }
}

// exporting class
export default Enemy;
