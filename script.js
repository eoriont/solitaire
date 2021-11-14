var deck;
var piles = [];
var acePiles = [];
var deckFlippedPile;
var cursorCard, cursorCardPile;
var cursorCardX, cursorCardY;

const cardWidth = 50;
const cardHeight = 70;
const cardPaddingX = 10;
const cardPaddingY = 20;

let score, moves;

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
    // Make deck (pos/layout don't matter)
    deck = new Pile(width - cardWidth, 0, "deck");
    deck.addCards(shuffle(createDeck()));

    // Add cards to each pile
    for (let i = 0; i < 7; i++) {
        let x = (cardWidth + cardPaddingX) * i;
        let pile = new Pile(x, 0, "fan");
        for (let j = 0; j < i + 1; j++) {
            pile.addCard(deck.popCard());
        }
        // Reveal the last card
        pile.revealLastCard();
        piles.push(pile);
    }

    // Make ace piles
    for (let i = 0; i < 4; i++) {
        let x = (cardWidth + cardPaddingX) * i;
        let pile = new Pile(x, height - cardHeight, "pile");
        acePiles.push(pile);
    }

    // Reveal all cards in the deck
    for (let card of deck.cards) {
        card.revealed = true
    }

    deckFlippedPile = new Pile(width - cardWidth, cardHeight + cardPaddingY, "3fan");
}

function setup() {
    // Setup score
    score = 0;
    moves = 0;

    // Put canvas in div#markdown
    let c = createCanvas(500, 500);
    document.getElementById("markdown").appendChild(c.elt);

    setupPiles();
}

function draw() {
    renderPiles();
    handleMouse();
    drawScores();
}

function drawScores() {
    fill("black")
    stroke("black")
    textSize(20)
    textAlign(LEFT)
    text(`Time: ${Math.floor(millis() / 1000)}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 15)
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
        cursorArea = null;
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
    if (mouseX > width - cardWidth && mouseY < cardHeight) {
        if (deck.cards.length == 0) {
            deck.addCards(deckFlippedPile.popCards(deckFlippedPile.cards.length));
        } else {
            deckFlippedPile.addCards(deck.popCards(3));
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
                    // Add offsets here
                    drawCard(card, mouseX, mouseY);
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
                // Add offsets here
                drawCard(card, mouseX, mouseY);
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
            } else if (this.layout == "pile") {
                return mouseY < this.y + cardHeight;
            }
        }
        return false;
    }

    getCursorCard() {
        if (["pile", "3fan"].includes(this.layout)) {
            return this.cards.length - 1;
        } else if (this.layout == "fan") {
            let y = mouseY - this.y
            let firstRevealed = this.getFirstRevealedCard();
            return constrain(Math.floor(y / cardPaddingY), firstRevealed, this.cards.length - 1);
        }
    }

    getFirstRevealedCard() {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].revealed) return i;
        }
        return 0;
    }
}