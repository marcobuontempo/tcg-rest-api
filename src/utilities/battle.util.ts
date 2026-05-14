import { cache } from "../cache/index.js";
import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";

export const generateCardList = (difficulty: number, cardCount = 5) => {
  const pool = cache.battle.difficultyPools.get(difficulty);

  if (!pool || pool.length === 0) {
    throw new Error(`no cards found for difficulty ${difficulty}`);
  }

  const result: typeof pool = [];

  for (let i = 0; i < cardCount; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    result.push(pool[randomIndex]);
  }

  return result;
};

type BattleParticipants = "player" | "opponent";

type BattleBaseEvent = {
  message: string;
};

type BattleStateEvent = BattleBaseEvent & {
  state: "start" | "end" | "result";
};

type BattleAttackEvent = BattleBaseEvent & {
  state: "playing";
  turn: number;
  current_attacker: BattleParticipants;
  attack_amount: number;
  type_effective: string;
};

type BattleEvent = BattleStateEvent | BattleAttackEvent;

export const simulateBattle = (
  playerCards: Card["dataValues"][],
  opponentCards: Card["dataValues"][],
) => {
  const battleLog: BattleEvent[] = [];

  let currentAttacker: BattleAttackEvent["current_attacker"] =
    Math.random() > 0.5 ? "player" : "opponent";
  let currentDefender: BattleAttackEvent["current_attacker"] =
    currentAttacker === "player" ? "opponent" : "player";

  battleLog.push({
    state: "start",
    message: `${currentAttacker} won the coin toss and will attack first`,
  });

  let cardCount = {
    player: playerCards.length,
    opponent: opponentCards.length,
  };

  // keep a copy of attack/defense to track rolling stats during battle
  let currentCard = {
    player: {
      card: playerCards[cardCount.player - 1],
      health: playerCards[cardCount.player - 1].defense,
    },
    opponent: {
      card: opponentCards[cardCount.opponent - 1],
      health: opponentCards[cardCount.opponent - 1].defense,
    },
  };

  let turnCount = 1;
  while (
    cardCount.player > 0 &&
    cardCount.opponent > 0 &&
    turnCount <= config.game.maxBattleTurns
  ) {
    const attacker =
      currentAttacker === "player" ? currentCard.player : currentCard.opponent;
    const defender =
      currentDefender === "player" ? currentCard.player : currentCard.opponent;

    // determine type effectiveness
    const attackMultiplier =
      cache.cards.typeAdvantages.get(
        `${attacker.card.type}:${defender.card.type}`,
      ) || 1;
    let attackAdvantage = "normal";
    switch (attackMultiplier) {
      case config.cards.typeAdvantageEffects.normal:
        attackAdvantage = "normal";
        break;
      case config.cards.typeAdvantageEffects.notEffective:
        attackAdvantage = "not effective";
        break;
      case config.cards.typeAdvantageEffects.superEffective:
        attackAdvantage = "super effective";
        break;
    }

    // add randomness to attack
    const attackVariance = Math.random() * (1.05 - 0.95) + 0.95;

    // determine attack amount
    const attackEffectiveAmount = Math.round(
      attacker.card.attack * attackMultiplier * attackVariance,
    );
    defender.health -= attackEffectiveAmount;

    let attackMessage = `${attacker.card.name} (${currentAttacker}) attacked ${defender.card.name} (${currentDefender})`;
    if (defender.health <= 0) {
      attackMessage += ` - ${defender.card.name} feinted`;
    }

    battleLog.push({
      state: "playing",
      turn: turnCount,
      current_attacker: currentAttacker,
      attack_amount: attackEffectiveAmount,
      type_effective: attackAdvantage,
      message: attackMessage,
    });

    if (defender.health <= 0) {
      if (currentDefender === "opponent") {
        cardCount.opponent -= 1;
        if (cardCount.opponent > 0) {
          currentCard.opponent = {
            card: opponentCards[cardCount.opponent - 1],
            health: opponentCards[cardCount.opponent - 1].defense,
          };
        }
      } else if (currentDefender === "player") {
        cardCount.player -= 1;
        if (cardCount.player > 0) {
          currentCard.player = {
            card: playerCards[cardCount.player - 1],
            health: playerCards[cardCount.player - 1].defense,
          };
        }
      }
    }

    // swap attacker and defender
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];

    turnCount += 1;
  }

  let winner: BattleParticipants = "opponent";
  if (turnCount >= config.game.maxBattleTurns) {
    if (cardCount.player > 0 && cardCount.opponent > 0) {
      battleLog.push({
        state: "end",
        message: `${config.game.maxBattleTurns} turn-limit reached`,
      });
    }
    if (cardCount.player === cardCount.opponent) {
      battleLog.push({
        state: "end",
        message:
          "player/opponent have the same remaining cards - coin flip to determine winner...",
      });
      winner = Math.random() > 0.5 ? "player" : "opponent";
    } else {
      winner = cardCount.player > cardCount.opponent ? "player" : "opponent";
    }
  } else {
    if (cardCount.player === 0) {
      battleLog.push({
        state: "end",
        message: "player has no cards left",
      });
      winner = "opponent";
    } else if (cardCount.opponent === 0) {
      battleLog.push({
        state: "end",
        message: "opponent has no cards left",
      });
      winner = "player";
    }
  }

  battleLog.push({
    state: "result",
    message: `${winner} wins!`,
  });

  return {
    winner,
    battleLog,
  };
};
