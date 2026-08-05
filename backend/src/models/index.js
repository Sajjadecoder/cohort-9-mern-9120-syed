import sequelize from "./database.js";

import User from "./User.js";
import Note from "./Note.js";

User.hasMany(Note, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Note.belongsTo(User, {
  foreignKey: "userId",
});

export default sequelize;
export { User, Note };