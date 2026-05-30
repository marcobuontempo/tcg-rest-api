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
      cards: cards.map((c) => c.name),
    };
  });

  return Promise.all(requests);
};

(async () => {
  const users = [];
  for (let i = 0; i < 1000; i++) {
    users.push(...(await generateUsers()));
  }

  let connectionIndex = 0;

  autocannon(
    {
      title: "battle",
      url: `http://localhost:${PORT}`,
      connections: CONNECTIONS,
      duration: DURATION,

      requests: [
        {
          method: "POST",
          path: "/api/battle",
          setupRequest: (req, context) => {
            if (!context.user) {
              context.user = users[connectionIndex++ % users.length];
            }
            const cards = [...context.user.cards].slice(0, 5);

            return {
              ...req,
              headers: {
                ...req.headers,
                "Content-Type": "application/json",
                "x-user-seed": context.user.seed,
              },
              body: JSON.stringify({
                difficulty: 1,
                cards,
              }),
            };
          },
          onResponse: (status, body, context) => {
            if (status === 200) {
              const result = JSON.parse(body);
              if (result.burned_card) {
                const index = context.user.cards.indexOf(
                  result.burned_card.name,
                );
                if (index !== -1) {
                  context.user.cards.splice(index, 1);
                }
              }
            }
          },
        },
      ],
    },
    console.log,
  );
})();
