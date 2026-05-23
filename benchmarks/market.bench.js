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
      card: cards[0].name,
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
      title: "market",
      url: `http://localhost:${PORT}`,
      connections: 500,
      duration: 5,

      requests: [
        {
          method: "POST",
          path: "/api/market",
          setupRequest: (req, context) => ({
            ...req,
            headers: {
              ...req.headers,
              "Content-Type": "application/json", // must set for json to be parsed by backend
              "x-user-seed": getNextUser(seeds).seed, // pass the user seed
            },
            body: JSON.stringify({
              // create market listing
              name: getCurrentUser(seeds).card,
              quantity: 1,
              price_per_card: 100,
            }),
          }),
        },
      ],
    },
    console.log,
  );
})();
