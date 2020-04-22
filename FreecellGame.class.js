// Model implementation for a game of Freecell, having foundation, open, and cascade piles.
// Enforces the rules of the game, executes moves, and reports on game state.
// "private" methods that the controller and view do not depend on have names starting with _
class FreecellGame {
  constructor(numOpen, numCascade) {
    if (isNaN(parseInt(numOpen, 10)) || numOpen < 1 || numOpen > 52) {
      throw "Invalid number of open piles: " + numOpen;
    }
    if (isNaN(parseInt(numCascade, 10)) || numCascade < 1 || numCascade > 52) {
      throw "Invalid number of cascade piles: " + numCascade;
    }
    [numOpen, numCascade] = [parseInt(numOpen, 10), parseInt(numCascade, 10)];
    this.foundation = [];
    for(var k = 0; k < 4; k++) {
      this.foundation.push([]);
    }
    this.open = [];
    for(var k = 0; k < numOpen; k++) {
      this.open.push([]);
    }
    var deck = getDeck();
    this.cascade = [];
    for(var k = 0; k < numCascade; k++) {
      this.cascade.push([]);
    }
    for(var i = 0; i < deck.length; i++) {
      this.cascade[i % numCascade].push(deck[i]);
    }
  }

  getNumCascade() {
    return this.cascade.length;
  }
  getNumOpen() {
    return this.open.length;
  }
  getFoundation() {
    return this.foundation.map(p => p.slice());
  }
  getOpen() {
    return this.open.map(p => p.slice());
  }
  getCascade() {
    return this.cascade.map(p => p.slice());
  }

  // execute a move from srcPile, e.g. {type:"cascade", index: 0, cardIndex: 5}
  // to destPile, e.g. {type:"open", index: 3}
  // mutates the game state.
  executeMove(srcPile, destPile) {
    // .pop(): remove and return last element of array
    // .push(arg): add arg to end of array
    if (srcPile.type === "cascade") {
      if (destPile.type === "open") {
        this.open[destPile.index].push(this.cascade[srcPile.index].pop());
      }
      else if (destPile.type === "cascade") {
        var tempVar = this.cascade[srcPile.index].slice(srcPile.cardIndex);
        this.cascade[srcPile.index] = this.cascade[srcPile.index].slice(0, srcPile.cardIndex);
        this.cascade[destPile.index] = this.cascade[destPile.index].concat(tempVar);
      }
      else if (destPile.type === "foundation") {
        this.foundation[destPile.index].push(this.cascade[srcPile.index].pop());
      }
    }
    if (srcPile.type === "open") {
      if (destPile.type === "open") {
        this.open[destPile.index].push(this.open[srcPile.index].pop());
      }
      else if (destPile.type === "cascade") {
        this.cascade[destPile.index].push(this.open[srcPile.index].pop());
      }
      else if (destPile.type === "foundation") {
        this.foundation[destPile.index].push(this.open[srcPile.index].pop());
      }
    }
  }

  // attempt to stick the given card on either a foundation or an open
  // by finding whatever foundation pile is valid, or the first open pile.
  // return true if success, false if no automatic move available
  // mutates the game state if a move is available.
  attemptAutoMove(srcPile) {
    if (srcPile.type === "cascade") {
      if (this.getValidFoundation(srcPile) !== -1) {
        this.executeMove(srcPile, {type: "foundation", index: this.getValidFoundation(srcPile)});
        return true;
      }
      if (this.getFirstAvailableOpen() !== -1) {
        this.executeMove(srcPile, {type: "open", index: this.getFirstAvailableOpen()});
        return true;
      }
    }
    if (srcPile.type === "open") {
      if(this.getValidFoundation(srcPile) !== -1) {
        this.executeMove(srcPile, {type: "foundation", index: this.getValidFoundation(srcPile)});
        return true;
      }
    }
    return false;
  }

  // return index of first valid foundation destination for the given card,
  // or anything else if there is no valid foundation destination
  getValidFoundation(srcPile) {
    if (srcPile.type === "cascade") {
      for (let i = 0; i < 4; i++) {
        if (this.foundation[i].length === 0){
          if (this.cascade[srcPile["index"]][srcPile["cardIndex"]].value === 1) {
            return i;
          }
          else {
            return -1;
          }
        }
        else if (this.foundation[i][this.foundation[i].length - 1].suit
            === this.cascade[srcPile["index"]][srcPile["cardIndex"]].suit
            && this.foundation[i][this.foundation[i].length - 1].value
            === this.cascade[srcPile["index"]][srcPile["cardIndex"]].value - 1) {
          return i;
        }
      }
      return -1;
    }
    else if (srcPile.type === "open") {
      for (let i = 0; i < 4; i++) {
        if (this.foundation[i].length === 0){
          if (this.open[srcPile["index"]][0].value === 1) {
            return i;
          }
        }
        else if (this.foundation[i][this.foundation[i].length - 1].suit === this.open[srcPile["index"]][0].suit &&
            this.foundation[i][this.foundation[i].length - 1].value === this.open[srcPile["index"]][0].value - 1) {
          return i;
        }
      }
      return -1;
    }
    else {
      return -1;
    }
  }

