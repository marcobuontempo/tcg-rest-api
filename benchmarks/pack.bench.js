import autocannon from "autocannon";

const PORT = 4000;
const CONNECTIONS = 50;
const DURATION = 30;

autocannon(
  {
    title: "register -> change username -> open pack",
    url: `http://localhost:${PORT}`,
    connections: CONNECTIONS,
    duration: DURATION,

    requests: [
      {
        method: "POST",
        path: "/api/register",
        onResponse: (status, body, context) => {
          if (status === 201) {
            context.seed = JSON.parse(body).seed; // store the user seed for subsequent requests
          }
        },
      },
      {
        method: "PATCH",
        path: "/api/users/me",
        setupRequest: (req, context) => ({
          ...req,
          headers: {
            ...req.headers,
            "Content-Type": "application/json", // must set for json to be parsed by backend
            "x-user-seed": context.seed, // pass the user seed
          },
          body: JSON.stringify({
            username: `test:${context.seed.slice(0, 4)}...`, // provide a substring of the seed as new username, just for a dynamic value
          }),
        }),
      },
      {
        method: "POST",
        path: "/api/packs/daily/open",
        setupRequest: (req, context) => ({
          ...req,
          headers: {
            ...req.headers,
            "x-user-seed": context.seed,
          },
        }),
      },
    ],
  },
  console.log,
);
