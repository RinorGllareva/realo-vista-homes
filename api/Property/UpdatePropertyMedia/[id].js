import sql from "mssql";

let poolPromise;

function getPool() {
  if (!process.env.SQLSERVER_URL) {
    throw new Error("SQLSERVER_URL is not configured");
  }

  if (!poolPromise) {
    poolPromise = sql.connect(process.env.SQLSERVER_URL);
  }

  return poolPromise;
}

async function ensurePropertyMediaColumns(pool) {
  await pool.request().query(`
    IF COL_LENGTH('dbo.Properties', 'FloorPlanUrl') IS NULL
      ALTER TABLE dbo.Properties ADD FloorPlanUrl NVARCHAR(1000) NULL;

    IF COL_LENGTH('dbo.Properties', 'VirtualTourUrl') IS NULL
      ALTER TABLE dbo.Properties ADD VirtualTourUrl NVARCHAR(1000) NULL;
  `);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid property id" });
  }

  try {
    const pool = await getPool();
    await ensurePropertyMediaColumns(pool);

    if (req.method === "GET") {
      const result = await pool
        .request()
        .input("PropertyId", sql.Int, id)
        .query(`
          SELECT PropertyId, FloorPlanUrl, VirtualTourUrl
          FROM dbo.Properties
          WHERE PropertyId = @PropertyId;
        `);

      const current = result.recordset?.[0];
      if (!current) return res.status(404).json({ error: "Property not found" });

      return res.status(200).json({
        propertyId: current.PropertyId,
        floorPlanUrl: current.FloorPlanUrl ?? "",
        virtualTourUrl: current.VirtualTourUrl ?? "",
      });
    }

    const result = await pool
      .request()
      .input("PropertyId", sql.Int, id)
      .input("FloorPlanUrl", sql.NVarChar(1000), req.body?.floorPlanUrl ?? "")
      .input("VirtualTourUrl", sql.NVarChar(1000), req.body?.virtualTourUrl ?? "")
      .query(`
        UPDATE dbo.Properties SET
          FloorPlanUrl = @FloorPlanUrl,
          VirtualTourUrl = @VirtualTourUrl
        WHERE PropertyId = @PropertyId;

        SELECT PropertyId, FloorPlanUrl, VirtualTourUrl
        FROM dbo.Properties
        WHERE PropertyId = @PropertyId;
      `);

    const updated = result.recordset?.[0];
    if (!updated) return res.status(404).json({ error: "Property not found" });

    return res.status(200).json({
      propertyId: updated.PropertyId,
      floorPlanUrl: updated.FloorPlanUrl ?? "",
      virtualTourUrl: updated.VirtualTourUrl ?? "",
    });
  } catch (error) {
    console.error("UpdatePropertyMedia error:", error);
    return res.status(500).json({ error: "Failed to save media links" });
  }
}
