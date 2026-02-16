const { Client } = require("pg");
(async () => {
  try {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const res = await c.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='plan_updated_at'",
    );
    console.log("result:", JSON.stringify(res.rows));
    await c.end();
  } catch (err) {
    console.error("error:", err);
    process.exit(1);
  }
})();
