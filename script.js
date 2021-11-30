var deck;
var piles;
var acePiles;
var deckFlippedPile;
var cursorCard, cursorCardPile;
var cursorCardX, cursorCardY;
var buttons;
var startMillis;

const cardWidth = 50;
const cardHeight = 70;
const cardPaddingX = screen.width < 500 ? 0 : 10;
const cardPaddingY = 20;

var won;

var score, moves;

function createDeck() {
    let deck = [];
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 4; j++) {
            deck.push({
                suit: j,
                number: i + 1,
                revealed: false,
                dragging: false
            });
        }
    }
    return deck;
}

function setupPiles() {
    // Make deck
    if (500 > screen.width) {
        // Mobile
        deck = new Pile(0, height - 2 * cardHeight - 3 * cardPaddingY, "deck");
        deckFlippedPile = new Pile(cardWidth + cardPaddingX, height - 2 * cardHeight - 3 * cardPaddingY, "3fan");
    } else {
        deck = new Pile(width - cardWidth, 0, "deck");
        deckFlippedPile = new Pile(width - cardWidth, cardHeight + cardPaddingY, "3fan");
    }
    deck.addCards(shuffle(createDeck()));

    // Add cards to each pile
    piles = [];
    for (let i = 0; i < 7; i++) {
        let x = (cardWidth + cardPaddingX) * i;
        let pile = new Pile(x, 0, "fan");
        for (let j = 0; j < i + 1; j++) {
            // Comment this out for cheat win
            pile.addCard(deck.popCard());
        }
        // Reveal the last card
        pile.revealLastCard();
        piles.push(pile);
    }

    // Make ace piles
    acePiles = [];
    for (let i = 0; i < 4; i++) {
        let x = (cardWidth + cardPaddingX) * i;
        let pile = new Pile(x, height - cardHeight, "pile");
        acePiles.push(pile);
    }

    // Reveal all cards in the deck
    for (let card of deck.cards) {
        card.revealed = true;
    }

    // Cheat win
    // Comment out the normal piles thing
    // for (let p of acePiles) {
    //     for (let i = 0; i < 13; i++) {
    //         p.addCard(deck.popCard())
    //     }
    // }
}

function setupButtons() {
    buttons = [];
    let restart = new Button(width - 50, height - 50, 50, 50, "Restart");
    restart.setClickEvent(startGame);
    buttons.push(restart);
}

function startGame() {
    // Setup score
    score = 0;
    moves = 0;

    cursorCardX = 0;
    cursorCardY = 0;

    startMillis = millis();
    won = false;

    setupPiles();
    setupButtons();

    loop();
}

function setup() {
    // Put canvas in div#markdown
    let c = createCanvas(min(screen.width - 32, 500), 500);
    document.getElementById("markdown").appendChild(c.elt);

    startGame();
}

function draw() {
    renderPiles();
    handleMouse();
    drawScores();
    renderButtons();
    won = checkWin();
    if (won) {
        winGame();
    }
}

function renderButtons() {
    for (let button of buttons) {
        button.render();
    }
}

