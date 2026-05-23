import autocannon from "autocannon";

const PORT = 4000;
const CONNECTIONS = 50;
const DURATION = 10;

const generateUsers = async () => {
  const requests = Array.from({ length: CONNECTIONS }, async () => {
    const registerResult = await fetch(
      `http://localhost:${PORT}/api/register`,
      {
        method: "POST",
      },
    );

    const user = await registerResult.json();

    const packResult = await fetch(
      `http://localhost:${PORT}/api/packs/daily/open`,
      {
        method: "POST",
        headers: { "x-user-seed": user.seed },
      },
    );

    const cards = await packResult.json();

    return {
      seed: user.seed,
      cards: cards,
    };
  });

  return Promise.all(requests);
};

(async () => {
  const users = await generateUsers();
  for (let i = 0; i < 100; i++) {
    users.push(...(await generateUsers()));
  }
  console.log("DONE")
  const cardIndexes = new Array(users.length).fill(0);

  let connectionIndex = 0;

  autocannon(
    {
      title: "market",
      url: `http://localhost:${PORT}`,
      connections: CONNECTIONS,
      duration: DURATION,

      requests: [
        {
          method: "POST",
          path: "/api/market",
          setupRequest: (req, context) => {
            const userIndex = connectionIndex++ % users.length;
            if (!context.user) {
              context.user = users[userIndex];
            }
            const cardIndex =
              cardIndexes[userIndex] % context.user.cards.length;
            context.card = context.user.cards[cardIndex];
            cardIndexes[userIndex]++;
            return {
              ...req,
              headers: {
                ...req.headers,
                "Content-Type": "application/json",
                "x-user-seed": context.user.seed,
              },
              body: JSON.stringify({
                name: context.card.name,
                quantity: 1,
                price_per_card: 100,
              }),
            };
          },
        },
      ],
    },
    console.log,
  );
})();
