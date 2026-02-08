abstract class Character {
    
    private name: string;
    protected hp: number;
    protected max_hp: number;
    protected atk: number;
    
    constructor(name: string, hp: number, atk: number) {
        this.name = name;
        this.max_hp = hp;
        this.hp = this.max_hp
        this.atk = atk;
    }
    
    //===== methods =====//
    getName(): string {
        return this.name;
    }
    
    getHp(): number {
        return this.hp;
    }
    
    getMaxHp(): number {
        return this.max_hp;
    }
    
    isAlive(): boolean {
        return this.hp !== 0;
    }
    
    takeDamage(amount: number): void {
        if (amount <= 0) return;
        
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
}

// exporting class (module)
export default Character;
