const db = require("../db");

// GET ALL
exports.getAll = async () => {
  const { rows } = await db.query(
    "SELECT * FROM public.recipe_items ORDER BY id DESC"
  );
  return rows;
};

// GET BY ID
exports.getById = async (id) => {
  const { rows } = await db.query(
    "SELECT * FROM public.recipe_items WHERE id = $1",
    [id]
  );
  return rows[0];
};

// CREATE
exports.create = async (item) => {
  const { rows } = await db.query(
    `INSERT INTO public.recipe_items
     (name, quantity, category, price, image, image_id, description, tax)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      item.name,
      item.quantity,
      item.category,
      item.price,
      item.image,
      item.image_id,
      item.description,
      item.tax,
    ]
  );
  return rows[0];
};

// UPDATE
exports.update = async (id, data) => {
  const { rows } = await db.query(
    `UPDATE public.recipe_items SET
      name=$1,
      quantity=$2,
      category=$3,
      price=$4,
      image=$5,
      image_id=$6,
      description=$7,
      tax=$8,
      updated_at=CURRENT_TIMESTAMP
     WHERE id=$9
     RETURNING *`,
    [
      data.name,
      data.quantity,
      data.category,
      data.price,
      data.image,
      data.image_id,
      data.description,
      data.tax,
      id,
    ]
  );
  return rows[0];
};

// DELETE
exports.delete = async (id) => {
  await db.query("DELETE FROM public.recipe_items WHERE id=$1", [id]);
};
