import sequelize from "./database.js";

import User from "./User.js";
import Note from "./Note.js";
import TokenBlacklist from "./TokenBlacklist.js";

User.hasMany(Note, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Note.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(TokenBlacklist, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

TokenBlacklist.belongsTo(User, {
  foreignKey: "userId",
});

export default sequelize;
export { User, Note, TokenBlacklist };