  // return index of first empty open pile
  // or anything else if no empty open pile
  getFirstAvailableOpen() {
    for (var i = 0; i < this.getNumOpen(); i++) {
      if (this.open[i].length === 0) {
        return i;
      }
    }
    return -1;
  }

  // return true if in the given cascade pile, starting from given index, there is a valid "build"
  isBuild(pileIdx, cardIdx) {
    for (var i = cardIdx; i < this.cascade[pileIdx].length; i++) {
      if (i === this.cascade[pileIdx].length - 1) {
        return true;
      }
      else if (!FreecellGame._isStackable(this.cascade[pileIdx][i], this.cascade[pileIdx][i + 1])) {
        return false;
      }
    }
    return true;
  }

  // return true if the move from srcPile to destPile would be valid, false otherwise.
  // does NOT mutate the model.
  isValidMove(srcPile, destPile) {
    if (!srcPile || !destPile
      || (srcPile.type === destPile.type && srcPile.index === destPile.index)
      || srcPile.type === "foundation") {
      return false;
    }
    if (srcPile.type === "cascade") {
      if (destPile.type === "open") {
        if (this.getFirstAvailableOpen() === -1) {
          return false;
        }
        if (srcPile.cardIndex !== this.cascade[srcPile.index].length - 1) {
          return false;
        }
        if (Array.isArray(this.open[destPile.index]) && this.open[destPile.index].length !== 0) {
          return false;
        }
      }
      else if (destPile.type === "cascade") {
        if (this.cascade[destPile.index].length === 0) {
          return true;
        }
        if ((this.cascade[srcPile.index].length - srcPile.cardIndex) > this._numCanMove(destPile.index)) {
          return false;
        }
        if (!this.isBuild(srcPile.index, srcPile.cardIndex)) {
          return false
        }
        if (!FreecellGame._isStackable(this.cascade[destPile.index][this.cascade[destPile.index].length - 1],
                                       this.cascade[srcPile.index][srcPile.cardIndex])) {
          return false;
        }
      }
      else if (destPile.type === "foundation") {
        if (this.getValidFoundation(srcPile) === -1) {
          return false;
        }
      }
    }
    else if (srcPile.type === "open") {
      if (destPile.type === "cascade") {
        if (this.cascade[destPile.index].length === 0) {
          return true;
        }
        if (!FreecellGame._isStackable(this.cascade[destPile.index][this.cascade[destPile.index].length - 1],
            this.open[srcPile.index][0])) {
          return false;
        }
      }
      else if (destPile.type === "open") {
        if (this.open[destPile.index].length !== 0) {
          return false;
        }
      }
      else if (destPile.type === "foundation") {
        if (this.getValidFoundation(srcPile) === -1) {
          return false;
        }
      }
    }
    return true;
  }

  // suggested private methods
  _numCanMove(destPileIndex) {
    var numOpen = this.open.reduce((sum, c) => c.length === 0 ? sum + 1 : sum, 0);
    var numEmptyCascade = this.cascade.reduce((sum, c) => c.length === 0 ? sum + 1 : sum, 0);
    if(this.cascade[destPileIndex].length === 0) {
      numEmptyCascade--;  // subtract one empty pile if destination is empty
    // this is technically a rule of freecell though we glossed over it on HW4
    }
    return (numOpen + 1) * Math.pow(2, numEmptyCascade);
  }

  // is overCard stackable on top of underCard, according to solitaire red-black rules
  static _isStackable(underCard, overCard) {
    if (underCard instanceof Card && overCard instanceof Card) {
      return underCard.getValue() - 1 === overCard.getValue()
          && overCard.isBlack() !== underCard.isBlack();
    }
    else {
      return false;
    }
  }
}

// generate and return a shuffled deck (array) of Cards.
function getDeck() {
  var deck = [];
  var suits = ["spades", "clubs", "diamonds", "hearts"];
  for(var v = 13; v >= 1; v--) {
    for(s in suits) {
      deck.push(new Card(v, suits[s]));
    }
  }
  shuffle(deck);    // comment out this line to not shuffle
  return deck;
}

// shuffle an array: mutate the given array to put its values in random order
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a remaining element...
    let j = Math.floor(Math.random() * (i + 1));
    // And swap it with the current element.
    [array[i], array[j]] = [array[j], array[i]];
  }
}
