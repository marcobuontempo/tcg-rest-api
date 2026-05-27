const REQUESTS = 1000;
const CONCURRENCY = 25;

const count = {
  success: 0,
  failed: 0,
};

let successTime = 0;

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

    console.log(battleData.result ?? battleData.message, seed);

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

    success = registrationRes.ok && battleRes.ok && marketRes.ok;
  } catch (err) {
    success = false;
  }

  console.log(
    `Iteration ${i} ${success ? "success" : "failed"}${errorCodes.length > 0 ? ` [ERR:${errorCodes}]` : ""}`,
  );
  if (success) {
    count.success++;
    successTime += performance.now() - start;
  } else {
    count.failed++;
  }
}

async function main() {
  let index = 0;

  async function worker(workerId) {
    while (index < REQUESTS) {
      const current = index++;
      await runIteration(current);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  console.log(
    `Complete - 
    [${(count.success * 100) / (count.success + count.failed).toFixed(2)}%]
    [success=${count.success}] 
    [failed=${count.failed}]
    [avg. req: ${successTime / count.success}]`,
  );
}

main();
