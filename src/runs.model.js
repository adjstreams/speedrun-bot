export function runModel(sequelize, DataTypes) {
  const Runs = sequelize.define("runs", {
    discord_name: {
      type: DataTypes.STRING,
      unique: true,
    },
    run_time: DataTypes.INTEGER,
  });

  return Runs;
}
