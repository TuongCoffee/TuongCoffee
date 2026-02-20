// import Character class from ./Character.ts
import Character from "./Character.ts";

//===== class player =====//
class Player extends Character {
    
    constructor(name: string, max_hp: number, atk: number) {
        super(name, max_hp, atk);
    }
    
    //===== new methods =====//
    attack(target: Character): void {
        target.takeDamage (this.atk);
    }
    
    heal(): void {
        this.hp += 10;
        
        if (this.hp > this.max_hp) this.hp = this.max_hp;
    }
}

// exporting class (module)
export default Player;
