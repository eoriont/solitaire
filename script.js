let deck = [];
let piles = [[], [], [], [], [], [], []];
let cursorCard;
let cursorCardPile;

var cardWidth = 50;
var cardHeight = 70;
var cardPaddingX = 10;
var cardPaddingY = 20;

function setup() {
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 4; j++) {
            deck.push({
                suit: j,
                number: i + 1,
                revealed: false,
                dragging: false
            })
        }
    }

    deck = shuffle(deck);

    for (let i = 0; i < piles.length; i++) {
        for (let j = 0; j < i + 1; j++) {
            piles[i].push(deck.pop());
        }
    }

    for (let pile of piles) {
        pile[pile.length - 1].revealed = true;
    }

    createCanvas(500, 500)
}

function draw() {
    background("white")
    // Piles
    for (let i = 0; i < piles.length; i++) {
        fill('white')
        rect(i * (cardWidth + cardPaddingX), 0, cardWidth, cardHeight)
        for (let j = 0; j < piles[i].length; j++) {
            let card = piles[i][j]
            if (!card.dragging) {
                drawCard(card, i * (cardWidth + cardPaddingX), j * cardPaddingY);
            } else {
                drawCard(card, mouseX, mouseY);
            }
        }
    }


    let pile = constrain(Math.floor(mouseX / (cardWidth + cardPaddingX)), 0, 6)
    let layer = constrain(Math.floor(mouseY / cardPaddingY), 0, piles[pile].length - 1)
    let card = piles[pile][layer]
    if (mouseIsPressed) {
        if (!cursorCard) {
            card.dragging = true
            cursorCard = card
            cursorCardPile = pile;
        }
    } else {
        if (cursorCard) {
            let ccPile = piles[cursorCardPile]
            // Drop card
            if (doesCardFitOnPile(cursorCard, card)) {
                let cards = popCard(cursorCardPile, cursorCard);
                piles[pile] = piles[pile].concat(cards)
                if (ccPile.length >= 1) {
                    ccPile[ccPile.length - 1].revealed = true
                }
            }
            cursorCard.dragging = false
            cursorCard = null;
            cursorCardPile = null;
        }
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
    if (card.revealed) {
        fill('azure')
        rect(x, y, cardWidth, cardHeight);
        fill('black')
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
    // true: red, false: black
    let oldCol = [0, 2].includes(oldCard.suit)
    let newCol = [0, 2].includes(newCard.suit)

    if (oldCol == newCol) return false;
    return oldCard.number == newCard.number + 1
}

function popCard(pile, card) {
    let cards = []
    while (cards[cards.length - 1] != card) {
        cards.push(piles[pile].pop())
    }
    return reverse(cards)
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