import autocannon from "autocannon";

const PORT = 4000;

const generateSeeds = async () => {
  const requests = Array.from({ length: 10000 }, async () => {
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
        headers: {
          ["x-user-seed"]: user.seed,
        },
      },
    );

    const cards = await packResult.json();
    return {
      seed: user.seed,
      cards: cards.slice(0, 5).map((c) => c.name),
    };
  });

  return Promise.all(requests);
};

let clientNo = -1;
const getNextUser = (seeds) => {
  clientNo++;
  return seeds[clientNo % seeds.length];
};
const getCurrentUser = (seeds) => {
  return seeds[clientNo % seeds.length];
};

(async () => {
  const seeds = await generateSeeds();

  autocannon(
    {
      url: `http://localhost:${PORT}`,
      connections: 10,
      duration: 10,

      requests: [
        {
          method: "POST",
          path: "/api/battle",
          setupRequest: (req, context) => ({
            ...req,
            headers: {
              ...req.headers,
              "Content-Type": "application/json", // must set for json to be parsed by backend
              "x-user-seed": getNextUser(seeds).seed, // pass the user seed
            },
            body: JSON.stringify({
              difficulty: 1,
              cards: getCurrentUser(seeds).cards, // provide the cards to play with
            }),
          }),
        },
      ],
    },
    console.log,
  );
})();