function drawScores() {
    fill("black")
    stroke("black")
    textSize(20)
    textAlign(LEFT)
    text(`Time: ${Math.floor((millis() - startMillis) / 1000)}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 15)
    text(`Score: ${score}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 35)
    text(`Moves: ${moves}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 55)
}

function handleMouse() {
    let pile, card;
    for (let p of [deckFlippedPile, ...piles, ...acePiles]) {
        if (p.mouseCollision()) {
            pile = p;
            card = p.cards[p.getCursorCard()];
        }
    }

    // Handle picking up
    if (mouseIsPressed && !cursorCard) {
        if (card && card.revealed) {
            card.dragging = true;
            cursorCard = card;
            cursorCardPile = pile;
        }
    }

    // Handle dropping
    if (!mouseIsPressed && cursorCard) {
        if (pile) {
            if (pile.layout == "fan" && doesCardFitOnPile(cursorCard, card)
                || pile.layout == "pile" && doesCardFitOnAcePile(cursorCard, card)) {
                let cards = cursorCardPile.popUntil(cursorCard);
                pile.addCards(cards);
                cursorCardPile.revealLastCard();

                // Update score
                moves++;
                score += 10;
            }
        }
        //TODO: Only stacks of 1 can go onto ace pile

        // Reset cursor state
        cursorCard.dragging = false;
        cursorCard = null;
        cursorCardPile = null;
        cursorCardX = 0;
        cursorCardY = 0;
    }
}

function getSuit(card) {
    return {
        0: "D",
        1: "C",
        2: "H",
        3: "S"
    }[card.suit]
}

function drawCard(card, x, y) {
    if (card.revealed || keyIsDown(32) && card.number) {
        fill('azure')
        rect(x, y, cardWidth, cardHeight);

        fill('black')
        if (["D", "H"].includes(getSuit(card))) {
            fill("red")
        }
        textSize(16);
        textAlign(LEFT);
        text(enLang(card), x + 2, y + 15)
        textAlign(RIGHT);
        text(enLang(card), x + 48, y + 68)

        let suit = getSuit(card);
        noStroke()
        if (suit == "D") {
            fill("red")
            push();
            translate(x + 25, y + 20);
            rotate(PI / 4)
            rect(0, 0, 20, 20)
            pop();
        } else if (suit == "C") {
            fill("black")
            push()
            translate(x + 25, y + 20);
            rect(-3, 8, 6, 20)
            ellipse(0, 5, 15, 15);
            ellipse(-8, 15, 15, 15);
            ellipse(8, 15, 15, 15);
            pop();
        } else if (suit == "H") {
            fill("red")
            push();
            translate(x + 25, y + 25);
            ellipse(-8, 7, 20, 20);
            ellipse(8, 7, 20, 20);
            rotate(PI / 4)
            rect(1, 1, 20, 20)
            pop()
        } else if (suit == "S") {
            fill("black")
            push();
            translate(x + 25, y + 15);
            ellipse(-8, 20, 18, 18);
            ellipse(8, 20, 18, 18);
            rect(-3, 20, 6, 15)
            rotate(PI / 4)
            rect(0, 0, 20, 20)
            pop()
        }
        stroke("black")
    } else {
        fill('lightblue')
        rect(x, y, 50, 70);
    }
}

function doesCardFitOnPile(newCard, oldCard) {
    if (!oldCard) return newCard.number == 13;
    // true: red, false: black
    let oldCol = [0, 2].includes(oldCard.suit)
    let newCol = [0, 2].includes(newCard.suit)

    if (oldCol == newCol) return false;
    return oldCard.number == newCard.number + 1
}

function enLang(card) {
    return {
        1: "A",
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: "J",
        12: "Q",
        13: "K"
    }[card.number];
}

function doesCardFitOnAcePile(newCard, oldCard) {
    if (!oldCard) return newCard.number == 1
    if (newCard.suit != oldCard.suit) return false;
    return newCard.number == oldCard.number + 1
}

function mousePressed() {
    if (deck.mouseCollision()) {
        if (deck.cards.length == 0) {
            deck.addCards(deckFlippedPile.popCards(deckFlippedPile.cards.length));
        } else {
            deckFlippedPile.addCards(deck.popCards(3));
        }
        moves++;
    }
    for (let button of buttons) {
        if (button.mouseCollision()) {
            button.actuate();
        }
    }
}

document.addEventListener("keypress", e => e.preventDefault())

function renderPiles() {
    clear();

    // Piles
    for (let pile of piles) {
        pile.render()
    }

    // Ace Piles
    for (let pile of acePiles) {
        pile.render()
    }

    // Deck
    deck.render();

    // Revealed deck (flipped pile)
    deckFlippedPile.render();

    // Dragging Cards
    if (cursorCard) {
        // Get cards in cursor pile without mutating the original pile
        let cursorCardsPile = cursorCardPile.popUntil(cursorCard);
        cursorCardPile.addCards(cursorCardsPile);
        for (let i = 0; i < cursorCardsPile.length; i++) {
            let card = cursorCardsPile[i]
            if (!card) debugger;
            drawCard(card, mouseX - cursorCardX, mouseY - cursorCardY + cardPaddingY * i);
        }
    }
}

class Pile {
    constructor(x, y, layout) {
        this.x = x;
        this.y = y;
        this.cards = [];
        this.layout = layout;
    }

    addCard(card) {
        this.cards.push(card);
    }

    addCards(cards) {
        this.cards = this.cards.concat(cards);
    }

    popCard() {
        return this.cards.pop();
    }

    popUntil(card) {
        let cards = []
        while (cards[cards.length - 1] != card) {
            cards.push(this.popCard())
        }
        return reverse(cards)
    }

    popCards(n) {
        return reverse(this.cards.splice(-n, n));
    }

    revealLastCard() {
        if (this.cards.length == 0) return
        this.cards[this.cards.length - 1].revealed = true;
    }

    render() {
        fill('white')
        rect(this.x, this.y, cardWidth, cardHeight);

        if (this.layout == "deck") {
            if (deck.cards.length > 0) {
                drawCard({ revealed: false }, this.x, this.y)
            }
            return;
        }

        // For piles, just draw the last card if it exists
        if (this.layout == "pile") {
            if (this.cards.length > 0) {
                let card = this.cards[this.cards.length - 1]
                if (!card.dragging) {
                    drawCard(card, this.x, this.y)
                } else {
                    if (this.cards.length > 1) {
                        drawCard(this.cards[this.cards.length - 2], this.x, this.y)
                    }
                }
            }
            return;
        }

        // For fans and 3fans
        let len = min(this.cards.length, 3)
        for (let i = 0; i < (this.layout == "3fan" ? len : this.cards.length); i++) {
            let card = this.cards[this.layout == "3fan" ? this.cards.length - len + i : i]
            if (!card) debugger;
            if (!card.dragging) {
                drawCard(card, this.x, this.y + cardPaddingY * i);
            } else {
                break;
            }
        }
    }

    mouseCollision() {
        if (mouseX > this.x && mouseX < this.x + cardWidth
            && mouseY > this.y) {
            if (this.layout == "fan") {
                return mouseY < this.y + cardHeight + cardPaddingY * (this.cards.length - 1);
            } else if (this.layout == "3fan") {
                return mouseY < this.y + cardHeight + cardPaddingY * 2;
            } else if (this.layout == "pile" || this.layout == "deck") {
                return mouseY < this.y + cardHeight;
            }
        }
        return false;
    }

    getCursorCard() {
        if (["pile", "3fan"].includes(this.layout)) {
            // Set card offset
            if (!cursorCard) {
                cursorCardX = mouseX - this.x;
                cursorCardY = mouseY - this.y;
                if (this.layout == "3fan") {
                    cursorCardY -= 2 * cardPaddingY;
                }
            }

            return this.cards.length - 1;
        } else if (this.layout == "fan") {
            let y = mouseY - this.y
            let firstRevealed = this.getFirstRevealedCard();
            let num = constrain(Math.floor(y / cardPaddingY), firstRevealed, this.cards.length - 1);

            if (!cursorCard) {
                cursorCardX = mouseX - this.x;
                cursorCardY = y - num * cardPaddingY;
            }

            return num;
        }
    }

    getFirstRevealedCard() {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].revealed) return i;
        }
        return 0;
    }
}

class Button {
    constructor(x, y, w, h, text) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.clicked = null;
        this.text = text;
    }

    setClickEvent(f) {
        this.clicked = f;
    }

    mouseCollision() {
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }

    actuate() {
        this.clicked.bind(this)();
    }

    render() {
        fill("#FAD7A0");
        rect(this.x, this.y, this.w, this.h);
        fill("black");
        textAlign(CENTER);
        textSize(14);
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 4);
    }
}

function checkWin() {
    for (let p of acePiles) {
        if (p.cards.length != 13) {
            return false
        }
    }
    return true
}

function winGame() {
    fill("green")
    textSize(50)
    text("You Win!", width / 2, height / 2);
    noLoop();
}