const RATE = 1; // requests per second
const DURATION_TARGET = 5000; // ms to attempt to run the test for

const count = {
  success: 0,
  failed: 0,
};

async function runIteration(i) {
  let success = true;
  let errorCodes = "";
  const start = performance.now();
  try {
    // REGISTER
    const registrationRes = await fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const registrationData = await registrationRes.json();
    const seed = registrationData?.seed;

    if (!seed) {
      console.error(`Missing seed on iteration ${i}`);
      throw Error();
    }
    if (!registrationRes.ok) errorCodes += `${registrationRes.status};`;

    // OPEN PACK
    const openPackRes = await fetch(
      "http://localhost:4000/api/packs/daily/open",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-seed": seed,
        },
      },
    );
    const openPackData = await openPackRes.json();
    if (!openPackRes.ok) errorCodes += `${openPackRes.status};`;

    // BATTLE
    const battleRes = await fetch("http://localhost:4000/api/battle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-seed": seed,
      },
      body: JSON.stringify({
        difficulty: 1,
        cards: openPackData.slice(0, 5).map((c) => c.name),
      }),
    });
    const battleData = await battleRes.json();
    if (!battleRes.ok) errorCodes += `${battleRes.status};`;

    // MARKET
    const marketRes = await fetch("http://localhost:4000/api/market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-seed": seed,
      },
      body: JSON.stringify({
        name: openPackData[5].name,
        quantity: 1,
        price_per_card: 999,
      }),
    });
    await marketRes.json();
    if (!marketRes.ok) errorCodes += `${marketRes.status};`;

    success =
      registrationRes.ok && openPackRes.ok && battleRes.ok && marketRes.ok;
  } catch (err) {
    success = false;
  }

  console.log(
    `Iteration ${i} ${success ? "success" : "failed"}${errorCodes.length > 0 ? ` [ERR:${errorCodes}]` : ""}`,
  );
  if (success) {
    count.success++;
  } else {
    count.failed++;
  }
}

const startTime = performance.now();

async function main() {
  const interval = 1000 / RATE;
  const requestsRequired = RATE * (DURATION_TARGET / 1000);
  let index = 1;

  await new Promise((resolve) => {
    const timer = setInterval(async () => {
      if (index > requestsRequired) {
        clearInterval(timer);
        resolve();
        return;
      }
      const current = index++;
      runIteration(current);
    }, interval);
  });

  // wait for all in-flight requests to complete
  await new Promise((resolve) => {
    const wait = setInterval(() => {
      if (count.success + count.failed >= requestsRequired) {
        clearInterval(wait);
        resolve();
      }
    }, 100);
  });

  const totalTime = (performance.now() - startTime) / 1000; // seconds
  const totalRequests = count.success + count.failed;

  console.log(
    `Complete -
    [${((count.success * 100) / totalRequests).toFixed(2)}%]
    [success=${count.success}]
    [failed=${count.failed}]
    [avg. rps=${(totalRequests / totalTime).toFixed(2)}]
    [total time=${totalTime.toFixed(2)}s]`,
  );
}

main();
