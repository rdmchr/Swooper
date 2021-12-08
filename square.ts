class Square {
    clicked: Boolean;
    flagged: Boolean;
    bomb: Boolean;
    public around?: Number;

    constructor() {
        this.clicked = false;
        this.flagged = false;
        this.bomb = false;
    }
}

export {
    Square,
};