import autocannon from "autocannon";

const PORT = 4000;

autocannon(
  {
    url: `http://localhost:${PORT}`,
    connections: 100,
    duration: 10,

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
            username: context.seed, // provide the seed as new username, just for a dynamic value
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
