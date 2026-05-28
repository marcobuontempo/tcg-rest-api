import autocannon from "autocannon";

const PORT = 4000;
const CONNECTIONS = 5000;
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
            context.seed = JSON.parse(body).seed;
          }
        },
      },
    ],
  },
  console.log,
);
